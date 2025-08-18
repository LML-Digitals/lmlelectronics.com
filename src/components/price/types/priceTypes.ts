export interface PriceItem {
  id: string;
  name: string;
  type: 'repair' | 'product';
  basePrice: number;
  finalPrice: number;
  discountAmount?: number;
  discountPercentage?: number;
  hasPromotion: boolean;
  description?: string;
  imageUrl?: string;
  category?: string;
  itemId: string; // ID of the actual repair or inventory variation

  // Extended properties for detailed view
  // For product items
  raw?: number;
  tax?: number;
  shipping?: number;
  markup?: number;
  profit?: number;

  // For repair items
  labour?: number;

  // Variation details for repair items
  variation?: {
    id?: string;
    name?: string;
    raw?: number;
    tax?: number;
    shipping?: number;
    sku?: string;
  };

  // Navigation information for linking to detail pages
  navigationInfo?: {
    // For repair items
    deviceTypeName?: string;
    brandName?: string;
    seriesName?: string;
    modelName?: string;

    // For product items
    itemId?: string;
    inventoryItemId?: string;
    category?: string;
  };
}

export interface RepairPrice {
  id: string;
  name: string;
  price?: number;
  labour: number;
  description?: string;
  typeOfRepairId: string;
  typeOfRepairName: string;
  modelName?: string;
  seriesName?: string;
  brandName?: string;
}

export interface ProductPrice {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  raw: number;
  tax?: number;
  shipping?: number;
  markup?: number;
  profit?: number;
  itemName: string;
  image?: string;
  category?: string;
}

export interface Discount {
  id: string;
  name: string;
  sku: string;
  description?: string;
  value?: number;
  percentage?: number;
  type: string;
  isActive: boolean;
}

export interface PriceSearchParams {
  query: string;
  type?: 'repair' | 'product' | 'all';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
}

export interface PriceSearchResult {
  items: PriceItem[];
  totalCount: number;
  hasMore: boolean;
}
