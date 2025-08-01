import { FAQ, FAQSubmission } from "@prisma/client";
import {
  searchFAQs as searchFAQsAdmin,
  getFAQs,
  createFAQSubmission,
} from "@/components/dashboard/faqs/Services/faqCrud";
import {
  createCustomer,
  getCustomer,
} from "@/components/dashboard/customers/services/customerCrud";

export async function getPublicFAQs(): Promise<FAQ[]> {
  try {
    // Use the existing getFAQs function but filter for published ones only
    const faqs = await getFAQs();
    return faqs.filter((faq) => faq.isPublished);
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
    // Use the existing searchFAQs function but filter for published ones only
    const results = await searchFAQsAdmin(query);
    return results.filter((faq) => faq.isPublished);
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
    // Split name into first and last names (basic split)
    const nameParts = submission.customerName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    let customerId: string | undefined;

    try {
      // 1. Find customer by email
      const existingCustomer = await getCustomer(submission.customerEmail);

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // 2. If not found, create a new customer
        try {
          const newCustomer = await createCustomer({
            firstName: firstName,
            lastName: lastName || "",
            email: submission.customerEmail,
          });
          customerId = newCustomer.id;
        } catch (createError) {
          console.error("Failed to create new customer:", createError);
        }
      }
    } catch (findError) {
      console.error("Error finding/creating customer:", findError);
    }

    // 3. Create the FAQ submission
    return await createFAQSubmission({
      customerName: submission.customerName,
      customerEmail: submission.customerEmail,
      question: submission.question,
    });
  } catch (error) {
    console.error("Error submitting FAQ:", error);
    // Rethrowing the specific error might be more informative
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
