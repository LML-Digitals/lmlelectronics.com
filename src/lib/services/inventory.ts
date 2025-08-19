import { buildApiUrl, handleApiResponse } from "@/lib/config/api";
import { InventoryItem, InventoryItemCategory } from "@/types/api";

// Function to get all inventory items from LML repair API
export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const response = await fetch(buildApiUrl("/api/inventory/items"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<InventoryItem[]>(response);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    // Return empty array as fallback
    return [];
  }
}

// Function to get a single inventory item from LML repair API
export async function getInventoryItem(id: string): Promise<InventoryItem | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/inventory/items/${id}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<InventoryItem>(response);
  } catch (error) {
    console.error(`Error fetching inventory item ${id}:`, error);
    return null;
  }
}

// Function to get all inventory categories from LML repair API
export async function getInventoryCategories(): Promise<InventoryItemCategory[]> {
  try {
    const response = await fetch(buildApiUrl("/api/inventory/categories"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<InventoryItemCategory[]>(response);
  } catch (error) {
    console.error("Error fetching inventory categories:", error);
    // Return fallback categories
    return [
      {
        id: "phones",
        name: "Phones",
        description: "Mobile phone parts and accessories",
        image: "/images/category-placeholder.jpg",
        visible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
        children: [],
        parentId: null,
      },
      {
        id: "tablets",
        name: "Tablets",
        description: "Tablet parts and accessories",
        image: "/images/category-placeholder.jpg",
        visible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
        children: [],
        parentId: null,
      },
      {
        id: "laptops",
        name: "Laptops",
        description: "Laptop parts and accessories",
        image: "/images/category-placeholder.jpg",
        visible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
        children: [],
        parentId: null,
      },
    ];
  }
}

// Function to get inventory category by slug from LML repair API
export async function getInventoryCategoryBySlug(slug: string): Promise<InventoryItemCategory | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/inventory/categories/${slug}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<InventoryItemCategory>(response);
  } catch (error) {
    console.error(`Error fetching inventory category ${slug}:`, error);
    return null;
  }
}