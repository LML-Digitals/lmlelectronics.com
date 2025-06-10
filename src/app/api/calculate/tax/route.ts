import { NextRequest, NextResponse } from "next/server";
import { calculateTax } from "@/lib/square/tax";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress } = body;

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

    // Calculate tax
    const taxResult = await calculateTax(items, shippingAddress);

    if (!taxResult) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to calculate tax",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        totalTax: taxResult.totalTax,
        itemTaxes: taxResult.itemTaxes,
        taxDetails: taxResult.taxDetails,
      },
    });
  } catch (error) {
    console.error("Error calculating tax:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate tax",
      },
      { status: 500 }
    );
  }
}
