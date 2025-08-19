import { buildApiUrl, handleApiResponse } from "@/lib/config/api";

// Function to get public FAQs from LML repair API
export async function getPublicFAQs(): Promise<any[]> {
  try {
    const response = await fetch(buildApiUrl("/api/faqs"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const faqs = await handleApiResponse<any[]>(response);
    return faqs.filter((faq) => faq.isPublished);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

// Function to get FAQs by category from LML repair API
export async function getPublicFAQsByCategory(): Promise<Record<string, any[]>> {
  try {
    const faqs = await getPublicFAQs();
    // Group FAQs by category
    return faqs.reduce((acc, faq) => {
      const category = faq.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {} as Record<string, any[]>);
  } catch (error) {
    console.error("Error fetching FAQs by category:", error);
    return {};
  }
}

// Function to search public FAQs from LML repair API
export async function searchPublicFAQs(query: string): Promise<any[]> {
  try {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(buildApiUrl(`/api/faqs/search?${params}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const results = await handleApiResponse<any[]>(response);
    return results.filter((faq) => faq.isPublished);
  } catch (error) {
    console.error("Error searching FAQs:", error);
    return [];
  }
}

// Function to submit FAQ question to LML repair API
export async function submitFAQQuestion(submission: {
  customerName: string;
  customerEmail: string;
  question: string;
}): Promise<any> {
  try {
    const response = await fetch(buildApiUrl("/api/faqs/submit"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
    });

    return await handleApiResponse<any>(response);
  } catch (error) {
    console.error("Error submitting FAQ:", error);
    throw new Error("Failed to submit FAQ question");
  }
}

// Function to get FAQs by specific category from LML repair API
export async function getFAQsByCategory({
  category,
}: {
  category: string;
}): Promise<any[]> {
  try {
    const faqs = await getPublicFAQs();
    return faqs.filter((faq) => faq.category === category);
  } catch (error) {
    console.error("Error fetching FAQs by category:", error);
    return [];
  }
}