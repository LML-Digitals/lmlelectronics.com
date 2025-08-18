'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/config/authOptions';
import prisma from '@/lib/prisma';
import { _updateCustomer } from '@/components/dashboard/customers/services/customerCrud';
import { _adjustStockLevel } from '@/components/dashboard/inventory/items/services/itemsCrud';

// Type for the cart data coming from the client
export type CartData = {
  items: unknown[];
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
export async function processCheckout(
  cartData: CartData,
): Promise<{ success: boolean; message: string; orderId?: string }> {
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
    await _updateCustomer(customer.id, {
      location: cartData.location,
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        items: cartData.items,
        subtotal: cartData.subtotal,
        taxAmount: cartData.taxAmount,
        total: cartData.total,
        paymentMethod: cartData.paymentMethod ?? 'cash',
        location: cartData.location,
        status: 'completed',
        discountAmount: cartData.discountAmount ?? 0,
        discountType: cartData.discountType ?? 'none',
      },
    });

    // Update stock levels for all items
    for (const item of cartData.items) {
      await _adjustStockLevel(item.id, -item.quantity);
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
