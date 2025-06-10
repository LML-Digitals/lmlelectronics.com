import { NextRequest, NextResponse } from "next/server";
import { searchProducts, getFeaturedProducts } from "@/lib/square/products";
import { ProductSearchFilters } from "@/types/square";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if this is a request for featured products
    const featured = searchParams.get("featured");
    if (featured === "true") {
      const limit = parseInt(searchParams.get("limit") || "8");
      const products = await getFeaturedProducts(limit);

      return NextResponse.json({
        success: true,
        data: { products },
      });
    }

    // Build search filters from query parameters
    const filters: ProductSearchFilters = {
      query: searchParams.get("q") || undefined,
      categoryIds: searchParams.get("category")
        ? [searchParams.get("category")!]
        : undefined,
      priceMin: searchParams.get("priceMin")
        ? parseFloat(searchParams.get("priceMin")!)
        : undefined,
      priceMax: searchParams.get("priceMax")
        ? parseFloat(searchParams.get("priceMax")!)
        : undefined,
      sortBy: (searchParams.get("sortBy") as any) || "name",
      sortOrder: (searchParams.get("sortOrder") as any) || "asc",
      cursor: searchParams.get("cursor") || undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
    };

    const result = await searchProducts(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in products API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
