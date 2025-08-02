"use server";
import prisma from "@/lib/prisma";
import { FAQ, FAQSubmission } from "@prisma/client";

// FAQ Management
export const getFAQs = async (): Promise<FAQ[]> => {
  try {
    return await prisma.fAQ.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    throw new Error("Failed to fetch FAQs");
  }
};

export const createFAQ = async (
  data: Omit<FAQ, "id" | "createdAt" | "updatedAt">
) => {
  try {
    return await prisma.fAQ.create({
      data,
    });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    throw new Error("Failed to create FAQ");
  }
};

export const updateFAQ = async (
  id: string,
  data: Partial<Omit<FAQ, "id" | "createdAt" | "updatedAt">>
) => {
  try {
    return await prisma.fAQ.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    throw new Error("Failed to update FAQ");
  }
};

export const deleteFAQ = async (id: string) => {
  try {
    await prisma.fAQ.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    throw new Error("Failed to delete FAQ");
  }
};

// FAQ Submissions Management
export const getFAQSubmissions = async (
  status?: string
): Promise<FAQSubmission[]> => {
  try {
    return await prisma.fAQSubmission.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching FAQ submissions:", error);
    throw new Error("Failed to fetch FAQ submissions");
  }
};

export const updateFAQSubmissionStatus = async (
  id: string,
  status: "pending" | "approved" | "rejected"
) => {
  try {
    return await prisma.fAQSubmission.update({
      where: { id },
      data: { status },
    });
  } catch (error) {
    console.error("Error updating FAQ submission status:", error);
    throw new Error("Failed to update FAQ submission status");
  }
};

// Search and Filter Functions
export const searchFAQs = async (
  query: string,
  category?: string,
  isPublished?: boolean
): Promise<FAQ[]> => {
  try {
    return await prisma.fAQ.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { question: { contains: query } },
                  { answer: { contains: query } },
                ],
              }
            : {},
          category ? { category } : {},
          isPublished !== undefined ? { isPublished } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error searching FAQs:", error);
    throw new Error("Failed to search FAQs");
  }
};

export const getFAQsByCategory = async (category: string): Promise<FAQ[]> => {
  try {
    return await prisma.fAQ.findMany({
      where: {
        category: {
          equals: category,
          mode: "insensitive",
        },
        isPublished: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching FAQs by category:", error);
    throw new Error("Failed to fetch FAQs by category");
  }
};

// Customer Submission
export const createFAQSubmission = async (
  data: {
    customerName: string | null;
    customerEmail: string | null;
    question: string;
  }
) => {
  try {
    return await prisma.fAQSubmission.create({
      data: {
        ...data,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Error creating FAQ submission:", error);
    throw new Error("Failed to create FAQ submission");
  }
};

// Get FAQ Categories
export const getFAQCategories = async (): Promise<string[]> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    return faqs.map((faq) => faq.category);
  } catch (error) {
    console.error("Error fetching FAQ categories:", error);
    throw new Error("Failed to fetch FAQ categories");
  }
};
