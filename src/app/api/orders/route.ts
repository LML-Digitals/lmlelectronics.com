import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrderById } from "@/lib/square/orders";
import { createPaymentLink } from "@/lib/square/checkout";
import { createOrGetCustomerByEmail } from "@/lib/square/customers";
import { CartItem } from "@/types/product";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required",
        },
        { status: 400 }
      );
    }

    // Retrieve order from Square
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // Convert BigInt values for JSON serialization
    const responseData = {
      success: true,
      order: convertBigIntToString(order),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error retrieving order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve order",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, shipping, totals } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Order items are required",
        },
        { status: 400 }
      );
    }

    if (!customer || !customer.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer information is required",
        },
        { status: 400 }
      );
    }

    // Create or get customer
    let squareCustomer = null;
    try {
      squareCustomer = await createOrGetCustomerByEmail(customer.email, {
        givenName: customer.firstName,
        familyName: customer.lastName,
        phoneNumber: customer.phone,
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      // Continue without customer ID if customer creation fails
    }

    // Convert items to cart format for payment link
    const cartItems: CartItem[] = items.map((item: any) => ({
      id: item.id,
      productId: item.id,
      variationId: item.variationId,
      name: item.name,
      price: item.price,
      currency: "USD",
      quantity: item.quantity,
    }));

    // Create Square order
    const orderRequest = {
      locationId: process.env.SQUARE_LOCATION_ID!,
      lineItems: items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity.toString(),
        basePriceMoney: {
          amount: BigInt(item.price * 100), // Convert to cents for USD
          currency: "USD",
        },
        ...(item.variationId && { catalogObjectId: item.variationId }),
      })),
      ...(squareCustomer && { customerId: squareCustomer.id }),
      metadata: {
        source: "ecommerce_website",
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        shippingAddress: JSON.stringify(shipping),
      },
    };

    const order = await createOrder(orderRequest);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create order",
        },
        { status: 500 }
      );
    }

    // Create payment link for the order
    const paymentLinkResult = await createPaymentLink(cartItems, {
      orderId: order.id,
      customerId: squareCustomer?.id,
      description: `Order ${order.id}`,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      askForShippingAddress: true,
    });

    const paymentUrl = paymentLinkResult?.url || null;

    // Convert BigInt values to strings for JSON serialization
    const responseData = {
      success: true,
      orderId: order.id?.toString() || null,
      paymentUrl,
      order: convertBigIntToString(order),
      customer: squareCustomer ? convertBigIntToString(squareCustomer) : null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process order",
      },
      { status: 500 }
    );
  }
}
