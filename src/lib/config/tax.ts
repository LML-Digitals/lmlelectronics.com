import { buildApiUrl } from "./api";

export async function calculateTax(amount: number): Promise<number> {
  try {
    // console.log(amount);
    const response = await fetch(buildApiUrl("/api/tax"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error("Failed to calculate tax");
    }

    const data = await response.json();
    // console.log(data);
    const tax = data.totalTaxAmount;
    // console.log(tax);
    return tax;
  } catch (error) {
    console.error("Error calculating tax:", error);
    throw error;
  }
}
