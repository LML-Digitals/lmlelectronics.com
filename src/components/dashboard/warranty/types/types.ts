import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Warranty, WarrantyClaim, WarrantyType } from "@prisma/client";

export type WarrantyProps = Prisma.WarrantyGetPayload<{
  include: {
    customer: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
      };
    };
    inventoryItem: {
      select: {
        id: true;
        name: true;
        description: true;
      };
    };
    inventoryVariation: {
      select: {
        id: true;
        name: true;
        sku: true;
      };
    };
    warrantyType: true;
    warrantyClaims: true;
  };
  orderBy: {
    createdAt: "desc";
  };
}>;

export type WarrantyClaimProps = Prisma.WarrantyClaimGetPayload<{
  include: {
    customer: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
      };
    };
    warranty: {
      select: {
        id: true;
        warrantyType: true;
        inventoryItem: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
  orderBy: {
    createdAt: "desc";
  };
}>;

export type WarrantyTypeProps = Prisma.WarrantyTypeGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    duration: true;
    coverage: true;
    createdAt: true;
  };
}>;

// Extended coverage type
export type WarrantyCoverage = {
  defects?: boolean;
  parts?: boolean;
  labor?: boolean;
  accidental?: boolean;
  water?: boolean;
  priority?: boolean;
  replacements?: boolean;
  [key: string]: boolean | undefined;
};

// Input types for creating/updating
export type WarrantyInput = {
  warrantyTypeId: string;
  startDate: Date;
  endDate?: Date | null;
  inventoryItemId: string;
  inventoryVariationId: string;
  customerId: string;
};

export type WarrantyTypeInput = {
  name: string;
  description: string;
  duration: number;
  coverage?: WarrantyCoverage;
};

export type WarrantyClaimInput = {
  description: string;
  issueType: string;
  photos?: any;
  warrantyId: string;
  customerId: string;
};

export type WarrantyClaimUpdateInput = {
  status: string;
  resolution?: string;
};

export type inventoryItemProps = Prisma.InventoryItemGetPayload<{
  include: {
    variations: {
      select: {
        id: true;
        name: true;
        sku: true;
      };
    };
  };
  orderBy: {
    name: "asc";
  };
}>;
export type inventoryVariationProps = Prisma.InventoryVariationGetPayload<{
  select: {
    id: true;
    name: true;
    sku: true;
  };
}>;
