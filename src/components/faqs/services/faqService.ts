import { FAQ, FAQSubmission } from "@prisma/client";
import {
  getPublicFAQs as getPublicFAQsFromAPI,
  searchPublicFAQs as searchPublicFAQsFromAPI,
  submitFAQQuestion as submitFAQQuestionToAPI,
} from "@/lib/services/faq";

export async function getPublicFAQs(): Promise<FAQ[]> {
  try {
    return await getPublicFAQsFromAPI();
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

export async function getPublicFAQsByCategory(): Promise<
  Record<string, FAQ[]>
> {
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
    }, {} as Record<string, FAQ[]>);
  } catch (error) {
    console.error("Error fetching FAQs by category:", error);
    return {};
  }
}

export async function searchPublicFAQs(query: string): Promise<FAQ[]> {
  try {
    return await searchPublicFAQsFromAPI(query);
  } catch (error) {
    console.error("Error searching FAQs:", error);
    return [];
  }
}

export async function submitFAQQuestion(submission: {
  customerName: string;
  customerEmail: string;
  question: string;
}): Promise<FAQSubmission> {
  try {
    return await submitFAQQuestionToAPI(submission);
  } catch (error) {
    console.error("Error submitting FAQ:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to submit FAQ question: ${error.message}`);
    }
    throw new Error("Failed to submit FAQ question due to an unknown error");
  }
}

export async function getFAQsByCategory({
  category,
}: {
  category: string;
}): Promise<FAQ[]> {
  try {
    const faqs = await getPublicFAQs();
    return faqs.filter((faq) => faq.category === category);
  } catch (error) {
    console.error("Error fetching FAQs by category:", error);
    return [];
  }
}
