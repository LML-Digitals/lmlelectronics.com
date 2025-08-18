/**
 * Utility functions for price calculations used across the application
 * Centralizes calculation logic to ensure consistency between Calculator and Quotes features
 */

export type ItemType = 'Repair' | 'Services' | 'Products';

export interface PriceCalculationInput {
  raw: number;           // Raw material/service cost
  tax?: number;          // Tax percentage
  shipping?: number;     // Shipping cost
  labour?: number;       // Labour cost (for repairs)
  markup?: number;       // Markup percentage (for products)
  fee?: number;          // Service fee (for services)
  itemType: ItemType;    // Type of item being calculated
}

/**
 * Calculate the base cost of an item (before markup/labour/fee)
 */
export function calculateCost (input: PriceCalculationInput): number {
  const { raw, tax = 0, shipping = 0, itemType } = input;

  if (itemType === 'Services') {
    return raw;
  } else {
    // Both Repair and Products use the same cost calculation
    return raw + (raw * tax / 100) + shipping;
  }
}

/**
 * Calculate the final price of an item
 */
export function calculatePrice (input: PriceCalculationInput): number {
  const cost = calculateCost(input);
  const { labour = 0, markup = 0, fee = 0, itemType } = input;

  if (itemType === 'Services') {
    return cost + fee;
  } else if (itemType === 'Products') {
    return cost + (cost * markup / 100);
  } else if (itemType === 'Repair') {
    return cost + labour;
  } else {
    return 0;
  }
}

/**
 * Calculate estimated cost for a quote
 */
export function calculateQuoteEstimate (input: PriceCalculationInput): number {
  return calculatePrice(input);
}

/**
 * Format price to currency string
 */
export function formatPrice (price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
} 
