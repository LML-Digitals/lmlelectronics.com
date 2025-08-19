import { buildApiUrl, handleApiResponse } from "@/lib/config/api";

// Function to get all terms from LML repair API
export async function getTerms(): Promise<any[]> {
  try {
    const response = await fetch(buildApiUrl("/api/terms"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<any[]>(response);
  } catch (error) {
    console.error("Error fetching terms:", error);
    return [];
  }
}

// Function to get active terms from LML repair API
export async function getActiveTerms(): Promise<any[]> {
  try {
    const response = await fetch(buildApiUrl("/api/terms/active"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<any[]>(response);
  } catch (error) {
    console.error("Error fetching active terms:", error);
    return [];
  }
}

// Function to get active term by slug from LML repair API
export async function getActiveTermsBySlug(slug: string): Promise<any | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/terms/${slug}/active`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<any>(response);
  } catch (error) {
    console.error(`Error fetching active term ${slug}:`, error);
    return null;
  }
}

// Function to get term by slug from LML repair API
export async function getTermsBySlug(slug: string): Promise<any | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/terms/${slug}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<any>(response);
  } catch (error) {
    console.error(`Error fetching term ${slug}:`, error);
    return null;
  }
}