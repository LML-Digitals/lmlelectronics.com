import {
  InventoryItemCategory,
  InventoryReturn,
  InventoryVariation,
} from '@prisma/client';

export type PartialBy<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type Vendor = {
  vendorId: number;
  name: string;
};

export type Variations = {
  variationId: number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  sku: string;
};
export type InventoryItem = {
  name: string;
  brand: string;
  description: string;
  image: string;
  vendor: Vendor;
  variations: Variations[];
};

export type Location = {
  locationId: number;
  name: string;
  description: string;
};

export type Comment = {
  commentId: number;
  stockReturnId: number;
  text: string;
  createdAt: Date;
};

export type ItemReturnExtended = InventoryReturn & {
  inventoryItem: InventoryItem & {
    categories: InventoryItemCategory[];
    variations: InventoryVariation[];
  };
  location: Location;
  Comment: Comment[];
  customer: {
    id: string | null;
    firstName: string | null;
    lastName: string | null;
  };
};
export type Announcement = {
  content: String;
  tag: String;
  Active: Boolean;
  createdAt: Date;
};
export type Post = {
  id: number;
  title: String;
  content: String;
  authorId: number;
  blogCategoryId: number;
  tag: String;
  published: Boolean;
  createdAt: Date;
  updatedAt: Date;
  metaTitle?: String;
  metaDescription?: String;
  publishedAt?: Date;
};
export interface MonthlyData {
  id: number;
  totalCalls: number;
  totalDuration: number;
  resolvedCalls: number;
  followUpCalls: number;
  callsAnswered: number;
  callsMissed: number;
  startDate: Date; // ISO date string
  endDate: Date; // ISO date string
  // totalVolume: number;
}

export interface OverallTotals {
  totalCalls: number;
  totalDuration: number;
  resolvedCalls: number;
  followUpCalls: number;
  callsAnswered: number;
  callsMissed: number;
}

export interface CallAnalytics {
  monthlyData: MonthlyData[];
  overallTotals: OverallTotals;
}
export interface MostFrequentResponse {
  frequentLocation: string | null;
  frequentStaff: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}
