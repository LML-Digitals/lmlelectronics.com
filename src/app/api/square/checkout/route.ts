import { NextRequest, NextResponse } from "next/server";
import { createPaymentLink, validateCheckoutData } from "@/lib/square/checkout";
import { CartItem } from "@/types/product";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItems, options = {} } = body;

    // Validate cart items
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart items are required",
        },
        { status: 400 }
      );
    }

    // Validate checkout data
    const validation = validateCheckoutData(cartItems);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid checkout data",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Create payment link
    const result = await createPaymentLink(cartItems, {
      description: options.description || "Online Purchase",
      redirectUrl: options.redirectUrl,
      customerId: options.customerId,
      note: options.note,
      askForShippingAddress: options.askForShippingAddress || false,
    });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create payment link",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentLinkId: result.paymentLink.id,
        checkoutUrl: result.url,
        orderId: result.paymentLink.orderId,
      },
    });
  } catch (error) {
    console.error("Error in checkout API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process checkout",
      },
      { status: 500 }
    );
  }
}
