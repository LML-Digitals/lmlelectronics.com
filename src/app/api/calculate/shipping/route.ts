import { NextRequest, NextResponse } from "next/server";
import {
  calculateShipping,
  getShippingMethods,
  validateShippingAddress,
} from "@/lib/square/shipping";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress, method = "STANDARD" } = body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Items are required",
        },
        { status: 400 }
      );
    }

    // Validate shipping address
    if (!shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Shipping address is required",
        },
        { status: 400 }
      );
    }

    // Validate address format
    const addressValidation = await validateShippingAddress(shippingAddress);
    if (!addressValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid shipping address",
          details: addressValidation.errors,
        },
        { status: 400 }
      );
    }

    // Calculate shipping for specific method or get all methods
    if (method && method !== "ALL") {
      const shippingResult = await calculateShipping(
        items,
        shippingAddress,
        method
      );

      if (!shippingResult) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to calculate shipping",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          method: shippingResult.method,
          cost: shippingResult.cost,
          estimatedDeliveryDays: shippingResult.estimatedDeliveryDays,
          carrier: shippingResult.carrier,
        },
      });
    } else {
      // Get all shipping methods
      const shippingMethods = await getShippingMethods(shippingAddress, items);

      if (!shippingMethods) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to get shipping methods",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          methods: shippingMethods,
        },
      });
    }
  } catch (error) {
    console.error("Error calculating shipping:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate shipping",
      },
      { status: 500 }
    );
  }
}
