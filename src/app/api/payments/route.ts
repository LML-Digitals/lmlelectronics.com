import { NextRequest, NextResponse } from "next/server";
import { squareClient } from "@/lib/square/client";
import { randomUUID } from "crypto";

// Helper function to convert BigInt values to strings recursively
function convertBigIntToString(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }

  if (typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key] = convertBigIntToString(obj[key]);
      }
    }
    return converted;
  }

  return obj;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, orderId, amount, currency = "USD" } = body;

    // Validate required fields
    if (!sourceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment source ID is required",
        },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid payment amount is required",
        },
        { status: 400 }
      );
    }

    // Create payment request
    const paymentRequest = {
      idempotencyKey: randomUUID(),
      sourceId: sourceId,
      amountMoney: {
        amount: BigInt(amount), // Amount is already in cents from the order
        currency: currency.toUpperCase(),
      },
      locationId: process.env.SQUARE_LOCATION_ID!,
      ...(orderId && { referenceId: orderId }),
      note: `Payment for order ${orderId || "N/A"}`,
      autocomplete: true, // Automatically complete the payment
    };

    console.log("Creating payment with request:", {
      ...paymentRequest,
      amountMoney: {
        ...paymentRequest.amountMoney,
        amount: paymentRequest.amountMoney.amount.toString(),
      },
    });

    // Process payment with Square
    const response = await squareClient.payments.create(paymentRequest);

    if (!response || !response.payment) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process payment",
        },
        { status: 500 }
      );
    }

    const payment = response.payment;

    // Check if payment was successful
    if (payment.status !== "COMPLETED" && payment.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: `Payment failed with status: ${payment.status}`,
          paymentStatus: payment.status,
        },
        { status: 400 }
      );
    }

    // If we have an order ID, try to pay the order
    if (orderId && payment.id) {
      try {
        await squareClient.orders.pay({
          orderId: orderId,
          idempotencyKey: randomUUID(),
          paymentIds: [payment.id],
        });
        console.log(
          `Successfully paid order ${orderId} with payment ${payment.id}`
        );
      } catch (orderPayError) {
        console.error("Error paying order:", orderPayError);
        // Don't fail the entire payment if order payment fails
        // The payment was successful, order payment is a bonus
      }
    }

    // Convert BigInt values for JSON serialization
    const responseData = {
      success: true,
      paymentId: payment.id,
      paymentStatus: payment.status,
      amount: payment.amountMoney
        ? payment.amountMoney.amount?.toString()
        : null,
      currency: payment.amountMoney?.currency,
      orderId: orderId,
      payment: convertBigIntToString(payment),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error processing payment:", error);

    // Handle specific Square API errors
    if (error && typeof error === "object" && "errors" in error) {
      const squareErrors = (error as any).errors;
      if (Array.isArray(squareErrors) && squareErrors.length > 0) {
        const firstError = squareErrors[0];
        return NextResponse.json(
          {
            success: false,
            error:
              firstError.detail ||
              firstError.code ||
              "Payment processing failed",
            squareErrors: squareErrors,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process payment",
      },
      { status: 500 }
    );
  }
}
