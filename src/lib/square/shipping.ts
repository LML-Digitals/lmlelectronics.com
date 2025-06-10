import { squareClient, SQUARE_LOCATION_ID } from "./client";

/**
 * Calculate shipping cost based on items and destination
 */
export async function calculateShipping(
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    weight?: number; // in pounds
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  }>,
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  },
  shippingMethod: "STANDARD" | "EXPRESS" | "OVERNIGHT" = "STANDARD"
): Promise<{
  cost: number; // in dollars
  estimatedDeliveryDays: number;
  method: string;
  carrier?: string;
} | null> {
  try {
    // Calculate total order value and weight
    const totalValue = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalWeight = items.reduce(
      (sum, item) => sum + (item.weight || 0.5) * item.quantity,
      0
    );

    // Free shipping for orders over $50
    if (totalValue >= 50 && shippingMethod === "STANDARD") {
      return {
        cost: 0,
        estimatedDeliveryDays: 5,
        method: "Standard Shipping (Free)",
        carrier: "USPS",
      };
    }

    // Calculate shipping based on method and destination
    let baseCost = 0;
    let deliveryDays = 5;
    let carrier = "USPS";

    // Base shipping costs
    switch (shippingMethod) {
      case "STANDARD":
        baseCost = 5.99;
        deliveryDays = 5;
        carrier = "USPS";
        break;
      case "EXPRESS":
        baseCost = 12.99;
        deliveryDays = 2;
        carrier = "FedEx";
        break;
      case "OVERNIGHT":
        baseCost = 24.99;
        deliveryDays = 1;
        carrier = "FedEx";
        break;
    }

    // Add weight-based pricing for heavier items
    if (totalWeight > 2) {
      baseCost += (totalWeight - 2) * 2.5;
    }

    // International shipping adjustment
    if (shippingAddress.country !== "US") {
      baseCost += 15.0;
      deliveryDays += 7;
    }

    // State-based adjustments (could be expanded to use actual shipping API)
    const expeditedStates = ["CA", "NY", "FL", "TX"];
    if (expeditedStates.includes(shippingAddress.state)) {
      deliveryDays = Math.max(1, deliveryDays - 1);
    }

    return {
      cost: Math.round(baseCost * 100) / 100, // Round to 2 decimal places
      estimatedDeliveryDays: deliveryDays,
      method: `${
        shippingMethod.charAt(0) + shippingMethod.slice(1).toLowerCase()
      } Shipping`,
      carrier,
    };
  } catch (error) {
    console.error("Error calculating shipping:", error);
    return null;
  }
}

/**
 * Get available shipping methods for an address
 */
export async function getShippingMethods(
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  },
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    weight?: number;
  }>
): Promise<Array<{
  id: string;
  name: string;
  cost: number;
  estimatedDeliveryDays: number;
  carrier: string;
}> | null> {
  try {
    const methods = ["STANDARD", "EXPRESS", "OVERNIGHT"] as const;
    const shippingOptions = [];

    for (const method of methods) {
      const result = await calculateShipping(items, shippingAddress, method);
      if (result) {
        shippingOptions.push({
          id: method,
          name: result.method,
          cost: result.cost,
          estimatedDeliveryDays: result.estimatedDeliveryDays,
          carrier: result.carrier || "Unknown",
        });
      }
    }

    return shippingOptions;
  } catch (error) {
    console.error("Error getting shipping methods:", error);
    return null;
  }
}

/**
 * Validate shipping address using Square's location services
 */
export async function validateShippingAddress(address: {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}): Promise<{
  isValid: boolean;
  suggestedAddress?: any;
  errors?: string[];
}> {
  try {
    // Basic validation logic
    const errors: string[] = [];

    if (!address.address || address.address.trim().length < 5) {
      errors.push(
        "Street address is required and must be at least 5 characters"
      );
    }

    if (!address.city || address.city.trim().length < 2) {
      errors.push("City is required");
    }

    if (!address.state || address.state.trim().length !== 2) {
      errors.push("State must be a valid 2-letter code");
    }

    if (!address.zipCode || !/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
      errors.push("ZIP code must be in format 12345 or 12345-6789");
    }

    if (!address.country) {
      errors.push("Country is required");
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error validating shipping address:", error);
    return {
      isValid: false,
      errors: ["Failed to validate address"],
    };
  }
}
