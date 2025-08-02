/**
 * Type definitions for settings
 */
export enum SettingCategory {
  GENERAL = "GENERAL",
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
  APPEARANCE = "APPEARANCE",
  PAYMENT = "PAYMENT",
  SECURITY = "SECURITY",
  SYSTEM = "SYSTEM",
  INVENTORY = "INVENTORY",
  BOOKING = "BOOKING",
  POS = "POS",
  PHONE = "PHONE",
}

export type SettingScope = "system" | "staff" | "customer" | "location";
export type SettingValue = string | number | boolean | object | null;

/**
 * Utility functions for settings values
 */

/**
 * Converts a setting value from string to its appropriate type based on content
 */
export function parseSettingValue(value: string | null): SettingValue {
  if (value === null) return null;

  // Try to parse as JSON for objects and arrays
  if (
    (value.startsWith("{") && value.endsWith("}")) ||
    (value.startsWith("[") && value.endsWith("]"))
  ) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  // Parse booleans
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;

  // Parse numbers
  if (!isNaN(Number(value)) && value.trim() !== "") {
    return Number(value);
  }

  // Default to string
  return value;
}

/**
 * Converts any value to string for storage
 */
export function stringifySettingValue(value: SettingValue): string {
  if (value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Add new types for different settings
export type PaymentGatewayConfig = {
  enabled: boolean;
  apiKey?: string;
  secretKey?: string;
  testMode: boolean;
  webhookUrl?: string;
};

export type AlertThreshold = {
  id: string;
  module: string;
  condition: string;
  value: number;
  action: string;
  enabled: boolean;
};

export type UserRole = {
  id: string;
  name: string;
  permissions: string[];
  description: string;
};

export type SystemConfig = {
  logRetentionDays: number;
  backupFrequency: string;
  maintenanceMode: boolean;
  apiRateLimit: number;
};

export type BrandingConfig = {
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customCss: string;
};

export type PhoneConfig = {
  businessHoursStart: string;
  businessHoursEnd: string;
  businessDaysOfWeek: number[];
  missedCallTextEnabled: boolean;
  missedCallTextMessage: string;
  voicemailGreeting?: string;
  voicemailGreetingUrl?: string;
};
