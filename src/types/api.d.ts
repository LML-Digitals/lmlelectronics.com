// This file is intended to be a single source of truth for all API types,
// making it easily portable to a separate frontend application.
// All types here are plain TypeScript types with no external dependencies.

// 1. INVENTORY & BUNDLES
// =================================

export interface StoreLocation {
  id: number;
  name: string;
  slug: string | null;
  address: string;
  phone: string;
  email: string;
  description: string | null;
  hours: any | null; // JSON
  images: any | null; // JSON
  socialMedia: any | null; // JSON
  listings: any | null; // JSON
  entranceSteps: string | null;
  squareLocationEnvKey: string | null;
  isActive: boolean;
  availability: any | null; // JSON
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  city: string | null;
  countryCode: string | null;
  state: string | null;
  streetAddress: string | null;
  zip: string | null;
}

export interface InventoryStockLevel {
  id: string;
  variationId: string;
  locationId: number;
  stock: number;
  purchaseCost: number | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  location: StoreLocation;
}

export interface InventoryVariation {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  image: string | null;
  raw: number;
  tax: number | null;
  shipping: number | null;
  totalCost: number | null;
  historicalCost: number | null;
  markup: number | null;
  sellingPrice: number;
  profit: number | null;
  useDefaultRates: boolean;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  lastPurchaseDate: string | null; // ISO 8601 date string
  visible: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  inventoryItemId: string | null;
  stockLevels: InventoryStockLevel[];
}

export interface InventoryItemCategory {
  id: string;
  name: string;
  image: string;
  description: string;
  visible: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  parentId: string | null;
  children: InventoryItemCategory[];
  items: InventoryItem[];
}

export interface Vendor {
  id: number;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  website: string | null;
  leadTime: number | null;
  rating: number | null;
  notes: string | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

export interface Tag {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

export interface WarrantyType {
  id: string;
  name: string;
  description: string;
  duration: number;
  coverage: any | null; // JSON
  createdAt: string; // ISO 8601 date string
}

/**
 * The type for a single inventory item returned from the API (`/api/inventory/items/[id]`).
 * This is a plain TypeScript type with no external dependencies.
 */
export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isBundle: boolean;
  warrantyTypeId: string | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  supplierId: number | null;
  categories: InventoryItemCategory[];
  supplier: Vendor | null;
  variations: InventoryVariation[];
  tags: Tag[];
  warrantyType: WarrantyType | null;
}

export interface BundleComponent {
  id: string;
  quantity: number;
  displayOrder: number;
  isHighlight: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  bundleItemId: string;
  componentVariationId: string;
  componentVariation: {
    inventoryItem: {
      name: string;
      image: string | null;
    } | null;
  } & InventoryVariation;
}

/**
 * The type for a single bundle returned from the API (`/api/inventory/bundles`).
 * This is a plain TypeScript type with no external dependencies.
 */
export interface Bundle {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  variations: Array<{
    id: string;
    name: string;
    sku: string;
    sellingPrice: number;
  }>;
  bundleComponents: Array<{
    id: string;
    quantity: number;
    displayOrder: number;
    isHighlight: boolean;
    componentVariation: {
      id: string;
      name: string;
      sku: string;
      sellingPrice: number;
      image: string | null;
      inventoryItem: {
        name: string;
        description: string | null;
      } | null;
    };
  }>;
  calculatedStock: any;
}

// 2. CHECKOUT
// =================================

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
  type: string;
  tax?: number;
  shipping?: number;
  depositAmount?: number;
}

export interface ShippingAddressData {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  shippingMethod: string;
  shippingRate: number;
}

export interface GuestCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/**
 * The TypeScript type for the checkout payload sent to the API.
 * This is a plain TypeScript type.
 */
export interface CheckoutData {
  items: CartItem[];
  location: string;
  paymentToken: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  discountAmount?: number;
  customerId?: string | null;
  isGuestCheckout: boolean;
  customerData?: GuestCustomerData;
  shippingAddress: ShippingAddressData;
}

// 3. ORDERS
// =================================

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingAddress: ShippingAddressData;
  // This is not the full customer model, only what's included in the order response.
  // Add other fields here if they are included in the `customer: true` payload.
}

export interface OrderItem {
  id: string;
  itemType: string;
  sourceId: string | null;
  description: string;
  price: number;
  quantity: number;
  orderId: string;
  ticketId: string | null;
  inventoryVariationId: string | null;
  inventoryVariation: {
    inventoryItem: {
      id: string;
      name: string;
      image: string | null;
    } | null;
  } & InventoryVariation;
}

export interface PaymentDetails {
  id: string;
  transactionId: string | null;
  cardLastFour: number | null;
  referenceNumber: string | null;
  issuingBank: string | null;
  accountHolder: string | null;
  accountNumber: string | null;
  checkNumber: string | null;
  checkDate: string | null; // ISO 8601 date string
  payerId: string | null;
  payerEmail: string | null;
  payerUserName: string | null;
  paymentId: string | null;
  orderId: string | null;
}

export interface Refund {
  id: string;
  amount: number;
  reason: string | null;
  orderId: string;
  createdAt: string; // ISO 8601 date string
}

export interface ShippingAddress extends ShippingAddressData {
  id: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  customerId: string;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  discountType: string | null; // Enum DiscountType
  paymentMethod: string | null;
  squareTxnId: string | null;
  customerId: string;
  staffId: string | null;
  storeLocationId: number;
  tipAmount: number;
  serviceChargeTotal: number;
  registerSessionId: string | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

/**
 * The type for a full order object returned from `/api/orders/[id]`.
 * This is a plain TypeScript type with no external dependencies.
 */
export type OrderDetails = Order & {
  customer: Customer;
  staff: {
    firstName: string | null;
    lastName: string | null;
  } | null;
  storeLocation: StoreLocation;
  items: OrderItem[];
  paymentDetails: PaymentDetails | null;
  shippingAddress: ShippingAddress | null; // Fetched separately and added to the response
  refunds: Refund[];
};
