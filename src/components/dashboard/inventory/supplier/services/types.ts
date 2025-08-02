import { Prisma } from '@prisma/client';

export type SupplierProps = Prisma.VendorGetPayload<{
  include: {
    purchaseOrders: true;
    inventoryItems: true;
  };
  orderBy: { createdAt: 'desc' };
}>;
