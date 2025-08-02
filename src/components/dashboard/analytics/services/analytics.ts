"use server";

import prisma from "@/lib/prisma";
import { add, format, startOfMonth, endOfMonth, subMonths } from "date-fns";

// --- BEGIN NEW FUNCTION ---
async function calculateRevenueFromSales(
  period: string = "monthly",
  customStartDate?: Date,
  customEndDate?: Date
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (period === "custom" && customStartDate) {
    startDate = customStartDate;
    endDate = customEndDate || now;
  } else {
    switch (period) {
      case "weekly":
        startDate = add(now, { days: -7 });
        break;
      case "monthly":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "quarterly":
        startDate = add(now, { months: -3 });
        break;
      case "yearly":
        startDate = add(now, { years: -1 });
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }
  }

  // Get paid orders for the specified period
  const paidOrders = await prisma.order.findMany({
    where: {
      status: "PAID",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
    },
  });

  // Calculate income and profit based on order item types
  let incomeFromRepairs = 0;
  let incomeFromServices = 0;
  let incomeFromProducts = 0;
  let incomeFromCustom = 0;
  let profitFromRepairs = 0;
  let profitFromServices = 0;
  let profitFromProducts = 0;
  let profitFromCustom = 0;

  paidOrders.forEach((order) => {
    order.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      // Note: Profit calculation removed as OrderItem doesn't have cost/profit fields
      // Profit should be calculated separately when cost data is available

      switch (item.itemType) {
        case "repair":
          incomeFromRepairs += itemTotal;
          break;
        case "service":
          incomeFromServices += itemTotal;
          break;
        case "product":
          incomeFromProducts += itemTotal;
          break;
        case "custom":
          incomeFromCustom += itemTotal;
          break;
        default:
          // Handle items without itemType by adding to products
          incomeFromProducts += itemTotal;
          break;
      }
    });
  });

  const totalIncome =
    incomeFromRepairs +
    incomeFromServices +
    incomeFromProducts +
    incomeFromCustom;
  // Note: Profit calculation set to 0 as OrderItem doesn't have cost/profit fields
  const totalProfit = 0;

  return {
    totalIncome,
    incomeFromRepairs,
    incomeFromServices,
    incomeFromProducts,
    incomeFromCustom,
    totalProfit,
    profitFromRepairs: 0,
    profitFromServices: 0,
    profitFromProducts: 0,
    profitFromCustom: 0,
  };
}
// --- END NEW FUNCTION ---

// Repair & Services Analytics
export async function getRepairAnalytics(
  period: string = "monthly",
  customStartDate?: Date,
  customEndDate?: Date
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (period === "custom" && customStartDate) {
    startDate = customStartDate;
    endDate = customEndDate || now;
  } else {
    switch (period) {
      case "weekly":
        startDate = add(now, { days: -7 });
        break;
      case "monthly":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "quarterly":
        startDate = add(now, { months: -3 });
        break;
      case "yearly":
        startDate = add(now, { years: -1 });
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }
  }

  // Get revenue data using the new centralized function
  const { incomeFromRepairs, incomeFromServices } =
    await calculateRevenueFromSales(period, customStartDate, customEndDate);

  // === TICKET ANALYTICS ===
  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      repairDevices: {
        include: {
          repairOptions: {
            include: {
              repairType: true,
            },
          },
        },
      },
    },
  });

  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(
    (t: any) => t.status === "DONE"
  ).length;
  const pendingTickets = tickets.filter(
    (t: any) => t.status === "PENDING"
  ).length;
  const cancelledTickets = tickets.filter(
    (t: any) => t.status === "CANCELLED"
  ).length;

  // Calculate repair types distribution
  const repairTypes = tickets.reduce(
    (acc: Record<string, number>, ticket: any) => {
      ticket.repairDevices.forEach((device: any) => {
        device.repairOptions.forEach((repair: any) => {
          const repairTypeName = repair.repairType.name;
          acc[repairTypeName] = (acc[repairTypeName] || 0) + 1;
        });
      });
      return acc;
    },
    {} as Record<string, number>
  );

  // Brand distribution
  const brandDistribution = tickets.reduce(
    (acc: Record<string, number>, ticket: any) => {
      ticket.repairDevices.forEach((device: any) => {
        acc[device.brand] = (acc[device.brand] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  // === QUOTE ANALYTICS ===
  const quotes = await prisma.quote.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalQuotes = quotes.length;
  const acceptedQuotes = quotes.filter((q: any) => q.convertedToTicket).length;
  const expiredQuotes = quotes.filter(
    (q: any) => !q.convertedToTicket && q.expiresAt < now
  ).length;
  const pendingQuotes = quotes.filter(
    (q: any) => !q.convertedToTicket && q.expiresAt >= now
  ).length;
  const quoteConversionRate =
    totalQuotes > 0 ? ((acceptedQuotes / totalQuotes) * 100).toFixed(2) : "0";

  // Quote brand distribution
  const quoteBrandDistribution = quotes.reduce(
    (acc: Record<string, number>, quote: any) => {
      acc[quote.brand] = (acc[quote.brand] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // === DIAGNOSTICS ANALYTICS ===
  const diagnostics = await prisma.diagnostic.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalDiagnostics = diagnostics.length;
  const completedDiagnostics = diagnostics.filter(
    (d: any) => d.status === "COMPLETED"
  ).length;
  const pendingDiagnostics = diagnostics.filter(
    (d: any) => d.status === "PENDING"
  ).length;
  const diagnosticCompletionRate =
    totalDiagnostics > 0
      ? ((completedDiagnostics / totalDiagnostics) * 100).toFixed(2)
      : "0";

  return {
    // Ticket Analytics
    tickets: {
      total: totalTickets,
      completed: completedTickets,
      pending: pendingTickets,
      cancelled: cancelledTickets,
      completionRate: totalTickets
        ? ((completedTickets / totalTickets) * 100).toFixed(2)
        : "0",
      brandDistribution,
      repairTypes,
    },

    // Quote Analytics
    quotes: {
      total: totalQuotes,
      accepted: acceptedQuotes,
      expired: expiredQuotes,
      pending: pendingQuotes,
      conversionRate: quoteConversionRate,
      brandDistribution: quoteBrandDistribution,
    },

    // Diagnostics Analytics
    diagnostics: {
      total: totalDiagnostics,
      completed: completedDiagnostics,
      pending: pendingDiagnostics,
      completionRate: diagnosticCompletionRate,
    },

    // Revenue
    totalRepairRevenue: incomeFromRepairs,
    totalServiceRevenue: incomeFromServices,

    period,
    dateRange: { startDate, endDate },
  };
}

// Communications Analytics
export async function getCommunicationsAnalytics(
  period: string = "monthly",
  customStartDate?: Date,
  customEndDate?: Date
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (period === "custom" && customStartDate) {
    startDate = customStartDate;
    endDate = customEndDate || now;
  } else {
    switch (period) {
      case "weekly":
        startDate = add(now, { days: -7 });
        break;
      case "monthly":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "quarterly":
        startDate = add(now, { months: -3 });
        break;
      case "yearly":
        startDate = add(now, { years: -1 });
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }
  }

  // Get call analytics
  const calls = await prisma.call.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Get text message analytics
  const textMessages = await prisma.textMessage.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Get email analytics
  const emails = await prisma.emailLog.findMany({
    where: {
      sentAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Get notifications analytics
  const notifications = await prisma.notification.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Get announcements analytics
  const announcements = await prisma.announcement.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const emailOpenRate =
    emails.filter((e: any) => e.analytics && e.analytics.opens > 0).length /
      emails.length || 0;
  const emailClickRate =
    emails.filter((e: any) => e.analytics && e.analytics.clicks > 0).length /
      emails.length || 0;

  // Calculate notifications read rate
  const notificationsReadRate = notifications.length
    ? (notifications.filter((n: any) => n.isRead).length /
        notifications.length) *
      100
    : 0;

  // Calculate active announcements percentage
  const activeAnnouncementsRate = announcements.length
    ? (announcements.filter((a: any) => a.isActive).length /
        announcements.length) *
      100
    : 0;

  return {
    calls: {
      total: calls.length,
      answered: calls.filter((c: any) => c.answered).length,
      missed: calls.filter((c: any) => !c.answered).length,
      answerRate: calls.length
        ? (calls.filter((c: any) => c.answered).length / calls.length) * 100
        : 0,
    },
    texts: {
      total: textMessages.length,
      sent: textMessages.filter((t: any) => t.direction === "OUTBOUND").length,
      received: textMessages.filter((t: any) => t.direction === "INBOUND")
        .length,
      deliveryRate: textMessages.filter((t: any) => t.direction === "OUTBOUND")
        .length
        ? (textMessages.filter(
            (t: any) => t.direction === "OUTBOUND" && t.status === "DELIVERED"
          ).length /
            textMessages.filter((t: any) => t.direction === "OUTBOUND")
              .length) *
          100
        : 0,
    },
    emails: {
      total: emails.length,
      sent: emails.filter((e: any) => e.status === "SENT").length,
      failed: emails.filter((e: any) => e.status === "FAILED").length,
      openRate: emailOpenRate * 100,
      clickRate: emailClickRate * 100,
    },
    notifications: {
      total: notifications.length,
      read: notifications.filter((n: any) => n.isRead).length,
      unread: notifications.filter((n: any) => !n.isRead).length,
      readRate: notificationsReadRate,
      // Group by type
      byType: notifications.reduce((acc: Record<string, number>, n: any) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {}),
      // Group by priority
      byPriority: notifications.reduce(
        (acc: Record<string, number>, n: any) => {
          acc[n.priority] = (acc[n.priority] || 0) + 1;
          return acc;
        },
        {}
      ),
    },
    announcements: {
      total: announcements.length,
      active: announcements.filter((a: any) => a.isActive).length,
      inactive: announcements.filter((a: any) => !a.isActive).length,
      activeRate: activeAnnouncementsRate,
      latest:
        announcements.length > 0
          ? announcements
              .sort(
                (a: any, b: any) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 5)
          : [],
    },
    period,
    dateRange: { startDate, endDate },
  };
}

// Inventory & POS Analytics
export async function getInventoryAnalytics(
  period: string = "monthly",
  customStartDate?: Date,
  customEndDate?: Date
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (period === "custom" && customStartDate) {
    startDate = customStartDate;
    endDate = customEndDate || now;
  } else {
    switch (period) {
      case "weekly":
        startDate = add(now, { days: -7 });
        break;
      case "monthly":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "quarterly":
        startDate = add(now, { months: -3 });
        break;
      case "yearly":
        startDate = add(now, { years: -1 });
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }
  }

  // Get revenue data using the new centralized function
  const { incomeFromProducts, profitFromProducts } =
    await calculateRevenueFromSales(period, customStartDate, customEndDate);

  // Get inventory items and categories
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      categories: true,
      variations: true,
    },
  });

  // Get inventory adjustments
  const adjustments = await prisma.inventoryAdjustment.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      inventoryItem: true,
      inventoryVariation: true,
      location: true,
    },
  });

  // Get inventory audits
  const audits = await prisma.inventoryAudit.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      inventoryItem: true,
      inventoryVariation: true,
      location: true,
    },
  });

  // Get purchase orders
  const purchaseOrders = await prisma.inventoryPurchaseOrder.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
      supplier: true,
      shipments: true,
    },
  });

  // Get suppliers/vendors
  const suppliers = await prisma.vendor.findMany({
    include: {
      purchaseOrders: {
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      inventoryItems: {
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
  });

  // Get inventory returns
  const returns = await prisma.inventoryReturn.findMany({
    where: {
      returnedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      inventoryItem: true,
      inventoryVariation: true,
      location: true,
    },
  });

  // Get inventory transfers
  const transfers = await prisma.inventoryTransfer.findMany({
    where: {
      transferDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      toLocation: true,
      fromLocation: true,
      inventoryItem: true,
      inventoryVariation: true,
    },
  });

  // Get inventory exchanges
  const exchanges = await prisma.inventoryExchange.findMany({
    where: {
      exchangedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      customer: true,
      returnedItem: true,
      newItem: true,
      returnedVariation: true,
      newVariation: true,
    },
  });

  // Get rental devices
  const rentalDevices = await prisma.rentalDevice.findMany({
    include: {
      rentalRates: true,
      rentalOrders: {
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
  });

  // Get special parts
  const specialParts = await prisma.specialPart.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      order: true,
      inventoryItem: true,
      inventoryVariation: true,
    },
  });

  // Get insurance policies (warranty)
  const insurancePolicies = await prisma.insurancePolicy.findMany({
    where: {
      startDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      customer: true,
      insuranceType: true,
      claims: true,
      repairDevice: true,
      item: true,
      itemVariation: true,
    },
  });

  // Get orders
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      customer: true,
      items: true,
    },
  });

  // Get refunds
  const refunds = await prisma.refund.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      order: true,
    },
  });

  // Get discounts
  const discounts = await prisma.discount.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Calculate low stock items
  const lowStockItems = await prisma.inventoryStockLevel.findMany({
    where: {
      stock: {
        lte: 5, // Assuming low stock threshold is 5
      },
    },
    include: {
      variation: {
        include: {
          inventoryItem: true,
        },
      },
      location: true,
    },
  });

  // Calculate revenue and profit metrics - REMOVED OLD CALCULATION
  // Now using totalProductRevenue and totalProductProfit from calculateRevenueFromSales
  // const totalRevenue = sales.reduce(
  //   (sum: number, sale: any) => sum + sale.total,
  //   0
  // );
  const totalValue = inventoryItems.reduce((sum: number, item: any) => {
    const variationsTotal = item.variations.reduce(
      (varSum: number, variation: any) => varSum + variation.sellingPrice,
      0
    );
    return sum + variationsTotal;
  }, 0);

  const avgProductValue =
    totalValue /
    inventoryItems.reduce((sum, item) => sum + item.variations.length, 0);

  // REMOVED OLD PROFIT CALCULATION - now using accurate calculation from orders
  // const totalProfit = sales.reduce(
  //   (sum: number, sale: any) => sum + sale.profit,
  //   0
  // );
  // const profitMargin =
  //   totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Revenue and profit metrics now come from calculateRevenueFromSales
  const totalProductRevenue = incomeFromProducts;
  const totalProductProfit = profitFromProducts;
  const productProfitMargin =
    totalProductRevenue > 0
      ? (totalProductProfit / totalProductRevenue) * 100
      : 0;

  // Calculate order metrics
  const pendingOrders = orders.filter(
    (o: any) => o.status === "PENDING"
  ).length;
  const completedOrders = orders.filter(
    (o: any) => o.status === "COMPLETED"
  ).length;
  const cancelledOrders = orders.filter(
    (o: any) => o.status === "CANCELLED"
  ).length;

  // Calculate refund metrics
  const approvedRefunds = refunds.filter(
    (r: any) => r.status === "APPROVED"
  ).length;
  const pendingRefunds = refunds.filter(
    (r: any) => r.status === "PENDING"
  ).length;
  const deniedRefunds = refunds.filter(
    (r: any) => r.status === "DENIED"
  ).length;
  const totalRefundAmount = refunds.reduce(
    (sum: number, r: any) => sum + r.amount,
    0
  );

  // Calculate active rental metrics
  const activeRentals = rentalDevices.reduce(
    (sum: number, device: any) =>
      sum +
      device.rentalOrders.filter((o: any) => o.status === "ACTIVE").length,
    0
  );

  // Calculate invoice metrics
  const paidInvoices = 0;
  const pendingInvoices = 0;
  const totalInvoiceAmount = 0;

  return {
    inventory: {
      items: {
        total: inventoryItems.length,
        byCategory: inventoryItems.reduce(
          (acc: Record<string, number>, item: any) => {
            item.categories.forEach((category: any) => {
              acc[category.name] = (acc[category.name] || 0) + 1;
            });
            return acc;
          },
          {}
        ),
      },
      totalValue: totalValue,
      avgProductValue: avgProductValue,
      totalRevenue: totalProductRevenue,
      totalAdjustments: adjustments.length,
      adjustmentReasons: adjustments.reduce(
        (acc: Record<string, number>, adjustment: any) => {
          acc[adjustment.reason] = (acc[adjustment.reason] || 0) + 1;
          return acc;
        },
        {}
      ),
      discrepancies: audits.reduce(
        (sum: number, audit: any) => sum + Math.abs(audit.discrepancy),
        0
      ),
      lowStockItems: lowStockItems.length,
      returns: {
        total: returns.length,
        byReason: returns.reduce((acc: Record<string, number>, ret: any) => {
          acc[ret.reason] = (acc[ret.reason] || 0) + 1;
          return acc;
        }, {}),
      },
      transfers: {
        total: transfers.length,
        quantity: transfers.reduce(
          (sum: number, transfer: any) => sum + transfer.quantity,
          0
        ),
      },
      exchanges: {
        total: exchanges.length,
      },
    },
    purchaseOrders: {
      total: purchaseOrders.length,
      pending: purchaseOrders.filter((po: any) => po.status === "PENDING")
        .length,
      approved: purchaseOrders.filter((po: any) => po.status === "APPROVED")
        .length,
      received: purchaseOrders.filter((po: any) => po.status === "RECEIVED")
        .length,
      cancelled: purchaseOrders.filter((po: any) => po.status === "CANCELLED")
        .length,
      totalSpent: purchaseOrders.reduce(
        (sum: number, po: any) => sum + po.totalCost,
        0
      ),
      bySupplier: purchaseOrders.reduce(
        (acc: Record<string, number>, po: any) => {
          acc[po.supplier.name] = (acc[po.supplier.name] || 0) + 1;
          return acc;
        },
        {}
      ),
    },
    suppliers: {
      total: suppliers.length,
      active: suppliers.filter((s: any) => s.purchaseOrders.length > 0).length,
      topSuppliers: suppliers
        .sort(
          (a: any, b: any) => b.purchaseOrders.length - a.purchaseOrders.length
        )
        .slice(0, 5)
        .map((s: any) => ({
          name: s.name,
          orderCount: s.purchaseOrders.length,
          itemCount: s.inventoryItems.length,
        })),
    },
    rentalDevices: {
      total: rentalDevices.length,
      available: rentalDevices.filter((rd: any) => rd.isAvailable).length,
      activeRentals: activeRentals,
      revenue: rentalDevices.reduce(
        (sum: number, device: any) =>
          sum +
          device.rentalOrders.reduce(
            (orderSum: number, order: any) =>
              orderSum +
              (order.payments?.reduce(
                (paymentSum: number, payment: any) =>
                  paymentSum + payment.amount,
                0
              ) || 0),
            0
          ),
        0
      ),
    },
    specialParts: {
      total: specialParts.length,
      pending: specialParts.filter((sp: any) => sp.status === "PENDING").length,
      completed: specialParts.filter((sp: any) => sp.status === "COMPLETED")
        .length,
      totalValue: specialParts.reduce(
        (sum: number, sp: any) => sum + sp.total,
        0
      ),
    },
    warranty: {
      totalPolicies: insurancePolicies.length,
      activePolicies: insurancePolicies.filter(
        (p: any) => p.status === "active"
      ).length,
      claims: insurancePolicies.reduce(
        (sum: number, policy: any) => sum + policy.claims.length,
        0
      ),
      revenue: insurancePolicies.reduce(
        (sum: number, policy: any) => sum + Number(policy.premiumAmount),
        0
      ),
    },
    pos: {
      orders: {
        total: orders.length,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        completionRate:
          orders.length > 0 ? (completedOrders / orders.length) * 100 : 0,
      },
      
      refunds: {
        total: refunds.length,
        approved: approvedRefunds,
        pending: pendingRefunds,
        denied: deniedRefunds,
        totalAmount: totalRefundAmount,
        refundRate:
          orders.length > 0 ? (refunds.length / orders.length) * 100 : 0,
      },
      discounts: {
        total: discounts.length,
        active: discounts.filter((d: any) => d.isActive).length,
        usageCount: discounts.reduce(
          (sum: number, discount: any) => sum + discount.count,
          0
        ),
        byType: discounts.reduce((acc: Record<string, number>, d: any) => {
          acc[d.type] = (acc[d.type] || 0) + 1;
          return acc;
        }, {}),
      },
      invoices: {
        total: 0,
        paid: paidInvoices,
        pending: pendingInvoices,
        totalAmount: totalInvoiceAmount,
        collectionRate: 0,
      },
    },
    period,
    dateRange: { startDate, endDate },
  };
}

// Customer & Staff Analytics
export async function getCustomerAnalytics(
  period: string = "monthly",
  customStartDate?: Date,
  customEndDate?: Date
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (period === "custom" && customStartDate) {
    startDate = customStartDate;
    endDate = customEndDate || now;
  } else {
    switch (period) {
      case "weekly":
        startDate = add(now, { days: -7 });
        break;
      case "monthly":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "quarterly":
        startDate = add(now, { months: -3 });
        break;
      case "yearly":
        startDate = add(now, { years: -1 });
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }
  }

  // Get new customers
  const newCustomers = await prisma.customer.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Get total customers
  const totalCustomers = await prisma.customer.count();

  // Get active customers (with orders or tickets in the period)
  const activeCustomers = await prisma.customer.count({
    where: {
      OR: [
        {
          tickets: {
            some: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
        {
          orders: {
            some: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      ],
    },
  });

  // Get bookings
  const bookings = await prisma.booking.count({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Get booking details
  const bookingDetails = await prisma.booking.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      status: true,
      bookingType: true,
      convertedToTicket: true,
    },
  });

  // Calculate booking metrics
  const bookingStatusCounts = bookingDetails.reduce(
    (acc: Record<string, number>, booking: any) => {
      const status = booking.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  const bookingTypeCounts = bookingDetails.reduce(
    (acc: Record<string, number>, booking: any) => {
      const type = booking.bookingType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {}
  );

  const convertedBookings = bookingDetails.filter(
    (b: any) => b.convertedToTicket
  ).length;
  const conversionRate =
    bookings > 0 ? (convertedBookings / bookings) * 100 : 0;

  // Get mail-ins
  const mailIns = await prisma.mailIn.count({
    where: {
      shipDatestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Get mail-in details
  const mailInDetails = await prisma.mailIn.findMany({
    where: {
      shipDatestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      status: true,
      convertedToTicket: true,
    },
  });

  // Calculate mail-in metrics
  const mailInStatusCounts = mailInDetails.reduce(
    (acc: Record<string, number>, mailIn: any) => {
      const status = mailIn.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  const convertedMailIns = mailInDetails.filter(
    (m: any) => m.convertedToTicket
  ).length;
  const mailInConversionRate =
    mailIns > 0 ? (convertedMailIns / mailIns) * 100 : 0;

  // Get tickets
  const ticketsData = await prisma.ticket.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      status: true,
      completed: true,
      contactEmail: true,
      contactNumber: true,
      staffId: true,
    },
  });

  const tickets = ticketsData.length;

  // Calculate ticket metrics
  const ticketStatusCounts = ticketsData.reduce(
    (acc: Record<string, number>, ticket: any) => {
      const status = ticket.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  const completedTickets = ticketsData.filter((t: any) => t.completed).length;
  const ticketCompletionRate =
    tickets > 0 ? (completedTickets / tickets) * 100 : 0;

  // Get store credit data
  const storeCreditData = await prisma.storeCredit.findMany({
    include: {
      transactions: {
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
  });

  // Calculate store credit metrics
  const totalStoreCredits = storeCreditData.length;
  const totalCreditBalance = storeCreditData.reduce(
    (sum: number, credit: any) => sum + credit.balance,
    0
  );
  const averageCreditBalance =
    totalStoreCredits > 0 ? totalCreditBalance / totalStoreCredits : 0;

  const recentTransactions = storeCreditData.reduce(
    (count: number, credit: any) => count + credit.transactions.length,
    0
  );
  const earnTransactions = storeCreditData.reduce(
    (count: number, credit: any) =>
      count +
      credit.transactions.filter((t: any) => t.transactionType === "earn")
        .length,
    0
  );
  const deductTransactions = storeCreditData.reduce(
    (count: number, credit: any) =>
      count +
      credit.transactions.filter((t: any) => t.transactionType === "deduct")
        .length,
    0
  );

  // Get loyalty program data
  const loyaltyPrograms = await prisma.loyaltyProgram.findMany({
    include: {
      activities: {
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      redemptions: {
        where: {
          redeemedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
  });

  // Calculate loyalty metrics
  const totalPoints = loyaltyPrograms.reduce(
    (sum: number, program: any) => sum + program.points,
    0
  );

  const activeMembers = loyaltyPrograms.length;

  const allActivities = loyaltyPrograms.reduce(
    (acc: any[], program: any) => [...acc, ...program.activities],
    []
  );

  const pointsRedeemed = allActivities
    .filter((activity: any) => activity.type === "REDEEMED")
    .reduce((sum: number, activity: any) => sum + activity.points, 0);

  const membersWhoRedeemed = loyaltyPrograms.filter(
    (program: any) => program.redemptions.length > 0
  ).length;

  const redemptionRate =
    activeMembers > 0 ? Math.round((membersWhoRedeemed / activeMembers) * 100) : 0;

  // Build monthly stats for loyalty
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const monthlyStats = months.slice(0, now.getMonth() + 1).map((month, index) => {
    const monthStart = new Date(now.getFullYear(), index, 1);
    const monthEnd = new Date(now.getFullYear(), index + 1, 0);

    const monthActivities = allActivities.filter((activity: any) => {
      const activityDate = new Date(activity.createdAt);
      return activityDate >= monthStart && activityDate <= monthEnd;
    });

    const pointsEarned = monthActivities
      .filter((activity: any) => activity.type === "EARNED")
      .reduce((sum: number, activity: any) => sum + activity.points, 0);

    const monthPointsRedeemed = monthActivities
      .filter((activity: any) => activity.type === "REDEEMED")
      .reduce((sum: number, activity: any) => sum + activity.points, 0);

    return {
      month,
      pointsEarned,
      pointsRedeemed: monthPointsRedeemed,
    };
  });

  // Get reviews
  const reviewsData = await prisma.review.findMany({
    where: {
      reviewDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      reviewSource: true,
    },
  });

  // Calculate review metrics
  const totalReviews = reviewsData.length;
  const averageRating =
    totalReviews > 0
      ? reviewsData.reduce(
          (sum: number, review: any) => sum + review.rating,
          0
        ) / totalReviews
      : 0;

  const reviewsBySource = reviewsData.reduce(
    (acc: Record<string, number>, review: any) => {
      const source = review.reviewSource.name;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    },
    {}
  );

  const reviewsByRating = reviewsData.reduce(
    (acc: Record<string, number>, review: any) => {
      const rating = review.rating.toString();
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    },
    {}
  );

  // Staff productivity
  const staffTickets = await prisma.ticket.groupBy({
    by: ["staffId"],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: true,
  });

  const staffWithTickets = await prisma.staff.findMany({
    where: {
      id: {
        in: staffTickets.map((st: any) => st.staffId),
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      availability: true,
      createdAt: true,
      _count: {
        select: {
          tickets: true,
          ticketComments: true,
          notes: true,
        },
      },
    },
  });

  const staffProductivity = staffTickets.map((st: any) => {
    const staff = staffWithTickets.find((s: any) => s.id === st.staffId);
    return {
      staffId: st.staffId,
      staffName: staff ? `${staff.firstName} ${staff.lastName}` : "Unknown",
      role: staff?.role || "Unknown",
      availability: staff?.availability || "Unknown",
      ticketCount: st._count,
      commentCount: staff?._count.ticketComments || 0,
      noteCount: staff?._count.notes || 0,
      experienceYears: staff
        ? Math.floor(
            (new Date().getTime() - new Date(staff.createdAt).getTime()) /
              (1000 * 60 * 60 * 24 * 365)
          )
        : 0,
    };
  });

  // Get role distribution
  const roleDistribution = await prisma.staff.groupBy({
    by: ["role"],
    _count: true,
    where: {
      isActive: true,
    },
  });

  // Get availability distribution
  const availabilityDistribution = await prisma.staff.groupBy({
    by: ["availability"],
    _count: true,
    where: {
      isActive: true,
    },
  });

  // Calculate top performers
  const topPerformers = [...staffProductivity]
    .sort((a, b) => b.ticketCount - a.ticketCount)
    .slice(0, 5);

  return {
    customers: {
      totalCustomers,
      newCustomers,
      activeCustomers,
      activityRate:
        totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
      bookings: {
        total: bookings,
        byStatus: bookingStatusCounts,
        byType: bookingTypeCounts,
        conversionRate,
      },
      mailIns: {
        total: mailIns,
        byStatus: mailInStatusCounts,
        conversionRate: mailInConversionRate,
      },
      tickets: {
        total: tickets,
        byStatus: ticketStatusCounts,
        completionRate: ticketCompletionRate,
      },
      referrals: {
        total: 0,
        successful: 0,
        conversionRate: 0,
        rewardsEarned: 0,
        rewardsRedeemed: 0,
      },
      loyalty: {
        totalPoints,
        activeMembers,
        redemptionRate,
        pointsRedeemed,
        monthlyStats,
      },
      storeCredit: {
        accounts: totalStoreCredits,
        totalBalance: totalCreditBalance,
        averageBalance: averageCreditBalance,
        transactions: {
          total: recentTransactions,
          earned: earnTransactions,
          deducted: deductTransactions,
        },
      },
      reviews: {
        total: totalReviews,
        averageRating,
        bySource: reviewsBySource,
        byRating: reviewsByRating,
      },
    },
    staff: {
      productivity: staffProductivity,
      roleDistribution,
      availabilityDistribution,
      topPerformers,
    },
    period,
    dateRange: { startDate, endDate },
  };
}

// Financial Analytics
export async function getFinancialAnalytics(
  period: string = "monthly",
  customStartDate?: Date,
  customEndDate?: Date
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (period === "custom" && customStartDate) {
    startDate = customStartDate;
    endDate = customEndDate || now;
  } else {
    switch (period) {
      case "weekly":
        startDate = add(now, { days: -7 });
        break;
      case "monthly":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "quarterly":
        startDate = add(now, { months: -3 });
        break;
      case "yearly":
        startDate = add(now, { years: -1 });
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }
  }

  // Transactions feature has been removed
  const income = 0;
  const expenses = 0;

  // Get bills
  const bills = await prisma.bill.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const paidBills = bills.filter((b: any) => b.status === "PAID");
  const unpaidBills = bills.filter((b: any) => b.status === "UNPAID");
  const overdueBills = bills.filter((b: any) => b.status === "OVERDUE");

  // Get payroll data
  const payroll = await prisma.payroll.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalPayroll = payroll.reduce(
    (sum: number, p: any) => sum + p.netPay,
    0
  );

  // Get goals data
  const goals = await prisma.goal.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      goalCategory: true,
      staff: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  // Calculate goals analytics
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g: any) => g.progress >= 100).length;
  const activeGoals = goals.filter((g: any) => g.progress < 100 && !g.archivedAt).length;
  const archivedGoals = goals.filter((g: any) => g.archivedAt).length;
  const totalTargetAmount = goals.reduce((sum: number, g: any) => sum + g.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum: number, g: any) => sum + g.currentAmount, 0);
  const averageProgress = totalGoals > 0 ? goals.reduce((sum: number, g: any) => sum + g.progress, 0) / totalGoals : 0;

  // Category breakdown for goals
  const categoryBreakdown = goals.reduce((acc: Record<string, any>, goal: any) => {
    const category = goal.goalCategory?.name || "Uncategorized";
    if (!acc[category]) {
      acc[category] = { count: 0, totalTarget: 0, totalCurrent: 0 };
    }
    acc[category].count += 1;
    acc[category].totalTarget += goal.targetAmount;
    acc[category].totalCurrent += goal.currentAmount;
    return acc;
  }, {} as Record<string, any>);

  // Category breakdown - Transactions feature has been removed
  const expensesByCategory = {} as Record<string, number>;

  // Calculate monthly comparison (current period vs previous period)
  // Adjust the comparison period to be the same length as the selected period
  const periodLengthInDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const previousPeriodStart = new Date(startDate);
  previousPeriodStart.setDate(
    previousPeriodStart.getDate() - periodLengthInDays
  );
  const previousPeriodEnd = new Date(startDate);
  previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);

  // Previous transactions - Transactions feature has been removed
  const previousIncome = 0;
  const previousExpenses = 0;

  const incomeChange =
    previousIncome > 0
      ? ((income - previousIncome) / previousIncome) * 100
      : income > 0
      ? 100
      : 0;

  const expenseChange =
    previousExpenses > 0
      ? ((expenses - previousExpenses) / previousExpenses) * 100
      : expenses > 0
      ? 100
      : 0;

  return {
    overview: {
      income,
      expenses,
      profit: income - expenses,
      profitMargin: income > 0 ? ((income - expenses) / income) * 100 : 0,
    },
    bills: {
      total: bills.length,
      paid: paidBills.length,
      unpaid: unpaidBills.length,
      overdue: overdueBills.length,
      totalAmount: bills.reduce((sum: number, b: any) => sum + b.amount, 0),
      items: bills, // Add the full bills array for the BillAnalytics component
    },
    payroll: {
      totalPayroll,
      employeeCount: [...new Set(payroll.map((p: any) => p.staffId))].length,
    },
    goals: {
      total: totalGoals,
      completed: completedGoals,
      active: activeGoals,
      archived: archivedGoals,
      averageProgress: averageProgress,
      byCategory: categoryBreakdown,
      items: goals, // Add the full goals array for the GoalAnalytics component
    },
    expensesByCategory,
    trends: {
      incomeChange,
      expenseChange,
      periodCompare: {
        current: { startDate, endDate },
        previous: {
          startDate: previousPeriodStart,
          endDate: previousPeriodEnd,
        },
      },
    },
    period,
    dateRange: { startDate, endDate },
  };
}

// Location Analytics
export async function getLocationAnalytics(
  period: string = "monthly",
  customStartDate?: Date,
  customEndDate?: Date
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (period === "custom" && customStartDate) {
    startDate = customStartDate;
    endDate = customEndDate || now;
  } else {
    switch (period) {
      case "weekly":
        startDate = add(now, { days: -7 });
        break;
      case "monthly":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "quarterly":
        startDate = add(now, { months: -3 });
        break;
      case "yearly":
        startDate = add(now, { years: -1 });
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }
  }

  // Get all locations
  const locations = await prisma.storeLocation.findMany({
    where: {
      isActive: true,
    },
  });

  // Get tickets by location
  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const ticketsByLocation = tickets.reduce(
    (acc: Record<string, number>, ticket: any) => {
      acc[ticket.location] = (acc[ticket.location] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Get revenue by location using paid orders
  const paidOrders = await prisma.order.findMany({
    where: {
      status: "PAID",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
      storeLocation: true,
    },
  });

  const salesByLocation = paidOrders.reduce(
    (acc: Record<string, number>, order: any) => {
      const locationName = order.storeLocation?.name || "Unknown";
      const orderTotal = order.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      acc[locationName] = (acc[locationName] || 0) + orderTotal;
      return acc;
    },
    {} as Record<string, number>
  );

  // Get inventory levels by location
  const inventoryByLocation = await Promise.all(
    locations.map(async (location: any) => {
      const stockLevels = await prisma.inventoryStockLevel.findMany({
        where: {
          locationId: location.id,
        },
        include: {
          variation: true,
        },
      });

      const totalStock = stockLevels.reduce(
        (sum: number, sl: any) => sum + sl.stock,
        0
      );
      const totalValue = stockLevels.reduce((sum: number, sl: any) => {
        return sum + sl.stock * (sl.variation.sellingPrice || 0);
      }, 0);

      return {
        locationId: location.id,
        locationName: location.name,
        totalStock,
        totalValue,
        lowStockCount: stockLevels.filter((sl: any) => sl.stock < 5).length,
      };
    })
  );

  return {
    ticketsByLocation,
    salesByLocation,
    inventoryByLocation,
    locationCount: locations.length,
    period,
    dateRange: { startDate, endDate },
  };
}

// Get transaction analytics
// Transaction analytics removed - Transactions feature has been deleted
export async function getTransactionAnalytics(
  period: string = "monthly",
  customStartDate?: Date,
  customEndDate?: Date
) {
  return {
    transactions: [],
    summary: {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      transactionCount: 0,
      incomeCount: 0,
      expenseCount: 0,
    },
    categoryBreakdown: {},
    locationBreakdown: {},
    period,
    dateRange: { startDate: new Date(), endDate: new Date() },
  };
}

// Get analytics for all feature areas
export async function getComprehensiveAnalytics(
  period: string = "monthly",
  customStartDate?: Date,
  customEndDate?: Date
) {
  // Get all analytics concurrently
  const [
    repairAnalytics,
    communicationsAnalytics,
    inventoryAnalytics,
    customerAnalytics,
    financialAnalytics,
    locationAnalytics,
    revenueFromSales,
    transactionAnalytics,
  ] = await Promise.all([
    getRepairAnalytics(period, customStartDate, customEndDate),
    getCommunicationsAnalytics(period, customStartDate, customEndDate),
    getInventoryAnalytics(period, customStartDate, customEndDate),
    getCustomerAnalytics(period, customStartDate, customEndDate),
    getFinancialAnalytics(period, customStartDate, customEndDate),
    getLocationAnalytics(period, customStartDate, customEndDate),
    calculateRevenueFromSales(period, customStartDate, customEndDate),
    getTransactionAnalytics(period, customStartDate, customEndDate),
  ]);

  // Add combined metrics for overview dashboard
  const totalServiceRevenue = revenueFromSales.incomeFromServices || 0;
  const totalSalesRevenue = revenueFromSales.incomeFromProducts || 0;
  const totalRepairRevenue = revenueFromSales.incomeFromRepairs || 0;
  const totalCustomRevenue = revenueFromSales.incomeFromCustom || 0;

  const overallBusinessRevenue =
    totalServiceRevenue +
    totalSalesRevenue +
    totalRepairRevenue +
    totalCustomRevenue;

  // Calculate service distribution percentages for the business
  const serviceDistribution = {
    repairs:
      overallBusinessRevenue > 0
        ? (totalRepairRevenue / overallBusinessRevenue) * 100
        : 0,
    serviceDivision:
      overallBusinessRevenue > 0
        ? (totalServiceRevenue / overallBusinessRevenue) * 100
        : 0,
    salesDivision:
      overallBusinessRevenue > 0
        ? (totalSalesRevenue / overallBusinessRevenue) * 100
        : 0,
    customDivision:
      overallBusinessRevenue > 0
        ? (totalCustomRevenue / overallBusinessRevenue) * 100
        : 0,
  };

  return {
    repairs: repairAnalytics,
    communications: communicationsAnalytics,
    inventory: inventoryAnalytics,
    customers: customerAnalytics,
    financial: financialAnalytics,
    locations: locationAnalytics,
    transactions: transactionAnalytics,
    businessMetrics: {
      totalRevenue: overallBusinessRevenue,
      serviceDistribution,
    },
    period,
    dateRange: customStartDate
      ? { startDate: customStartDate, endDate: customEndDate || new Date() }
      : repairAnalytics.dateRange,
  };
}
