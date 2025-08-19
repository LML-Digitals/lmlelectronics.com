import { buildApiUrl, handleApiResponse } from "@/lib/config/api";
import { Bundle } from "@/types/api";

// Function to get all bundles from LML repair API
export async function getBundles(): Promise<Bundle[]> {
  try {
    const response = await fetch(buildApiUrl("/api/inventory/bundles"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<Bundle[]>(response);
  } catch (error) {
    console.error("Error fetching bundles:", error);
    // Return empty array as fallback
    return [];
  }
}

// Function to get a single bundle by ID from LML repair API
export async function getBundleById(id: string): Promise<Bundle | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/inventory/bundles/${id}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<Bundle>(response);
  } catch (error) {
    console.error(`Error fetching bundle ${id}:`, error);
    return null;
  }
}