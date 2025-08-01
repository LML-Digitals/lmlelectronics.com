"use server";

import { BlogCategory } from "@prisma/client";
import prisma from "@/lib/prisma";
import { BlogWithDetailsType } from "../types/blogTypes";

// Type for creating/updating category data
export type CategoryData = {
  name: string;
  description?: string;
};

export const getBlogCategories = async (): Promise<BlogCategory[]> => {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: "asc" }, // Optional: Order categories alphabetically
      take: 1000, // Ensure we get all categories
    });
    return categories;
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    throw new Error("Failed to fetch blog categories");
  }
};

export const getBlogCategoryByName = async (
  name: string
): Promise<BlogCategory | null> => {
  try {
    const category = await prisma.blogCategory.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    return category;
  } catch (error) {
    console.error("Error fetching blog category by name:", error);
    throw new Error("Failed to fetch blog category by name");
  }
};

export const createBlogCategory = async (
  categoryData: CategoryData
): Promise<BlogCategory> => {
  try {
    // Optional: Add validation or check for existing category name if needed
    const newCategory = await prisma.blogCategory.create({
      data: categoryData,
    });
    return newCategory;
  } catch (error) {
    console.error("Error creating blog category:", error);
    // Consider more specific error handling, e.g., for unique constraints
    throw new Error("Failed to create blog category");
  }
};

export const updateBlogCategory = async (
  categoryId: string,
  categoryData: Partial<CategoryData>
): Promise<BlogCategory> => {
  try {
    const updatedCategory = await prisma.blogCategory.update({
      where: { id: categoryId },
      data: categoryData,
    });
    return updatedCategory;
  } catch (error) {
    console.error("Error updating blog category:", error);
    throw new Error("Failed to update blog category");
  }
};

export const deleteBlogCategory = async (categoryId: string): Promise<void> => {
  try {
    // Check if any blogs are using this category
    const blogsUsingCategory = await prisma.blog.count({
      where: { categoryId: categoryId },
    });

    if (blogsUsingCategory > 0) {
      throw new Error(
        "Cannot delete category: It is currently associated with one or more blogs."
      );
    }

    await prisma.blogCategory.delete({
      where: { id: categoryId },
    });
  } catch (error) {
    console.error("Error deleting blog category:", error);
    // Re-throw custom error or the original error
    if (
      error instanceof Error &&
      error.message.startsWith("Cannot delete category")
    ) {
      throw error;
    }
    throw new Error("Failed to delete blog category");
  }
};

export const getBlogByCategoryName = async (
  name: string
): Promise<BlogWithDetailsType[]> => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { category: { name } },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tags: true,
        category: true,
      },
    });
    return blogs;
  } catch (error) {
    console.error("Error fetching blogs by category name:", error);
    throw new Error("Failed to fetch blogs by category name");
  }
};
