import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

interface Token {
  userType?: string;
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const token: Token | null = await getToken({ req });
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

  // Protected routes (e.g., dashboard)
  const protectedRoutes: string[] = ["/dashboard"];

  // Redirect unauthenticated users to login
  // if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
  //   return NextResponse.redirect(new URL("/auth/signin", req.url));
  // }

  // // Redirect authenticated users away from login
  // if (token && pathname.startsWith("/auth/signup")) {
  //   return NextResponse.redirect(new URL("/dashboard", req.url));
  // }

  // Geo-blocking logic (commented out for now)
  // const country = req.geo?.country;
  // if (country !== 'US') {
  //   return new NextResponse(null, { status: 403 });
  // }

  return response;
}

// Update matcher to include API routes
export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/layout/:path*",
    "/brands/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
