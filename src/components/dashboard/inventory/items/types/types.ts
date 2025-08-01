export type VariationImage = {
  file: File | null;
  preview: string | null;
  index: number;
};

export type CategoryWithChildren = {
  id: string;
  name: string;
  children: CategoryWithChildren[];
};

export type Location = {
  id: number;
  name: string;
};

export type Supplier = {
  id: number;
  name: string;
};

export interface StockLevel {
  stock: number;
  purchaseCost?: number;
  locationId?: number;
  location?: {
    id: number;
    name: string;
  };
}

export interface InventoryStockLevelUpdateInput {
  stock?: number;
  purchaseCost?: number | null;
  location?: {
    connect: {
      id: number;
    };
  };
}

export interface InventoryStockLevelCreateInput {
  stock: number;
  purchaseCost?: number | null;
  location: {
    connect: {
      id: number;
    };
  };
}

export interface InventoryStockLevelWhereUniqueInput {
  id?: string;
  locationId_variationId?: {
    locationId: number;
    variationId: string;
  };
}

export interface Variation {
  id?: string;
  name: string;
  sku: string;
  barcode?: string;
  image: string | null;
  stockLevels: Record<string, StockLevel>;
  raw?: number;
  tax?: number;
  shipping?: number;
  markup?: number;
  visible?: boolean;
  useDefaultRates?: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

export interface VariationFormData extends Variation {
  imageFile?: File | null;
  imagePreview?: string | null;
  imageChanged?: boolean;
}

export interface VariationUpdateInput {
  id: string;
  name?: string;
  sku?: string;
  barcode?: string;
  image?: string | null;
  raw?: number;
  tax?: number;
  shipping?: number;
  markup?: number;
  sellingPrice?: number;
  profit?: number;
  totalCost?: number;
  visible?: boolean;
  useDefaultRates?: boolean;
  stockLevels?: Record<string, StockLevel>;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

// Helper function to find a category by ID in the tree structure
export function findCategoryById(
  categories: CategoryWithChildren[],
  id: string
): CategoryWithChildren | null {
  for (const category of categories) {
    if (category.id === id) return category;
    if (category.children.length > 0) {
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
  }
  return null;
}
