import { Prisma } from '@prisma/client';

export type BookingType = 'In Store' | 'Mobile' | 'Mail In' | 'Online';
export type AppointmentType = 'repair' | 'service';
export type ServiceType =
  | 'buy-sell-trade'
  | 'customization'
  | 'unlocks'
  | 'software'
  | 'cleaning'
  | 'recycling'
  | 'b2b';

export interface RepairOption {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price?: number | null;
  labour?: number | null;
  duration?: string | null;
  repairType?: {
    id: string;
    name: string;
  };
}

// New Issue interfaces for booking
export interface RepairType {
  id: string;
  name: string;
  description: string;
  image?: string | null;
  order?: number | null;
  labour?: number | null;
  timeFrame?: string | null;
}

export interface IssueData {
  id: string;
  name: string;
  keywords: string;
  description?: string | null;
  repairType: RepairType[];
}

// export interface DeviceData {
//   id: string;
//   deviceTypeId?: string;
//   brandId?: number | null;
//   seriesId?: number | null;
//   modelId?: number | null;
//   brand: string;
//   series: string;
//   model: string;
//   repairOptions: RepairOption[];
//   description?: string;
// }

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city: string;
  state: string;
  zip: string;
  referralCode?: string;
  referralSource?: string;
  termsAccepted: boolean;
  smsConsent: boolean;
  description?: string;
  contactPreference?: 'call' | 'text' | 'email';
}

export interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  description: string;
  serviceType: string;
  packagingType: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderZip: string;
  packageWeight: string;
  referralCode?: string;
  termsAccepted?: boolean;
}

export interface BookingFormData {
  appointmentType: AppointmentType;
  serviceType: string;
  devices: DeviceData[];
  location: string;
  bookingType: BookingType;
  datetime: Date;
  customer: CustomerFormData;
  shipping: ShippingFormData;
  paymentToken?: string;
  shipment?: {
    trackingNumber: string;
    labelUrl: string;
  };
  description?: string;
  // New field for selected issue
  selectedIssue?: IssueData | null;
}

export interface StoreLocation {
  id: number;
  name: string;
  address: string;
  phone?: string;
  hours?: string;
  image?: string;
  services?: string[];
  zipCodes?: string[];
  city?: string;
  state?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DeviceType {
  id: string;
  name: string;
  image?: string;
}

export interface Model {
  id: number;
  name: string;
  image?: string | null;
  description?: string | null;
}

export interface ModelWithRepairOptions extends Model {
  repairOptions: RepairOption[];
}

export interface Series {
  id: number;
  name: string;
  image?: string;
}

export interface SeriesWithModels extends Series {
  models: ModelWithRepairOptions[];
}

export interface Brand {
  id: number;
  name: string;
  image?: string;
}

export interface BrandWithSeries extends Brand {
  series: SeriesWithModels[];
}

export interface DeviceTypeWithBrands extends DeviceType {
  brands: BrandWithSeries[];
}

export interface DeviceData {
  id: string;
  deviceTypeId: string | null;
  brandId: number | null;
  brand: string;
  seriesId: number | null;
  series: string;
  modelId: number | null;
  model: string;
  repairOptions: RepairOption[];
  description: string;
  // New field to link device to an issue
  issueId?: string | null;
}
