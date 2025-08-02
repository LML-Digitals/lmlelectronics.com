import { Prisma } from "@prisma/client";

export type InventoryItemWithRelations = Prisma.InventoryItemGetPayload<{
  include: {
    categories: true;
    supplier: true;
    tags: true;
    warrantyType: true;
    variations: {
      include: {
        stockLevels: {
          include: {
            location: true;
          };
        };
      };
    };
  };
}>;

export type VariationWithStockLevels = Prisma.InventoryVariationGetPayload<{
  include: {
    stockLevels: {
      include: {
        location: true;
      };
    };
  };
}>;

export type CreateItemInput = {
  name: string;
  description?: string;
  image?: string | null;
  categoryIds: number[];
  vendorId?: number | null;
  warrantyTypeId?: string | null;
  variations?: {
    name: string;
    sku: string;
    image?: string | null;
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
    stockLevels: {
      locationId: number;
      stock: number;
      purchaseCost?: number;
    }[];
  }[];
};
