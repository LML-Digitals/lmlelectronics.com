"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/config/authOptions";
import prisma from "@/lib/prisma";
import { updateCustomer } from "@/components/dashboard/customers/services/customerCrud";

// Type for the cart data coming from the client
export type CartData = {
  items: any[];
  paymentMethod?: string;
  location: string;
  customerId?: string | null;
  discountAmount?: number;
  discountType?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
};

/**
 * Server action to update customer preferences based on cart data
 * This does NOT create orders - that happens only at checkout completion
 */
export async function updateCustomerFromCart(
  cartData: Pick<CartData, "location" | "customerId">
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    const customerId = cartData.customerId || session.user.id;

    if (!customerId) {
      return {
        success: false,
        message: "Customer ID is required",
      };
    }

    // Get customer to update their preferences
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return {
        success: false,
        message: "Customer not found",
      };
    }

    // Update customer with latest location preference
    await updateCustomer(customer.id, {
      location: cartData.location,
    });

    return {
      success: true,
      message: "Customer preferences updated",
    };
  } catch (error) {
    console.error("Error updating customer from cart:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update customer",
    };
  }
}
