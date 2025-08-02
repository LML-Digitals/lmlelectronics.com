// Types for inventory exchange operations
import { InventoryExchange, StoreLocation } from '@prisma/client';

export type ExchangeStatus = 'Pending' | 'Approved' | 'Rejected';

// Extended interfaces to include variation data
export interface ItemWithVariation {
  id: string;
  name: string;
  image?: string | null;
  variations?: InventoryVariationData[];
  // Variation details to display when available
  selectedVariation?: InventoryVariationData;
}

export interface InventoryVariationData {
  id: string;
  sku: string;
  name: string;
  image?: string | null;
}

export interface ExchangeWithRelations extends InventoryExchange {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  returnedItem: ItemWithVariation;
  newItem: ItemWithVariation;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
  };
  location: StoreLocation;
}

export interface CreateExchangeInput {
  reason: string;
  customerId: string;
  returnedItemId: string;
  newItemId: string;
  processedBy: string;
  returnedVariationId: string;
  newVariationId: string;
  exchangedAt?: Date; // Add optional exchange date
  locationId: number;
}

export interface UpdateExchangeInput {
  id: string;
  reason?: string;
  status?: ExchangeStatus;
  customerId?: string;
  returnedItemId?: string;
  newItemId?: string;
  processedBy?: string;
  returnedVariationId?: string;
  newVariationId?: string;
  exchangedAt?: Date;
  locationId: number;
}

export interface ExchangeFilter {
  status?: ExchangeStatus;
  customerId?: string;
  processedBy?: string;
  fromDate?: Date;
  toDate?: Date;
}
