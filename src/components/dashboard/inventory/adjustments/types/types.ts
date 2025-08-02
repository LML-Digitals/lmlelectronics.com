import { Prisma } from "@prisma/client";

export type AdjustmentsProps = Prisma.InventoryAdjustmentGetPayload<{
  include: {
    inventoryItem: true;
    inventoryVariation: true;
    location: true;
    adjustedBy: true;
    approvedBy: true;
  };
  orderBy: { createdAt: "desc" };
}>;
