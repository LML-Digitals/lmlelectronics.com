import { SquareProduct, SquareProductVariation } from "./square";

export interface Product {
  id: string;
  name: string;
  description?: string;
  descriptionHtml?: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: ProductImage[];
  category?: {
    id: string;
    name: string;
  };
  variations: ProductVariation[];
  inStock: boolean;
  inventory?: number;
  tags?: string[];
  sku?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  metadata?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
  featured?: boolean;
  availableForPickup?: boolean;
  availableOnline?: boolean;
}

export interface ProductVariation {
  id: string;
  name?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  inStock: boolean;
  inventory?: number;
  images?: ProductImage[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  options?: Record<string, string>; // e.g., { color: 'red', size: 'large' }
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: ProductCategory[];
  productCount?: number;
}

// Search Results and Filters
export interface ProductSearchResult {
  products: Product[];
  facets?: {
    categories?: { id: string; name: string; count: number }[];
    priceRanges?: { min: number; max: number; count: number }[];
  };
  pagination?: {
    cursor?: string;
    hasMore: boolean;
  };
}

export interface ProductSearchFilters {
  query?: string;
  categoryIds?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: "name" | "price" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}

// Cart and Order Types
export interface CartItem {
  id: string;
  productId: string;
  variationId?: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image?: ProductImage;
  sku?: string;
  options?: Record<string, string>;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

// Utility Functions
export function formatPrice(
  amount: number | bigint,
  currency: string = "USD"
): string {
  const numAmount = typeof amount === "bigint" ? Number(amount) : amount;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  });

  // Square amounts are in cents, so divide by 100
  return formatter.format(numAmount / 100);
}

export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function convertSquareProductToProduct(
  squareProduct: SquareProduct
): Product {
  const mainVariation = squareProduct.itemData.variations?.[0];
  const price =
    mainVariation?.itemVariationData?.priceMoney?.amount || BigInt(0);

  return {
    id: squareProduct.id,
    name: squareProduct.itemData.name,
    description:
      squareProduct.itemData.descriptionPlaintext ||
      squareProduct.itemData.description,
    descriptionHtml: squareProduct.itemData.descriptionHtml,
    slug: createSlug(squareProduct.itemData.name),
    price: Number(price),
    currency: mainVariation?.itemVariationData?.priceMoney?.currency || "USD",
    images: [], // Will be populated from separate image data
    category: squareProduct.itemData.categoryId
      ? {
          id: squareProduct.itemData.categoryId,
          name: "", // Will be populated from category data
        }
      : undefined,
    variations:
      squareProduct.itemData.variations?.map(
        convertSquareVariationToVariation
      ) || [],
    inStock: mainVariation?.itemVariationData?.trackInventory !== true || true, // Default to true, will be updated with inventory data
    availableOnline: squareProduct.itemData.availableOnline !== false,
    availableForPickup: squareProduct.itemData.availableForPickup !== false,
    sku: mainVariation?.itemVariationData?.sku,
    createdAt: squareProduct.updatedAt,
    updatedAt: squareProduct.updatedAt,
  };
}

export function convertSquareVariationToVariation(
  variation: SquareProductVariation
): ProductVariation {
  const price = variation.itemVariationData?.priceMoney?.amount || BigInt(0);

  return {
    id: variation.id,
    name: variation.itemVariationData?.name,
    sku: variation.itemVariationData?.sku,
    price: Number(price),
    currency: variation.itemVariationData?.priceMoney?.currency || "USD",
    inStock: variation.itemVariationData?.trackInventory !== true || true, // Default to true, will be updated with inventory data
  };
}

export function convertPriceToSquareAmount(price: number): bigint {
  // Square expects amounts in cents
  return BigInt(Math.round(price * 100));
}

export function convertSquareAmountToPrice(amount: bigint): number {
  // Convert from cents to dollars
  return Number(amount) / 100;
}
