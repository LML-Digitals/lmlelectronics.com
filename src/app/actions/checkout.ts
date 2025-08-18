'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import prisma from '@/lib/prisma';
import { updateCustomer } from '@/components/dashboard/customers/services/customerCrud';
import { adjustStockLevel } from '@/components/dashboard/inventory/items/services/itemsCrud';

// Type for cart items
export type CartItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  type?: string;
};

// Type for the cart data coming from the client
export type CartData = {
  items: CartItem[];
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
 * Server action to process checkout and create order
 */
export async function processCheckout (cartData: CartData): Promise<{
  success: boolean;
  message: string;
  orderId?: string;
}> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    const customerId = cartData.customerId ?? session.user.id;

    if (!customerId) {
      return {
        success: false,
        message: 'Customer ID is required',
      };
    }

    // Get customer to update their preferences
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return {
        success: false,
        message: 'Customer not found',
      };
    }

    // Update customer with latest location preference
    await updateCustomer(customer.id, {
      location: cartData.location,
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        subtotal: cartData.subtotal,
        taxAmount: cartData.taxAmount,
        total: cartData.total,
        paymentMethod: cartData.paymentMethod ?? 'cash',
        storeLocationId: parseInt(cartData.location),
        status: 'completed',
        discountAmount: cartData.discountAmount ?? 0,
        discountType: cartData.discountType ? (cartData.discountType as any) : null,
        items: {
          create: cartData.items.map((item: CartItem) => ({
            itemType: item.type || 'product',
            sourceId: item.id,
            description: item.name || item.description || 'Unknown item',
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    // Update stock levels for all items
    for (const item of cartData.items) {
      await adjustStockLevel(item.id, parseInt(cartData.location), -item.quantity, 'Order completed', undefined, true);
    }

    return {
      success: true,
      message: 'Order processed successfully',
      orderId: order.id,
    };
  } catch (error) {
    console.error('Error processing checkout:', error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to process checkout',
    };
  }
}
