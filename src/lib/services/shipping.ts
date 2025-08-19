import { buildApiUrl, handleApiResponse } from "@/lib/config/api";

// Function to calculate shipping cost from LML repair API
export async function calculateShippingCost(state: string): Promise<{ success: boolean; shippingCost?: number; error?: string }> {
  try {
    const response = await fetch(buildApiUrl(`/api/shipping/calculate`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state }),
    });

    return await handleApiResponse<{ success: boolean; shippingCost?: number; error?: string }>(response);
  } catch (error) {
    console.error("Error calculating shipping cost:", error);
    return { success: false, error: "Failed to calculate shipping cost" };
  }
}

// Function to get shipping rate by state from LML repair API
export async function getShippingRateByState(state: string): Promise<{ success: boolean; rate?: number; error?: string }> {
  try {
    const response = await fetch(buildApiUrl(`/api/shipping/rates/${state}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<{ success: boolean; rate?: number; error?: string }>(response);
  } catch (error) {
    console.error("Error getting shipping rate:", error);
    return { success: false, error: "Failed to get shipping rate" };
  }
}