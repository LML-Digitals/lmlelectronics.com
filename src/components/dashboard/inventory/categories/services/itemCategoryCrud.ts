"use server";

import prisma from "@/lib/prisma";
import { decodeSlug } from "@/utils/formatSlug";
import type { InventoryItem, InventoryItemCategory } from "@prisma/client";

export type CategoryWithChildrenAndVariations = {
  id: string;
  name: string;
  image: string;
  parentId: string | null;
  visible: boolean;
  children: CategoryWithChildrenAndVariations[];
  items: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    variations: {
      id: string;
      name: string;
      sku: string;
      shipping: number;
      tax: number;
      markup: number;
      image: string | null;
      sellingPrice: number;
      visible: boolean;
    }[];
  }[];
};

export const getCategoryWithChildren = async () => {
  try {
    return await prisma.inventoryItemCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        children: true,
        items: true,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory categories:", error);
    throw new Error("Failed to fetch inventory categories");
  }
};

export const getCategories = async (): Promise<InventoryItemCategory[]> => {
  try {
    return await prisma.inventoryItemCategory.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching inventory categories:", error);
    throw new Error("Failed to fetch inventory categories");
  }
};

export const getCategory = async (categoryId: string) => {
  try {
    return await prisma.inventoryItemCategory.findUnique({
      where: { id: categoryId },
    });
  } catch (error) {
    console.error("Error fetching inventory category:", error);
    throw new Error("Failed to fetch inventory category");
  }
};

export interface ItemCategory {
  id: string;
  name: string;
  image: string;
  description: string;
  visible: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  parentId: string | null;
  children: InventoryItemCategory[];
  items: InventoryItem[];
}

export const getInventoryCategories = async (): Promise<ItemCategory[]> => {
  try {
    const categories = await prisma.inventoryItemCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        children: true,
        items: true,
      },
    });

    return categories.map((category) => ({
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching inventory categories:", error);
    throw new Error("Failed to fetch inventory categories");
  }
};

type CreateCategoryResponse = {
  category: InventoryItemCategory;
  status: string;
};

type CreateCategoryInput = {
  name: string;
  parentId?: string | null;
  visible: boolean;
  description: string;
  image: string;
};

export const createCategory = async (
  data: CreateCategoryInput
): Promise<CreateCategoryResponse> => {
  try {
    const category = await prisma.inventoryItemCategory.create({
      data: {
        name: data.name,
        parentId: data.parentId || null,
        visible: data.visible,
        description: data.description,
        image: data.image,
      },
    });

    return { category, status: "success" };
  } catch (error) {
    console.error("Error creating inventory category:", error);
    throw new Error("Failed to create inventory category");
  }
};

type UpdateCategoryInput = {
  name: string;
  parentId?: string | null;
  visible: boolean;
  description: string;
  image: string;
};

type UpdateCategoryResponse = {
  status: string;
};

export const updateCategory = async (
  categoryId: string,
  data: UpdateCategoryInput
): Promise<UpdateCategoryResponse> => {
  try {
    const existingCategory = await prisma.inventoryItemCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) return { status: "error" };

    await prisma.inventoryItemCategory.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        parentId: data.parentId,
        visible: data.visible,
        description: data.description,
        image: data.image,
      },
    });

    return { status: "success" };
  } catch (error) {
    return { status: "error" };
  }
};

export type DeleteCategoryResponse = {
  status: string;
  message: string;
};

export const deleteItemCategory = async (
  categoryId: string
): Promise<DeleteCategoryResponse> => {
  try {
    const deletedCategory = await prisma.inventoryItemCategory.delete({
      where: { id: categoryId },
    });

    if (!deletedCategory) {
      throw new Error("Category Not found");
    }

    return { status: "success", message: "Category Successfully Deleted" };
  } catch (error) {
    throw new Error("Failed to Delete category");
  }
};

export async function getCategoryHierarchy(categoryId?: string) {
  return prisma.inventoryItemCategory.findMany({
    where: {
      parentId: categoryId || null,
    },
    include: {
      children: true,
      items: {
        select: { id: true, name: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getItemsByCategoryId(categoryId: string) {
  return prisma.inventoryItem.findMany({
    where: {
      categories: {
        some: {
          id: categoryId,
        },
      },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

// New function to get items with their variations by category
export async function getItemsWithVariationsByCategory(
  categoryName: string,
  limit?: number
) {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: {
        categories: {
          some: {
            name: categoryName,
            // Removed visibility check - will show items regardless of category visibility
          },
        },
      },
      include: {
        variations: {
          where: {
            visible: true,
          },
          select: {
            id: true,
            name: true,
            sku: true,
            image: true,
            sellingPrice: true,
            raw: true,
            tax: true,
            shipping: true,
            markup: true,
            totalCost: true,
            profit: true,
            stockLevels: {
              select: {
                stock: true,
                locationId: true,
                location: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
      take: limit,
    });

    return items;
  } catch (error) {
    console.error("Error fetching items with variations by category:", error);
    throw new Error("Failed to fetch items with variations");
  }
}

// New server action to add an item to a category (many-to-many relationship)
export type AddItemToCategoryResponse = {
  success: boolean;
  message: string;
};

export async function addItemToCategory(
  itemId: string,
  categoryId: string
): Promise<AddItemToCategoryResponse> {
  try {
    // Check if the item and category exist
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: { categories: true },
    });

    const category = await prisma.inventoryItemCategory.findUnique({
      where: { id: categoryId },
    });

    if (!item) {
      return { success: false, message: "Item not found" };
    }

    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // Check if this relationship already exists
    const existingRelation = item.categories.some(
      (cat) => cat.id === categoryId
    );

    if (existingRelation) {
      return {
        success: true,
        message: "Item is already assigned to this category",
      };
    }

    // Add the category to the item (many-to-many relationship)
    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        categories: {
          connect: { id: categoryId },
        },
      },
    });

    return {
      success: true,
      message: "Item added to category successfully",
    };
  } catch (error) {
    console.error("Error adding item to category:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to add item to category",
    };
  }
}

// Server action to remove an item from a category
export type RemoveItemFromCategoryResponse = {
  success: boolean;
  message: string;
};

export async function removeItemFromCategory(
  itemId: string,
  categoryId: string
): Promise<RemoveItemFromCategoryResponse> {
  try {
    // Check if the item exists
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: { categories: true },
    });

    if (!item) {
      return { success: false, message: "Item not found" };
    }

    // Check if the relationship exists
    const hasRelation = item.categories.some((cat) => cat.id === categoryId);

    if (!hasRelation) {
      return {
        success: true,
        message: "Item is not assigned to this category",
      };
    }

    // Remove the category from the item
    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        categories: {
          disconnect: { id: categoryId },
        },
      },
    });

    return {
      success: true,
      message: "Item removed from category successfully",
    };
  } catch (error) {
    console.error("Error removing item from category:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to remove item from category",
    };
  }
}

export async function getInventoryCategoryBySlug(slug: string) {
  try {
    const categoryName = decodeSlug(slug);

    const category = await prisma.inventoryItemCategory.findFirst({
      where: {
        AND: [
          {
            name: {
              equals: categoryName,
              mode: "insensitive",
            },
          },
          {
            visible: true,
          },
          {
            // Filter out categories that should not appear on the products page
            name: {
              notIn: [
                "Tickets",
                "tickets",
                "Ticket",
                "ticket",
                "Internal",
                "internal",
                "Admin",
                "admin",
                "System",
                "system",
              ],
            },
          },
        ],
      },
      include: {
        children: {
          where: {
            visible: true,
          },
          include: {
            items: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
                variations: {
                  where: {
                    visible: true,
                  },
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    shipping: true,
                    tax: true,
                    markup: true,
                    image: true,
                    sellingPrice: true,
                    visible: true,
                  },
                },
              },
            },
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            variations: {
              where: {
                visible: true,
              },
              select: {
                id: true,
                name: true,
                sku: true,
                shipping: true,
                tax: true,
                markup: true,
                image: true,
                sellingPrice: true,
                visible: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    const processedCategory = processCategory(category);

    return processedCategory;
  } catch (error) {
    console.error("Error fetching inventory category:", error);
    throw error;
  }
}

function processCategory(category: any): CategoryWithChildrenAndVariations {
  // Process children recursively (handle undefined children)
  const processedChildren = (category.children || [])
    .map((child: any) => processCategory(child))
    .filter((child: CategoryWithChildrenAndVariations) => {
      // Keep child if it's visible or has visible children
      return child.visible || child.children.length > 0;
    });

  // Filter items to only include those with visible variations (handle undefined items)
  const processedItems = (category.items || []).filter((item: any) => {
    return item.variations && item.variations.length > 0;
  });

  return {
    id: category.id,
    name: category.name,
    image: category.image,
    parentId: category.parentId,
    visible: category.visible,
    children: processedChildren,
    items: processedItems,
  };
}
