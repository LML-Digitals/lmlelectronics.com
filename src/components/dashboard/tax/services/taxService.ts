"use server";

import { TaxCategory } from "@prisma/client";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import prisma from "@/lib/prisma";

export type TaxRateInput = {
  id?: string;
  name: string;
  description?: string;
  category: TaxCategory;
  rate: number;
  isActive: boolean;
};

export type TaxReportFilters = {
  from?: Date;
  to?: Date;
  category?: TaxCategory;
  isPaid?: boolean;
};

export type TaxSummary = {
  totalTaxable: number;
  totalTaxDue: number;
  totalPaid: number;
  totalUnpaid: number;
  byCategoryBreakdown: {
    category: TaxCategory;
    taxable: number;
    taxDue: number;
  }[];
};

// Create a new tax rate
export async function createTaxRate(data: TaxRateInput) {
  try {
    const taxRate = await prisma.taxRate.create({
      data: {
        name: data.name,
        description: data.description || "",
        category: data.category,
        rate: data.rate,
        isActive: data.isActive,
      },
    });

    return { success: true, taxRate };
  } catch (error) {
    console.error("Error creating tax rate:", error);
    return { success: false, error: "Failed to create tax rate" };
  }
}

// Update an existing tax rate
export async function updateTaxRate(id: string, data: TaxRateInput) {
  try {
    const taxRate = await prisma.taxRate.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        rate: data.rate,
        isActive: data.isActive,
      },
    });

    return { success: true, taxRate };
  } catch (error) {
    console.error("Error updating tax rate:", error);
    return { success: false, error: "Failed to update tax rate" };
  }
}

// Get all tax rates
export async function getTaxRates() {
  try {
    const taxRates = await prisma.taxRate.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return { success: true, taxRates };
  } catch (error) {
    console.error("Error fetching tax rates:", error);
    return { success: false, error: "Failed to fetch tax rates" };
  }
}

// Get a single tax rate by ID
export async function getTaxRate(id: string) {
  try {
    const taxRate = await prisma.taxRate.findUnique({
      where: { id },
    });

    if (!taxRate) {
      return { success: false, error: "Tax rate not found" };
    }

    return { success: true, taxRate };
  } catch (error) {
    console.error("Error fetching tax rate:", error);
    return { success: false, error: "Failed to fetch tax rate" };
  }
}

// Delete a tax rate
export async function deleteTaxRate(id: string) {
  try {
    await prisma.taxRate.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting tax rate:", error);
    return { success: false, error: "Failed to delete tax rate" };
  }
}

// Get active tax rates
export async function getActiveTaxRates() {
  try {
    const taxRates = await prisma.taxRate.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return { success: true, taxRates };
  } catch (error) {
    console.error("Error fetching active tax rates:", error);
    return { success: false, error: "Failed to fetch active tax rates" };
  }
}

// Calculate total tax rate from all active rates
export async function calculateTotalTaxRate() {
  try {
    const { taxRates } = await getActiveTaxRates();

    if (!taxRates) {
      return { success: false, error: "Failed to fetch tax rates" };
    }

    const totalRate = taxRates.reduce((sum, rate) => sum + rate.rate, 0);

    return { success: true, totalRate, taxRates };
  } catch (error) {
    console.error("Error calculating total tax rate:", error);
    return { success: false, error: "Failed to calculate total tax rate" };
  }
}

// Create tax records for a register session
export async function createTaxRecordsForRegisterSession(
  registerSessionId: string,
  taxableAmount: number
) {
  try {
    const { taxRates } = await getActiveTaxRates();

    if (!taxRates || taxRates.length === 0) {
      return { success: false, error: "No active tax rates found" };
    }

    const results = [];
    const now = new Date();
    const periodStart = startOfDay(now);
    const periodEnd = endOfDay(now);

    for (const taxRate of taxRates) {
      const taxAmount = taxableAmount * (taxRate.rate / 100);

      const taxRecord = await prisma.taxRecord.create({
        data: {
          taxableAmount,
          taxAmount,
          periodStart,
          periodEnd,
          isPaid: false,
          registerSessionId,
          taxRateId: taxRate.id,
        },
      });

      results.push(taxRecord);
    }

    return {
      success: true,
      message: `Created ${results.length} tax records for register session.`,
      taxRecords: results,
    };
  } catch (error) {
    console.error("Error creating tax records for register session:", error);
    return { success: false, error: "Failed to create tax records" };
  }
}

// Create tax records for an order
export async function createTaxRecordsForOrder(
  orderId: string,
  taxableAmount: number
) {
  try {
    const { taxRates } = await getActiveTaxRates();

    if (!taxRates || taxRates.length === 0) {
      return { success: false, error: "No active tax rates found" };
    }

    const results = [];
    const now = new Date();
    const periodStart = startOfDay(now);
    const periodEnd = endOfDay(now);

    for (const taxRate of taxRates) {
      const taxAmount = taxableAmount * (taxRate.rate / 100);

      const taxRecord = await prisma.taxRecord.create({
        data: {
          taxableAmount,
          taxAmount,
          periodStart,
          periodEnd,
          isPaid: false,
          orderId,
          taxRateId: taxRate.id,
        },
      });

      results.push(taxRecord);
    }

    return {
      success: true,
      message: `Created ${results.length} tax records for order.`,
      taxRecords: results,
    };
  } catch (error) {
    console.error("Error creating tax records for order:", error);
    return { success: false, error: "Failed to create tax records" };
  }
}

// Create general tax records without requiring orderId or registerSessionId
export async function createTaxRecords(
  taxableAmount: number,
  options: {
    orderId?: string;
    registerSessionId?: string;
    category?: TaxCategory;
  } = {}
) {
  try {
    const { taxRates } = await getActiveTaxRates();

    if (!taxRates || taxRates.length === 0) {
      return { success: false, error: "No active tax rates found" };
    }

    // Filter by category if specified
    let applicableTaxRates = taxRates;
    if (options.category) {
      applicableTaxRates = taxRates.filter(
        (rate) => rate.category === options.category
      );
    }

    if (applicableTaxRates.length === 0) {
      return { success: false, error: "No applicable tax rates found" };
    }

    const results = [];
    const now = new Date();
    const periodStart = startOfDay(now);
    const periodEnd = endOfDay(now);

    for (const taxRate of applicableTaxRates) {
      const taxAmount = taxableAmount * (taxRate.rate / 100);

      const taxRecordData: any = {
        taxableAmount,
        taxAmount,
        periodStart,
        periodEnd,
        isPaid: false,
        taxRateId: taxRate.id,
      };

      // Add orderId or registerSessionId if provided
      if (options.orderId) {
        taxRecordData.orderId = options.orderId;
      }
      if (options.registerSessionId) {
        taxRecordData.registerSessionId = options.registerSessionId;
      }

      const taxRecord = await prisma.taxRecord.create({
        data: taxRecordData,
      });

      results.push(taxRecord);
    }

    return {
      success: true,
      message: `Created ${results.length} tax records.`,
      taxRecords: results,
    };
  } catch (error) {
    console.error("Error creating tax records:", error);
    return { success: false, error: "Failed to create tax records" };
  }
}

// Calculate and create tax records based on orders and register sessions
export async function calculateTaxes(periodStart: Date, periodEnd: Date) {
  try {
    // Get all active tax rates
    const { taxRates } = await getActiveTaxRates();

    if (!taxRates || taxRates.length === 0) {
      return { success: false, error: "No active tax rates found" };
    }

    // Get all orders in the specified period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay(periodStart),
          lte: endOfDay(periodEnd),
        },
      },
      include: {
        taxRecords: true,
      },
    });

    // Get all register sessions in the specified period
    const registerSessions = await prisma.registerSession.findMany({
      where: {
        createdAt: {
          gte: startOfDay(periodStart),
          lte: endOfDay(periodEnd),
        },
        status: "completed", // Only process completed sessions
      },
      include: {
        taxRecords: true,
      },
    });

    if (orders.length === 0 && registerSessions.length === 0) {
      return {
        success: false,
        error: "No orders or register sessions found for the specified period",
      };
    }

    const results = [];

    // Process orders
    for (const order of orders) {
      // Skip orders that already have tax records for this period
      if (
        order.taxRecords.some(
          (tr) =>
            tr.periodStart.getTime() === startOfDay(periodStart).getTime() &&
            tr.periodEnd.getTime() === endOfDay(periodEnd).getTime()
        )
      ) {
        continue;
      }

      for (const taxRate of taxRates) {
        const taxableAmount = order.subtotal;
        const taxAmount = taxableAmount * (taxRate.rate / 100);

        const taxRecord = await prisma.taxRecord.create({
          data: {
            taxableAmount,
            taxAmount,
            periodStart: startOfDay(periodStart),
            periodEnd: endOfDay(periodEnd),
            isPaid: false,
            orderId: order.id,
            taxRateId: taxRate.id,
          },
        });

        results.push(taxRecord);
      }
    }

    // Process register sessions
    for (const session of registerSessions) {
      // Skip sessions that already have tax records for this period
      if (
        session.taxRecords.some(
          (tr) =>
            tr.periodStart.getTime() === startOfDay(periodStart).getTime() &&
            tr.periodEnd.getTime() === endOfDay(periodEnd).getTime()
        )
      ) {
        continue;
      }

      for (const taxRate of taxRates) {
        const taxableAmount = session.subtotal;
        const taxAmount = taxableAmount * (taxRate.rate / 100);

        const taxRecord = await prisma.taxRecord.create({
          data: {
            taxableAmount,
            taxAmount,
            periodStart: startOfDay(periodStart),
            periodEnd: endOfDay(periodEnd),
            isPaid: false,
            registerSessionId: session.id,
            taxRateId: taxRate.id,
          },
        });

        results.push(taxRecord);
      }
    }

    return {
      success: true,
      message: `Created ${results.length} tax records.`,
      taxRecords: results,
    };
  } catch (error) {
    console.error("Error calculating taxes:", error);
    return { success: false, error: "Failed to calculate taxes" };
  }
}

// Get tax records with optional filtering
export async function getTaxRecords(filters: TaxReportFilters) {
  try {
    const where: any = {};

    // Apply date filters
    if (filters.from && filters.to) {
      where.periodStart = { gte: startOfDay(filters.from) };
      where.periodEnd = { lte: endOfDay(filters.to) };
    }

    // Apply payment status filter
    if (filters.isPaid !== undefined) {
      where.isPaid = filters.isPaid;
    }

    // Apply category filter
    if (filters.category) {
      where.taxRate = { category: filters.category };
    }

    const taxRecords = await prisma.taxRecord.findMany({
      where,
      include: {
        taxRate: true,
        order: true,
        registerSession: true,
      },
      orderBy: [{ periodStart: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, taxRecords };
  } catch (error) {
    console.error("Error fetching tax records:", error);
    return { success: false, error: "Failed to fetch tax records" };
  }
}

// Get tax summary for reports
export async function getTaxSummary(
  filters: TaxReportFilters
): Promise<{ success: boolean; summary?: TaxSummary; error?: string }> {
  try {
    const { taxRecords } = await getTaxRecords(filters);

    if (!taxRecords) {
      return { success: false, error: "Failed to fetch tax records" };
    }

    // Initialize summary
    const summary: TaxSummary = {
      totalTaxable: 0,
      totalTaxDue: 0,
      totalPaid: 0,
      totalUnpaid: 0,
      byCategoryBreakdown: [],
    };

    // Group by category for breakdown
    const categoryMap = new Map<
      TaxCategory,
      { taxable: number; taxDue: number }
    >();

    for (const record of taxRecords) {
      // Update totals
      summary.totalTaxable += record.taxableAmount;
      summary.totalTaxDue += record.taxAmount;

      if (record.isPaid) {
        summary.totalPaid += record.taxAmount;
      } else {
        summary.totalUnpaid += record.taxAmount;
      }

      // Update category breakdown
      const category = record.taxRate.category;
      const existing = categoryMap.get(category);

      if (existing) {
        existing.taxable += record.taxableAmount;
        existing.taxDue += record.taxAmount;
      } else {
        categoryMap.set(category, {
          taxable: record.taxableAmount,
          taxDue: record.taxAmount,
        });
      }
    }

    // Convert map to array for the response
    summary.byCategoryBreakdown = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        taxable: data.taxable,
        taxDue: data.taxDue,
      })
    );

    return { success: true, summary };
  } catch (error) {
    console.error("Error generating tax summary:", error);
    return { success: false, error: "Failed to generate tax summary" };
  }
}

// Mark tax records as paid
export async function markTaxAsPaid(
  ids: string[],
  paidDate: Date = new Date()
) {
  try {
    const result = await prisma.taxRecord.updateMany({
      where: { id: { in: ids } },
      data: {
        isPaid: true,
        paidDate,
      },
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error marking tax records as paid:", error);
    return { success: false, error: "Failed to mark tax records as paid" };
  }
}

// Get tax due for quick dashboard overview
export async function getTaxDueOverview() {
  try {
    const now = new Date();

    // Get monthly, quarterly, and yearly periods
    const monthlyStart = startOfMonth(now);
    const monthlyEnd = endOfMonth(now);

    const quarterStart = new Date(
      now.getFullYear(),
      Math.floor(now.getMonth() / 3) * 3,
      1
    );
    const quarterEnd = endOfMonth(
      new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 2, 1)
    );

    const yearlyStart = startOfYear(now);
    const yearlyEnd = endOfYear(now);

    // Query tax records for each period
    const [monthlyRecords, quarterlyRecords, yearlyRecords] = await Promise.all(
      [
        prisma.taxRecord.aggregate({
          where: {
            periodStart: { gte: monthlyStart },
            periodEnd: { lte: monthlyEnd },
            isPaid: false,
          },
          _sum: { taxAmount: true },
        }),
        prisma.taxRecord.aggregate({
          where: {
            periodStart: { gte: quarterStart },
            periodEnd: { lte: quarterEnd },
            isPaid: false,
          },
          _sum: { taxAmount: true },
        }),
        prisma.taxRecord.aggregate({
          where: {
            periodStart: { gte: yearlyStart },
            periodEnd: { lte: yearlyEnd },
            isPaid: false,
          },
          _sum: { taxAmount: true },
        }),
      ]
    );

    // Process results
    return {
      success: true,
      monthly: monthlyRecords._sum.taxAmount || 0,
      quarterly: quarterlyRecords._sum.taxAmount || 0,
      yearly: yearlyRecords._sum.taxAmount || 0,
    };
  } catch (error) {
    console.error("Error fetching tax due overview:", error);
    return {
      success: false,
      error: "Failed to fetch tax due overview",
      monthly: 0,
      quarterly: 0,
      yearly: 0,
    };
  }
}
