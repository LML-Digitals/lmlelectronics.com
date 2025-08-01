import { buildApiUrl } from "./api";
import {
  calculateTotalTaxRate,
  getActiveTaxRates,
  getTaxDueOverview,
  getTaxSummary,
} from "@/components/dashboard/tax/services/taxService";
import { TaxCategory } from "@prisma/client";

export async function calculateTax(amount: number): Promise<number> {
  try {
    // Get active tax rates
    const activeTaxRatesResult = await getActiveTaxRates();
    if (!activeTaxRatesResult.success) {
      throw new Error(activeTaxRatesResult.error || "Failed to get active tax rates");
    }

    // Filter by category if specified
    let applicableTaxRates = activeTaxRatesResult.taxRates;

    // Calculate tax amounts
    const taxCalculations = applicableTaxRates?.map((rate) => {
      const taxAmount = amount * (rate.rate / 100);
      return {
        taxRateId: rate.id,
        taxRateName: rate.name,
        category: rate.category,
        rate: rate.rate,
        taxableAmount: amount,
        taxAmount: taxAmount,
        totalAmount: amount + taxAmount,
      };
    });

    const totalTaxAmount =
      taxCalculations?.reduce((sum, calc) => sum + calc.taxAmount, 0) || 0;

    const totalTaxRate =
      applicableTaxRates?.reduce((sum, rate) => sum + rate.rate, 0) || 0;

    const responseData = {
      taxableAmount: amount,
      totalTaxRate: totalTaxRate,
      totalTaxAmount: totalTaxAmount,
      totalAmount: amount + totalTaxAmount,
      calculations: taxCalculations,
      summary: {
        subtotal: amount,
        tax: totalTaxAmount,
        total: amount + totalTaxAmount,
        effectiveRate: `${totalTaxRate}%`,
      },
    };

    const tax = responseData.totalTaxAmount;

    return tax;
  } catch (error) {
    console.error("Error calculating tax:", error);
    throw error;
  }
}
