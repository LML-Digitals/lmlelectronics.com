// Square API Types - Updated for SDK v42
// Note: Using our own types instead of importing from square package
// to avoid dependency on specific SDK version type definitions

export interface SquareCategory {
  id: string;
  categoryData: {
    name: string;
    abbreviation?: string;
  };
  updatedAt?: string;
  version?: bigint;
  isDeleted?: boolean;
  presentAtAllLocations?: boolean;
  presentAtLocationIds?: string[];
}

export interface SquareProduct {
  id: string;
  itemData: {
    name: string;
    description?: string;
    abbreviation?: string;
    labelColor?: string;
    availableOnline?: boolean;
    availableForPickup?: boolean;
    availableElectronically?: boolean;
    categoryId?: string;
    taxIds?: string[];
    modifierListInfo?: any[];
    variations?: SquareProductVariation[];
    productType?: string;
    skipModifierScreen?: boolean;
    itemOptions?: any[];
    imageIds?: string[];
    sortName?: string;
    descriptionHtml?: string;
    descriptionPlaintext?: string;
  };
  presentAtAllLocations?: boolean;
  presentAtLocationIds?: string[];
  updatedAt?: string;
  version?: bigint;
  isDeleted?: boolean;
}

export interface SquareProductVariation {
  id: string;
  itemVariationData: {
    itemId: string;
    name?: string;
    sku?: string;
    upc?: string;
    ordinal?: number;
    pricingType?: string;
    priceMoney?: {
      amount: bigint;
      currency: string;
    };
    locationOverrides?: any[];
    trackInventory?: boolean;
    inventoryAlertType?: string;
    inventoryAlertThreshold?: bigint;
    userData?: string;
    serviceDuration?: bigint;
    availableForBooking?: boolean;
    itemOptionValues?: any[];
    measurementUnitId?: string;
    sellable?: boolean;
    stockable?: boolean;
    imageIds?: string[];
    teamMemberIds?: string[];
    stockableConversion?: any;
  };
  presentAtAllLocations?: boolean;
  presentAtLocationIds?: string[];
  updatedAt?: string;
  version?: bigint;
  isDeleted?: boolean;
}

export interface SquareImage {
  id: string;
  imageData: {
    name?: string;
    url?: string;
    caption?: string;
    photoStudioOrderId?: string;
  };
  updatedAt?: string;
  version?: bigint;
  isDeleted?: boolean;
}

export interface SquareInventory {
  catalogObjectId: string;
  catalogObjectType: string;
  state: string;
  locationId: string;
  quantity: string;
  calculatedAt: string;
}

export interface SquareOrder {
  id?: string;
  locationId: string;
  referenceId?: string;
  source?: {
    name?: string;
  };
  customerId?: string;
  lineItems?: SquareOrderLineItem[];
  taxes?: any[];
  discounts?: any[];
  serviceCharges?: any[];
  fulfillments?: any[];
  returns?: any[];
  returnAmounts?: any;
  netAmounts?: any;
  roundingAdjustment?: any;
  tenders?: any[];
  refunds?: any[];
  metadata?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string;
  state?: string;
  version?: bigint;
  totalMoney?: {
    amount: bigint;
    currency: string;
  };
  totalTaxMoney?: {
    amount: bigint;
    currency: string;
  };
  totalDiscountMoney?: {
    amount: bigint;
    currency: string;
  };
  totalTipMoney?: {
    amount: bigint;
    currency: string;
  };
  totalServiceChargeMoney?: {
    amount: bigint;
    currency: string;
  };
  ticketName?: string;
  pricingOptions?: any;
  rewards?: any[];
}

export interface SquareOrderLineItem {
  uid?: string;
  name?: string;
  quantity: string;
  itemType?: string;
  basePriceMoney?: {
    amount: bigint;
    currency: string;
  };
  variationName?: string;
  note?: string;
  catalogObjectId?: string;
  catalogVersion?: bigint;
  metadata?: Record<string, string>;
  modifiers?: any[];
  appliedTaxes?: any[];
  appliedDiscounts?: any[];
  appliedServiceCharges?: any[];
  totalMoney?: {
    amount: bigint;
    currency: string;
  };
  totalTaxMoney?: {
    amount: bigint;
    currency: string;
  };
  totalDiscountMoney?: {
    amount: bigint;
    currency: string;
  };
  totalServiceChargeMoney?: {
    amount: bigint;
    currency: string;
  };
}

export interface SquarePayment {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  amountMoney?: {
    amount: bigint;
    currency: string;
  };
  tipMoney?: {
    amount: bigint;
    currency: string;
  };
  totalMoney?: {
    amount: bigint;
    currency: string;
  };
  appFeeMoney?: {
    amount: bigint;
    currency: string;
  };
  approvedMoney?: {
    amount: bigint;
    currency: string;
  };
  processingFee?: any[];
  refundedMoney?: {
    amount: bigint;
    currency: string;
  };
  status?: string;
  delayDuration?: string;
  delayAction?: string;
  delayedUntil?: string;
  sourceType?: string;
  cardDetails?: any;
  cashDetails?: any;
  bankAccountDetails?: any;
  externalDetails?: any;
  walletDetails?: any;
  buyNowPayLaterDetails?: any;
  squareAccountDetails?: any;
  locationId?: string;
  orderId?: string;
  referenceId?: string;
  customerId?: string;
  employeeId?: string;
  teamMemberId?: string;
  refundIds?: string[];
  riskEvaluation?: any;
  buyerEmailAddress?: string;
  billingAddress?: any;
  shippingAddress?: any;
  note?: string;
  statementDescriptionIdentifier?: string;
  capabilities?: string[];
  receiptNumber?: string;
  receiptUrl?: string;
  deviceDetails?: any;
  applicationDetails?: any;
  versionToken?: string;
}

export interface SquareCustomer {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  cards?: any[];
  givenName?: string;
  familyName?: string;
  nickname?: string;
  companyName?: string;
  emailAddress?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    locality?: string;
    sublocality?: string;
    sublocality2?: string;
    sublocality3?: string;
    administrativeDistrictLevel1?: string;
    administrativeDistrictLevel2?: string;
    administrativeDistrictLevel3?: string;
    postalCode?: string;
    country?: string;
    firstName?: string;
    lastName?: string;
  };
  phoneNumber?: string;
  birthday?: string;
  referenceId?: string;
  note?: string;
  preferences?: {
    emailUnsubscribed?: boolean;
  };
  creationSource?: string;
  groupIds?: string[];
  segmentIds?: string[];
  version?: bigint;
  taxIds?: any;
}

export interface ProductSearchResult {
  products: SquareProduct[];
  facets?: {
    categories?: { id: string; name: string; count: number }[];
    priceRanges?: { min: number; max: number; count: number }[];
  };
  pagination?: {
    cursor?: string;
    hasMore: boolean;
  };
}

export interface ProductSearchFilters {
  query?: string;
  categoryIds?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: "name" | "price" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}
