import { buildApiUrl, handleApiResponse } from "@/lib/config/api";

// Function to get active tax rates from LML repair API
export async function getActiveTaxRates(): Promise<{ success: boolean; taxRates?: any[]; error?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/tax/rates"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<{ success: boolean; taxRates?: any[]; error?: string }>(response);
  } catch (error) {
    console.error("Error getting active tax rates:", error);
    return { success: false, error: "Failed to get active tax rates" };
  }
}

// Function to calculate total tax rate from LML repair API
export async function calculateTotalTaxRate(): Promise<{ success: boolean; totalRate?: number; error?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/tax/calculate-total"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<{ success: boolean; totalRate?: number; error?: string }>(response);
  } catch (error) {
    console.error("Error calculating total tax rate:", error);
    return { success: false, error: "Failed to calculate total tax rate" };
  }
}

// Function to get tax due overview from LML repair API
export async function getTaxDueOverview(): Promise<{ success: boolean; overview?: any; error?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/tax/overview"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<{ success: boolean; overview?: any; error?: string }>(response);
  } catch (error) {
    console.error("Error getting tax due overview:", error);
    return { success: false, error: "Failed to get tax due overview" };
  }
}

// Function to get tax summary from LML repair API
export async function getTaxSummary(): Promise<{ success: boolean; summary?: any; error?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/tax/summary"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<{ success: boolean; summary?: any; error?: string }>(response);
  } catch (error) {
    console.error("Error getting tax summary:", error);
    return { success: false, error: "Failed to get tax summary" };
  }
}