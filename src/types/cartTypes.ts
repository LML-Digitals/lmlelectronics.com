export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type ItemType = 'product' | 'bundle';

export interface AvailableItem {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  price: number;
  profit: number;
  discount: number;
  shipping: number;
  tax: number;
  image?: string;
  quantity?: number;
  total?: number;
  category?: string;
  locationId?: string;
  locationName?: string;
  customerId?: string;
  vendorId?: string;
}

export interface CartItem extends AvailableItem {
  quantity: number;
  total: number;
  productId: string | null;
  specialPartId: string | null;
  bundleId?: string | null;
  image?: string; // Add image field
  vendorId?: string; // Changed from number to string to match AvailableItem
}

export interface Cart {
  customerId: string | null;
  items: CartItem[];
  discount?: CartDiscount | null;
  location?: string;
  bundleId?: string;
  paymentMethod?: string;
  bundleDiscount: number | null;
  manualDiscount: number | null;
  automaticDiscount: CartDiscount | null;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  discount: number;
  isActive: boolean;
}

export interface CartDiscount {
  id: string;
  type: string;
  value: number;
  name: string;
  description?: string;
  minPurchase?: number;
}

export interface CartAnalytics {
  popularItems: {
    productId: string;
    name: string;
    count: number;
  }[];
  conversionData: {
    date: string;
    completed: number;
    abandoned: number;
    rate: number;
  }[];
  cartMetrics: {
    totalCarts: number;
    completedCarts: number;
    abandonedCarts: number;
    averageValue: number;
  };
}
