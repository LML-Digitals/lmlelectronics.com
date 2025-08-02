"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { fetchSession } from "@/lib/session";
import type {
  Order,
  OrderItem,
  Customer,
  Staff,
  StoreLocation,
  InventoryVariation,
  Refund,
  ShippingAddress,
} from "@prisma/client";

export type OrderWithDetails = Order & {
  customer: Pick<Customer, "id" | "firstName" | "lastName" | "email" | "phone"> & {
    shippingAddress?: ShippingAddress;
  };
  staff: Pick<Staff, "id" | "firstName" | "lastName">;
  storeLocation: Pick<StoreLocation, "id" | "name">;
  items: (OrderItem & {
    inventoryVariation?: Pick<InventoryVariation, "id" | "name" | "sku"> | null;
  })[];
  refunds: Refund[];
  _count: {
    items: number;
    refunds: number;
  };
};

export type OrdersSearchFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  locationId?: string;
};

// Get all orders with search and filtering
export async function getOrders(filters: OrdersSearchFilters = {}): Promise<{
  success: boolean;
  data?: {
    orders: OrderWithDetails[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}> {
  try {
    const session = await fetchSession();
    if (!session?.user || session.user.userType !== "staff") {
      return { success: false, error: "Unauthorized" };
    }

    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
      paymentMethod = "",
      dateFrom,
      dateTo,
      locationId,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    let whereClause: any = {};

    // Search by customer name, email, or order ID
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by payment method
    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod;
    }

    // Filter by location
    if (locationId) {
      whereClause.storeLocationId = parseInt(locationId);
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo);
      }
    }

    // Get total count for pagination
    const total = await prisma.order.count({ where: whereClause });

    // Get orders with relations
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        storeLocation: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            inventoryVariation: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        refunds: true,
        _count: {
          select: {
            items: true,
            refunds: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        orders: orders as OrderWithDetails[],
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

// Get single order with full details
export async function getOrderById(orderId: string): Promise<{
  success: boolean;
  data?: OrderWithDetails;
  error?: string;
}> {
  try {
    const session = await fetchSession();
    if (!session?.user || session.user.userType !== "staff") {
      return { success: false, error: "Unauthorized" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          include: {
            shippingAddress: true,
          },
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
        registerSession: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        items: {
          include: {
            inventoryVariation: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
          orderBy: { id: "asc" },
        },
        refunds: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            items: true,
            refunds: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    return {
      success: true,
      data: order as OrderWithDetails,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

// Process refund for an order
export async function processRefund(
  orderId: string,
  amount: number,
  reason?: string
): Promise<{
  success: boolean;
  data?: Refund;
  error?: string;
}> {
  try {
    const session = await fetchSession();
    if (!session?.user || session.user.userType !== "staff") {
      return { success: false, error: "Unauthorized" };
    }

    // Get the order to validate
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        refunds: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Calculate total refunded amount
    const totalRefunded = order.refunds.reduce(
      (sum, refund) => sum + refund.amount,
      0
    );

    // Check if refund amount is valid
    if (amount <= 0) {
      return { success: false, error: "Refund amount must be greater than 0" };
    }

    if (totalRefunded + amount > order.total) {
      return {
        success: false,
        error: "Refund amount exceeds order total",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create refund record
      const refund = await tx.refund.create({
        data: {
          orderId,
          amount,
          reason,
        },
      });

      // Update order status based on refund amount
      const newTotalRefunded = totalRefunded + amount;
      let newStatus = order.status;

      if (newTotalRefunded >= order.total) {
        newStatus = "REFUNDED";
      } else if (newTotalRefunded > 0) {
        newStatus = "PARTIALLY_REFUNDED";
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      return refund;
    });

    revalidatePath("/dashboard/pos/orders");
    revalidatePath(`/dashboard/pos/orders/${orderId}`);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error processing refund:", error);
    return { success: false, error: "Failed to process refund" };
  }
}

// Get order summary statistics
export async function getOrderStats(
  locationId?: number,
  dateFrom?: Date,
  dateTo?: Date
): Promise<{
  success: boolean;
  data?: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: Record<string, number>;
    paymentMethodBreakdown: Record<string, number>;
  };
  error?: string;
}> {
  try {
    const session = await fetchSession();
    if (!session?.user || session.user.userType !== "staff") {
      return { success: false, error: "Unauthorized" };
    }

    let whereClause: any = {};

    if (locationId) {
      whereClause.storeLocationId = locationId;
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        whereClause.createdAt.lte = dateTo;
      }
    }

    const [totalOrders, revenueData, statusBreakdown, paymentMethodBreakdown] =
      await Promise.all([
        prisma.order.count({ where: whereClause }),

        prisma.order.aggregate({
          where: whereClause,
          _sum: { total: true },
          _avg: { total: true },
        }),

        prisma.order.groupBy({
          by: ["status"],
          where: whereClause,
          _count: { status: true },
        }),

        prisma.order.groupBy({
          by: ["paymentMethod"],
          where: whereClause,
          _count: { paymentMethod: true },
        }),
      ]);

    const statusCounts = statusBreakdown.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    const paymentCounts = paymentMethodBreakdown.reduce((acc, item) => {
      acc[item.paymentMethod || "Unknown"] = item._count.paymentMethod;
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      data: {
        totalOrders,
        totalRevenue: revenueData._sum.total || 0,
        averageOrderValue: revenueData._avg.total || 0,
        statusBreakdown: statusCounts,
        paymentMethodBreakdown: paymentCounts,
      },
    };
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return { success: false, error: "Failed to fetch order statistics" };
  }
}

// Get recent orders (for dashboard widgets)
export async function getRecentOrders(limit = 5): Promise<{
  success: boolean;
  data?: OrderWithDetails[];
  error?: string;
}> {
  try {
    const session = await fetchSession();
    if (!session?.user || session.user.userType !== "staff") {
      return { success: false, error: "Unauthorized" };
    }

    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        storeLocation: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            inventoryVariation: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        refunds: true,
        _count: {
          select: {
            items: true,
            refunds: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return {
      success: true,
      data: orders as OrderWithDetails[],
    };
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return { success: false, error: "Failed to fetch recent orders" };
  }
}

// NEW: Square Sync Functions

// export async function syncOrderWithSquare(orderId: string): Promise<{
//   success: boolean;
//   data?: { previousStatus: string; newStatus: string; squareStatus: string };
//   error?: string;
// }> {
//   try {
//     const order = await prisma.order.findUnique({
//       where: { id: orderId },
//     });

//     if (!order) {
//       return { success: false, error: "Order not found" };
//     }

//     if (!order.squareTxnId) {
//       return { success: false, error: "No Square transaction ID found" };
//     }

//     const previousStatus = order.status;
//     let newStatus = previousStatus;
//     let squareStatus = "unknown";

//     try {
//       // Check if it's an order or invoice based on payment method
//       if (order.paymentMethod === "Invoice") {
//         // Sync with Square Invoice
//         const invoiceResponse = await invoicesApi.getInvoice(order.squareTxnId);

//         if (invoiceResponse.result.invoice) {
//           const invoice = invoiceResponse.result.invoice;
//           squareStatus = invoice.status || "unknown";

//           switch (invoice.status) {
//             case "PAID":
//               newStatus = "PAID";
//               break;
//             case "PARTIALLY_PAID":
//               newStatus = "PARTIALLY_REFUNDED"; // Closest equivalent
//               break;
//             case "CANCELED":
//             case "FAILED":
//               newStatus = "REFUNDED";
//               break;
//             case "UNPAID":
//             case "SCHEDULED":
//             case "DRAFT":
//             default:
//               newStatus = "INVOICED";
//               break;
//           }
//         }
//       } else {
//         // Sync with Square Order
//         const orderResponse = await ordersApi.retrieveOrder(order.squareTxnId);

//         if (orderResponse.result.order) {
//           const squareOrder = orderResponse.result.order;
//           squareStatus = squareOrder.state || "unknown";

//           switch (squareOrder.state) {
//             case "COMPLETED":
//               newStatus = "PAID";
//               break;
//             case "CANCELED":
//               newStatus = "REFUNDED";
//               break;
//             case "OPEN":
//             case "DRAFT":
//             default:
//               // For card payments, if order exists but not completed, it's likely pending
//               if (
//                 order.paymentMethod === "Credit Card" ||
//                 order.paymentMethod === "Debit Card"
//               ) {
//                 newStatus = "PENDING";
//               }
//               break;
//           }
//         }
//       }
//     } catch (squareError: any) {
//       console.error("Square API error:", squareError);
//       return {
//         success: false,
//         error: `Square API error: ${squareError.message || "Unknown error"}`,
//       };
//     }

//     // Update order status if it changed
//     if (newStatus !== previousStatus) {
//       await prisma.order.update({
//         where: { id: orderId },
//         data: { status: newStatus },
//       });

//       revalidatePath("/dashboard/pos/orders");
//       revalidatePath(`/dashboard/pos/orders/${orderId}`);
//     }

//     return {
//       success: true,
//       data: {
//         previousStatus,
//         newStatus,
//         squareStatus,
//       },
//     };
//   } catch (error) {
//     console.error("Error syncing order with Square:", error);
//     return { success: false, error: "Failed to sync with Square" };
//   }
// }

// export async function syncAllOrdersWithSquare(options?: {
//   limitToRecent?: boolean;
//   daysBack?: number;
// }): Promise<{
//   success: boolean;
//   data?: {
//     totalProcessed: number;
//     updated: number;
//     errors: number;
//     results: Array<{
//       orderId: string;
//       success: boolean;
//       previousStatus?: string;
//       newStatus?: string;
//       error?: string;
//     }>;
//   };
//   error?: string;
// }> {
//   try {
//     const { limitToRecent = true, daysBack = 7 } = options || {};

//     // Build where clause for orders to sync
//     let whereClause: any = {
//       squareTxnId: { not: null },
//       status: { in: ["PENDING", "INVOICED"] }, // Only sync orders that might change
//     };

//     if (limitToRecent) {
//       const cutoffDate = new Date();
//       cutoffDate.setDate(cutoffDate.getDate() - daysBack);
//       whereClause.createdAt = { gte: cutoffDate };
//     }

//     const ordersToSync = await prisma.order.findMany({
//       where: whereClause,
//       select: { id: true },
//     });

//     const results = [];
//     let updated = 0;
//     let errors = 0;

//     // Process orders in batches to avoid overwhelming Square API
//     const batchSize = 10;
//     for (let i = 0; i < ordersToSync.length; i += batchSize) {
//       const batch = ordersToSync.slice(i, i + batchSize);

//       const batchPromises = batch.map(async (order) => {
//         const result = await syncOrderWithSquare(order.id);

//         if (result.success) {
//           if (
//             result.data &&
//             result.data.previousStatus !== result.data.newStatus
//           ) {
//             updated++;
//           }
//           return {
//             orderId: order.id,
//             success: true,
//             previousStatus: result.data?.previousStatus,
//             newStatus: result.data?.newStatus,
//           };
//         } else {
//           errors++;
//           return {
//             orderId: order.id,
//             success: false,
//             error: result.error,
//           };
//         }
//       });

//       const batchResults = await Promise.all(batchPromises);
//       results.push(...batchResults);

//       // Small delay between batches to be respectful to Square API
//       if (i + batchSize < ordersToSync.length) {
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       }
//     }

//     return {
//       success: true,
//       data: {
//         totalProcessed: ordersToSync.length,
//         updated,
//         errors,
//         results,
//       },
//     };
//   } catch (error) {
//     console.error("Error syncing all orders with Square:", error);
//     return { success: false, error: "Failed to sync orders with Square" };
//   }
// }
