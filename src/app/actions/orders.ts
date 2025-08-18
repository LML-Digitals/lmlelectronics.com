'use server';

import prisma from '@/lib/prisma';

export async function getOrderDetails (orderId: string, customerId?: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...(customerId ? { customerId } : {}),
      },
      include: {
        customer: {
          include: {
            shippingAddress: true,
          },
        },
        storeLocation: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        items: {
          include: {
            inventoryVariation: {
              include: {
                inventoryItem: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        paymentDetails: true,
        refunds: true,
      },
    });

    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error('Error fetching order details:', error);

    return { success: false, message: 'Failed to fetch order details' };
  }
}

export async function getCustomerOrders (customerId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        customerId: customerId,
      },
      include: {
        storeLocation: {
          select: {
            name: true,
          },
        },
        items: {
          select: {
            quantity: true,
          },
        },
        refunds: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error('Error fetching customer orders:', error);

    return { success: false, message: 'Failed to fetch orders', data: [] };
  }
}

export async function getOrdersByCustomerEmail (email: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        customer: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
      },
      include: {
        storeLocation: {
          select: {
            name: true,
          },
        },
        items: {
          select: {
            quantity: true,
          },
        },
        refunds: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error('Error fetching orders by email:', error);

    return { success: false, message: 'Failed to fetch orders', data: [] };
  }
}
