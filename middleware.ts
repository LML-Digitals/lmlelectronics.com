import { NextRequest, NextResponse } from "next/server";

// Define allowed origins
const allowedOrigins = [
  'https://lmlelectronics.com',
  'https://www.lmlelectronics.com',
  'https://lmlrepair.com',
  'https://www.lmlrepair.com'
];

// Add localhost for development
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin');

  // Handle CORS for API routes
  if (pathname.startsWith("/api")) {
    // Handle OPTIONS request for CORS preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigins.includes(origin || '') ? origin! : allowedOrigins[0],
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const response = NextResponse.next();

    // Add CORS headers to all API responses
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins.includes(origin || '') ? origin! : allowedOrigins[0]);
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
