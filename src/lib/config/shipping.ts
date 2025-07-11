import { buildApiUrl } from "./api";

export async function calculateShipping(state: string): Promise<number> {
  try {
    const response = await fetch(
      buildApiUrl(`/api/shipping/calculate?state=${state}`)
    );

    if (!response.ok) {
      throw new Error("Failed to calculate shipping");
    }

    const data = await response.json();

    if (data.success) {
      return data.shippingCost;
    }

    throw new Error(data.error || "Failed to get shipping rate");
  } catch (error) {
    console.error("Error calculating shipping:", error);
    throw error;
  }
}
