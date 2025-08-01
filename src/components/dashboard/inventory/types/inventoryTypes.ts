import { Prisma } from '@prisma/client';
// export type ItemsCategoryAndItsSubCategories = Prisma.ItemsCategoryGetPayload<{
//   include: { subCategories: true };
// }>;

// export type BrandAndItsItems = Prisma.InventoryItemBrandGetPayload<{
//   include: { items: true };
// }>;

export type VendorAndItsInventoryItems = Prisma.VendorGetPayload<{
  include: { inventoryItems: true };
}>;

export type VariationAndItsLocation = Prisma.InventoryVariationGetPayload<{
  include: {
    locations: {
      include: {
        location: true;
      };
    };
  };
}>;
