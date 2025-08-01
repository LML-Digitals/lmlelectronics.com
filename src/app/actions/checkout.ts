"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/config/authOptions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateCustomer } from "@/components/dashboard/customers/services/customerCrud";
import bcrypt from "bcryptjs";
import { adjustStockLevel, adjustStockLevelFromOrder } from "@/components/dashboard/inventory/items/services/itemsCrud";
import { deductBundleStockByItemId } from "@/components/dashboard/inventory/bundles/services/bundles";

// Type for customer data for guest checkout
export type GuestCustomerData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

// Type for shipping address data
export type ShippingAddressData = {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  shippingMethod: string;
  shippingRate: number;
};

// Type for the cart data coming from the client
export type CheckoutData = {
  items: any[];
  paymentMethod: string;
  // location: string;
  customerId?: string | null;
  isGuestCheckout?: boolean;
  customerData?: GuestCustomerData;
  shippingAddress: ShippingAddressData;
  discountAmount?: number;
  discountType?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
};

// Type for the return value
export type OrderCreationResult = {
  success: boolean;
  message: string;
  orderId?: string;
  customerId?: string;
};

/**
 * Server action to create an Order when checkout is completed
 * Handles both authenticated users and guest checkout
 */
export async function createOrderFromCheckout(
  checkoutData: CheckoutData
): Promise<OrderCreationResult> {
  try {
    const session = await getServerSession(authOptions);
    let customerId = checkoutData.customerId || session?.user?.id;

    // Handle guest checkout - create customer account
    if (checkoutData.isGuestCheckout && checkoutData.customerData) {
      const { firstName, lastName, email, phone } = checkoutData.customerData;

      // Check if customer already exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { email },
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer for guest checkout
        const hashedPassword = await bcrypt.hash(
          Math.random().toString(36),
          10
        ); // Random password

        const newCustomer = await prisma.customer.create({
          data: {
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            isActive: true,
            // location: checkoutData.location,
          },
        });

        customerId = newCustomer.id;
      }
    }

    if (!customerId) {
      return {
        success: false,
        message: "Customer information is required",
      };
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        shippingAddress: true,
      },
    });

    if (!customer) {
      return {
        success: false,
        message: "Customer not found",
      };
    }

    // Create or update shipping address
    if (checkoutData.shippingAddress) {
      const shippingData = checkoutData.shippingAddress;

      if (customer.shippingAddress) {
        // Update existing shipping address
        await prisma.shippingAddress.update({
          where: { customerId: customer.id },
          data: {
            fullName: shippingData.fullName,
            addressLine1: shippingData.addressLine1,
            addressLine2: shippingData.addressLine2,
            city: shippingData.city,
            state: shippingData.state,
            zipCode: shippingData.zipCode,
            phone: shippingData.phone,
            shippingMethod: shippingData.shippingMethod,
            shippingRate: shippingData.shippingRate,
          },
        });
      } else {
        // Create new shipping address
        await prisma.shippingAddress.create({
          data: {
            ...shippingData,
            customerId: customer.id,
          },
        });
      }
    }

    // Map location string to actual storeLocationId
    const storeLocation = await prisma.storeLocation.findFirst({
      where: {
        name: "Seattle",
        isActive: true,
      },
    });

    if (!storeLocation) {
      return {
        success: false,
        message: `Store location not found`,
      };
    }

    // Update customer with latest location preference
    // await updateCustomer(customer.id, {
    //   // location: checkoutData.location,
    // });

    // Create Order (only when checkout is completed)
    const order = await prisma.order.create({
      data: {
        status: "PAID", // E-commerce orders are paid immediately
        total: checkoutData.total,
        subtotal: checkoutData.subtotal,
        taxAmount: checkoutData.taxAmount,
        discountAmount: checkoutData.discountAmount || 0,
        discountType: checkoutData.discountType as any, // Type assertion for DiscountType enum
        paymentMethod: checkoutData.paymentMethod,
        customerId: customerId,
        storeLocationId: storeLocation.id, // Use actual mapped location ID
        // registerSessionId is null for e-commerce orders (only used for in-store POS)
        items: {
          create: checkoutData.items.map((item) => ({
            itemType: item.type || "product",
            sourceId: item.id,
            description: item.name,
            price: item.price,
            quantity: item.quantity,
            ticketId: item.type === "ticket" ? item.id : null,
            inventoryVariationId: item.type === "product" ? item.id : null,
          })),
        },
      },
    });

    // Adjust stock levels for each item in the order
    const stockAdjustmentErrors: string[] = [];

    for (const item of checkoutData.items) {
      if (item.id) {
        try {
          if (item.type === "product") {
            // Handle regular product stock deduction using variation ID
            const adjustmentResult = await adjustStockLevelFromOrder(
              item.id,
              -item.quantity, // Negative quantity for deduction
              `Order completion - Order ID: ${order.id}`,
            );

            if (adjustmentResult.status !== "success") {
              stockAdjustmentErrors.push(
                `Failed to adjust stock for ${item.name}: ${
                  adjustmentResult.message || "Unknown error"
                }`
              );
            }
          } else if (item.type === "bundle") {
            // Handle bundle stock deduction using inventory item ID
            const bundleResult = await deductBundleStockByItemId(
              item.id,
              item.quantity,
              order.id,
              true // fromOrder flag
            );

            if (!bundleResult.success) {
              stockAdjustmentErrors.push(
                `Failed to deduct bundle stock for ${item.name}: ${bundleResult.error}`
              );
            }
          }
        } catch (error) {
          console.error(`Error adjusting stock for item ${item.id}:`, error);
          stockAdjustmentErrors.push(
            `Error adjusting stock for ${item.name}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
    }

    // Log stock adjustment errors but don't fail the order
    if (stockAdjustmentErrors.length > 0) {
      console.warn(
        "Stock adjustment errors for order",
        order.id,
        stockAdjustmentErrors
      );
    }

    // Revalidate relevant paths
    revalidatePath("/cart");
    revalidatePath("/checkout");
    revalidatePath("/orders");
    revalidatePath("/dashboard/inventory");

    return {
      success: true,
      message: "Order created successfully",
      orderId: order.id,
      customerId: customerId,
    };
  } catch (error) {
    console.error("Error creating order from checkout:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create order",
    };
  }
}
