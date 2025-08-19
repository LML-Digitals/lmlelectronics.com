import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Handle CORS for API routes
  if (pathname.startsWith("/api")) {
    // Handle OPTIONS request for CORS preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const response = NextResponse.next();

    // Add CORS headers to all API responses
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );

    return response;
  }

  // Redirect old product pages and category pages to main products page
  if (pathname.startsWith("/products/") && pathname !== "/products") {
    return NextResponse.redirect(new URL("/products", req.url));
  }

  // Create response for non-API routes
  const response = NextResponse.next();

  // Add pathname to headers so layout can access it
  response.headers.set("x-pathname", pathname);

  return response;
}

// Update matcher to include API routes
export const config = {
  matcher: [
    "/api/:path*",
    "/brands/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
