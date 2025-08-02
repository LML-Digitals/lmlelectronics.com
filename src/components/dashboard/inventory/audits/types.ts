import { Prisma } from "@prisma/client";

export type AuditProps = Prisma.InventoryAuditGetPayload<{
  include: {
    inventoryItem: true;
    inventoryVariation: true;
    location: true;
    staff: true;
  };
  orderBy: { createdAt: "desc" };
}>;
