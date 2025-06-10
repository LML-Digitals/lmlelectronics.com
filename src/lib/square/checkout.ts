import { squareClient, SQUARE_LOCATION_ID } from "./client";
import { CartItem, convertPriceToSquareAmount } from "@/types/product";
import { randomUUID } from "crypto";

/**
 * Create a payment link for checkout
 */
export async function createPaymentLink(
  cartItems: CartItem[],
  options: {
    orderId?: string;
    customerId?: string;
    redirectUrl?: string;
    description?: string;
    note?: string;
    requestShippingAddress?: boolean;
    acceptPartialAuthorization?: boolean;
    askForShippingAddress?: boolean;
  } = {}
): Promise<{ paymentLink: any; url: string } | null> {
  try {
    // Validate cart items
    const validation = validateCheckoutData(cartItems);
    if (!validation.isValid) {
      console.error("Invalid checkout data:", validation.errors);
      return null;
    }

    // Calculate total for the mock response
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // TODO: Replace with actual Square Payment Links API when v42 methods are confirmed
    // For now, you have these options:
    // 1. Use Square's Payment Links API (if available in v42)
    // 2. Use Square's Checkout API
    // 3. Redirect to a custom payment page with Square Web Payments SDK

    console.log(
      "Payment link creation - TODO: Implement Square Payment Links API"
    );
    console.log("Cart items:", cartItems);
    console.log("Options:", options);

    // Return a mock payment link structure
    const mockPaymentLink = {
      id: `payment_link_${Date.now()}`,
      version: 1,
      description:
        options.description || `Payment for order ${options.orderId}`,
      orderId: options.orderId,
      checkoutOptions: {
        askForShippingAddress: options.askForShippingAddress || false,
        acceptPartialAuthorization: options.acceptPartialAuthorization || false,
        redirectUrl: options.redirectUrl,
      },
      orderOptions: {
        redirectUrl: options.redirectUrl,
      },
      totalMoney: {
        amount: total,
        currency: cartItems[0]?.currency || "USD",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // For testing: Generate a payment page URL that redirects to order-specific page
    const paymentPageUrl = `/payment/${options.orderId}`;

    return {
      paymentLink: mockPaymentLink,
      url: paymentPageUrl,
    };
  } catch (error) {
    console.error("Error creating payment link:", error);
    return null;
  }
}

/**
 * Get payment link by ID
 */
export async function getPaymentLink(paymentLinkId: string): Promise<any> {
  try {
    // For now, stub this since the exact method name is unclear
    console.log("Payment link retrieval not yet implemented:", paymentLinkId);
    return null;
  } catch (error) {
    console.error("Error retrieving payment link:", error);
    return null;
  }
}

/**
 * Update payment link
 */
export async function updatePaymentLink(
  paymentLinkId: string,
  updates: {
    description?: string;
    checkoutOptions?: {
      askForShippingAddress?: boolean;
      acceptPartialAuthorization?: boolean;
      redirectUrl?: string;
    };
  }
): Promise<any> {
  try {
    // For now, stub this since the exact method name is unclear
    console.log("Payment link update not yet implemented:", {
      paymentLinkId,
      updates,
    });
    return null;
  } catch (error) {
    console.error("Error updating payment link:", error);
    return null;
  }
}

/**
 * Delete payment link
 */
export async function deletePaymentLink(
  paymentLinkId: string
): Promise<boolean> {
  try {
    // For now, stub this since the exact method name is unclear
    console.log("Payment link deletion not yet implemented:", paymentLinkId);
    return false;
  } catch (error) {
    console.error("Error deleting payment link:", error);
    return false;
  }
}

/**
 * List payment links
 */
export async function listPaymentLinks(
  cursor?: string,
  limit: number = 50
): Promise<{ paymentLinks: any[]; cursor?: string }> {
  try {
    // For now, stub this since the exact method name is unclear
    console.log("Payment link listing not yet implemented:", { cursor, limit });
    return { paymentLinks: [] };
  } catch (error) {
    console.error("Error listing payment links:", error);
    return { paymentLinks: [] };
  }
}

/**
 * Create a simple quick pay checkout
 */
export async function createQuickPayCheckout(
  name: string,
  price: number,
  currency: string = "USD",
  options: {
    redirectUrl?: string;
    description?: string;
    note?: string;
    askForShippingAddress?: boolean;
  } = {}
): Promise<{ paymentLink: any; url: string } | null> {
  try {
    // For now, stub this since the exact method name is unclear
    console.log("Quick pay checkout not yet implemented:", {
      name,
      price,
      currency,
      options,
    });
    return null;
  } catch (error) {
    console.error("Error creating quick pay checkout:", error);
    return null;
  }
}

/**
 * Create subscription checkout (placeholder)
 */
export async function createSubscriptionCheckout(
  planId: string,
  customerId?: string,
  options: {
    redirectUrl?: string;
    startDate?: string;
    note?: string;
  } = {}
): Promise<{ paymentLink: any; url: string } | null> {
  try {
    // For now, stub this since subscription handling is complex
    console.log("Subscription checkout not yet implemented:", {
      planId,
      customerId,
      options,
    });
    return null;
  } catch (error) {
    console.error("Error creating subscription checkout:", error);
    return null;
  }
}

/**
 * Validate checkout data
 */
export function validateCheckoutData(cartItems: CartItem[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!cartItems || cartItems.length === 0) {
    errors.push("Cart is empty");
  }

  for (const item of cartItems) {
    if (!item.name || item.name.trim() === "") {
      errors.push("All items must have a name");
    }

    if (item.price <= 0) {
      errors.push("All items must have a positive price");
    }

    if (item.quantity <= 0) {
      errors.push("All items must have a positive quantity");
    }

    if (!item.currency || item.currency.length !== 3) {
      errors.push("All items must have a valid 3-letter currency code");
    }
  }

  // Check if all items have the same currency
  const currencies = new Set(cartItems.map((item) => item.currency));
  if (currencies.size > 1) {
    errors.push("All items must have the same currency");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate success URL with parameters
 */
export function generateSuccessUrl(
  baseUrl: string,
  orderId?: string,
  sessionId?: string
): string {
  const url = new URL(baseUrl);
  if (orderId) url.searchParams.set("orderId", orderId);
  if (sessionId) url.searchParams.set("sessionId", sessionId);
  url.searchParams.set("status", "success");
  return url.toString();
}

/**
 * Generate cancel URL
 */
export function generateCancelUrl(baseUrl: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set("status", "canceled");
  return url.toString();
}

/**
 * Parse checkout redirect parameters
 */
export function parseCheckoutRedirect(searchParams: URLSearchParams): {
  orderId?: string;
  paymentId?: string;
  sessionId?: string;
  status?: string;
  error?: string;
} {
  return {
    orderId: searchParams.get("orderId") || undefined,
    paymentId: searchParams.get("paymentId") || undefined,
    sessionId: searchParams.get("sessionId") || undefined,
    status: searchParams.get("status") || undefined,
    error: searchParams.get("error") || undefined,
  };
}
