import { squareClient, SQUARE_LOCATION_ID } from "./client";
import { SquarePayment } from "@/types/square";
import {
  convertPriceToSquareAmount,
  convertSquareAmountToPrice,
} from "@/types/product";
import { randomUUID } from "crypto";

/**
 * Create a payment for an order
 */
export async function createPayment(
  sourceId: string, // Payment source token from Web Payments SDK
  amountMoney: { amount: number; currency: string },
  orderId?: string,
  customerId?: string,
  buyerEmailAddress?: string,
  billingAddress?: any,
  shippingAddress?: any,
  note?: string
): Promise<SquarePayment | null> {
  try {
    const paymentRequest: any = {
      idempotencyKey: randomUUID(),
      sourceId,
      amountMoney: {
        amount: convertPriceToSquareAmount(amountMoney.amount),
        currency: amountMoney.currency.toUpperCase(),
      },
      locationId: SQUARE_LOCATION_ID,
      ...(orderId && { orderId }),
      ...(customerId && { customerId }),
      ...(buyerEmailAddress && { buyerEmailAddress }),
      ...(billingAddress && { billingAddress }),
      ...(shippingAddress && { shippingAddress }),
      ...(note && { note }),
      autocomplete: true, // Automatically complete the payment
      acceptPartialAuthorization: false,
    };

    const response = await squareClient.payments.create(paymentRequest);

    if (!response || !response.payment) {
      console.error("Failed to create payment");
      return null;
    }

    return convertSquarePaymentResponse(response.payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    return null;
  }
}

/**
 * Get payment by ID
 */
export async function getPaymentById(
  paymentId: string
): Promise<SquarePayment | null> {
  try {
    // For now, stub this since the exact method name is unclear
    console.log("Payment retrieval by ID not yet implemented:", paymentId);
    return null;
  } catch (error) {
    console.error("Error retrieving payment:", error);
    return null;
  }
}

/**
 * List payments with filters
 */
export async function listPayments(
  filters: {
    beginTime?: string;
    endTime?: string;
    sortOrder?: "ASC" | "DESC";
    cursor?: string;
    locationId?: string;
    total?: number;
    last4?: string;
    cardBrand?: string;
    limit?: number;
  } = {}
): Promise<{ payments: SquarePayment[]; cursor?: string }> {
  try {
    const response = await squareClient.payments.list({
      beginTime: filters.beginTime,
      endTime: filters.endTime,
      sortOrder: filters.sortOrder || "DESC",
      cursor: filters.cursor,
      locationId: filters.locationId || SQUARE_LOCATION_ID,
      total: filters.total
        ? convertPriceToSquareAmount(filters.total)
        : undefined,
      last4: filters.last4,
      cardBrand: filters.cardBrand,
      limit: filters.limit || 50,
    });

    if (!response) {
      console.error("Failed to list payments");
      return { payments: [] };
    }

    // Handle paginated response
    const payments: SquarePayment[] = [];
    if (response.data) {
      for await (const payment of response.data) {
        payments.push(convertSquarePaymentResponse(payment));
      }
    }

    return {
      payments,
      cursor: undefined, // TODO: Handle cursor from paginated response
    };
  } catch (error) {
    console.error("Error listing payments:", error);
    return { payments: [] };
  }
}

/**
 * Cancel or void a payment
 */
export async function cancelPayment(
  paymentId: string
): Promise<SquarePayment | null> {
  try {
    // For now, stub this since the exact method signature is unclear
    console.log("Payment cancellation not yet implemented:", paymentId);
    return null;
  } catch (error) {
    console.error("Error canceling payment:", error);
    return null;
  }
}

/**
 * Complete a payment (for payments that are not autocompleted)
 */
export async function completePayment(
  paymentId: string
): Promise<SquarePayment | null> {
  try {
    // For now, stub this since the exact method signature is unclear
    console.log("Payment completion not yet implemented:", paymentId);
    return null;
  } catch (error) {
    console.error("Error completing payment:", error);
    return null;
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentId: string,
  amountMoney: { amount: number; currency: string },
  reason?: string
): Promise<any> {
  try {
    // For now, stub this since the exact method signature is unclear
    console.log("Refund creation not yet implemented:", {
      paymentId,
      amountMoney,
      reason,
    });
    return null;
  } catch (error) {
    console.error("Error creating refund:", error);
    return null;
  }
}

/**
 * Get refund by ID
 */
export async function getRefundById(refundId: string): Promise<any> {
  try {
    // For now, stub this since the exact method name is unclear
    console.log("Refund retrieval by ID not yet implemented:", refundId);
    return null;
  } catch (error) {
    console.error("Error retrieving refund:", error);
    return null;
  }
}

/**
 * List refunds with filters
 */
export async function listRefunds(
  filters: {
    beginTime?: string;
    endTime?: string;
    sortOrder?: "ASC" | "DESC";
    cursor?: string;
    locationId?: string;
    sourceType?: string;
    limit?: number;
  } = {}
): Promise<{ refunds: any[]; cursor?: string }> {
  try {
    // For now, return empty array since the exact method is unclear
    console.log("List refunds not yet implemented:", filters);
    return { refunds: [] };
  } catch (error) {
    console.error("Error listing refunds:", error);
    return { refunds: [] };
  }
}

/**
 * Helper function to convert Square Payment response to our type
 */
function convertSquarePaymentResponse(payment: any): SquarePayment {
  return {
    id: payment.id,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    amountMoney: payment.amountMoney
      ? {
          amount: BigInt(payment.amountMoney.amount || 0),
          currency: payment.amountMoney.currency || "USD",
        }
      : undefined,
    tipMoney: payment.tipMoney
      ? {
          amount: BigInt(payment.tipMoney.amount || 0),
          currency: payment.tipMoney.currency || "USD",
        }
      : undefined,
    totalMoney: payment.totalMoney
      ? {
          amount: BigInt(payment.totalMoney.amount || 0),
          currency: payment.totalMoney.currency || "USD",
        }
      : undefined,
    appFeeMoney: payment.appFeeMoney
      ? {
          amount: BigInt(payment.appFeeMoney.amount || 0),
          currency: payment.appFeeMoney.currency || "USD",
        }
      : undefined,
    approvedMoney: payment.approvedMoney
      ? {
          amount: BigInt(payment.approvedMoney.amount || 0),
          currency: payment.approvedMoney.currency || "USD",
        }
      : undefined,
    processingFee: payment.processingFee
      ? payment.processingFee.map((fee: any) => ({
          amount: BigInt(fee.amountMoney?.amount || 0),
          currency: fee.amountMoney?.currency || "USD",
          type: fee.type,
        }))
      : undefined,
    refundedMoney: payment.refundedMoney
      ? {
          amount: BigInt(payment.refundedMoney.amount || 0),
          currency: payment.refundedMoney.currency || "USD",
        }
      : undefined,
    status: payment.status,
    delayDuration: payment.delayDuration,
    delayAction: payment.delayAction,
    delayedUntil: payment.delayedUntil,
    sourceType: payment.sourceType,
    cardDetails: payment.cardDetails,
    cashDetails: payment.cashDetails,
    bankAccountDetails: payment.bankAccountDetails,
    externalDetails: payment.externalDetails,
    walletDetails: payment.walletDetails,
    buyNowPayLaterDetails: payment.buyNowPayLaterDetails,
    squareAccountDetails: payment.squareAccountDetails,
    locationId: payment.locationId,
    orderId: payment.orderId,
    referenceId: payment.referenceId,
    customerId: payment.customerId,
    employeeId: payment.employeeId,
    teamMemberId: payment.teamMemberId,
    refundIds: payment.refundIds || [],
    riskEvaluation: payment.riskEvaluation,
    buyerEmailAddress: payment.buyerEmailAddress,
    billingAddress: payment.billingAddress,
    shippingAddress: payment.shippingAddress,
    note: payment.note,
    statementDescriptionIdentifier: payment.statementDescriptionIdentifier,
    capabilities: payment.capabilities || [],
    receiptNumber: payment.receiptNumber,
    receiptUrl: payment.receiptUrl,
    deviceDetails: payment.deviceDetails,
    applicationDetails: payment.applicationDetails,
    versionToken: payment.versionToken,
  };
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(
  amount: number,
  currency: string = "USD"
): boolean {
  if (amount <= 0) return false;

  // Square has minimum amounts for different currencies
  const minimumAmounts: Record<string, number> = {
    USD: 0.01,
    EUR: 0.01,
    GBP: 0.01,
    CAD: 0.01,
    AUD: 0.01,
    JPY: 1,
  };

  const minimum = minimumAmounts[currency.toUpperCase()] || 0.01;
  return amount >= minimum;
}

/**
 * Format payment status for display
 */
export function formatPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    APPROVED: "Approved",
    PENDING: "Pending",
    COMPLETED: "Completed",
    CANCELED: "Canceled",
    FAILED: "Failed",
  };

  return statusMap[status] || status;
}
