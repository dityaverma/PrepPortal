/**
 * Next.js Edge-Compatible Middleware
 * 
 * This middleware runs globally on all matched paths (defined in the matcher config).
 * It acts as an API gateway boundary that enforces authentication and authorization.
 * 
 * Features:
 * 1. Public Paths Bypass: Allows unauthenticated access to login and registration endpoints.
 * 2. Token Extraction: Parses token from the Authorization Bearer header or a fallback cookie.
 * 3. JWT Verification: Utilizes Vercel Edge-compatible 'jose' library to verify tokens stateless-ly.
 * 4. Header Injection: Injects verified credentials (userId, email, role, permissions) into custom HTTP headers.
 *    This allows downstream App Router API handlers to access the user context without decoding JWTs repeatedly.
 * 5. Route-level RBAC: Blocks non-admin requests targeting '/api/admin' early at the routing boundary.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Standard signing key constructed from environment variable secret
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-temporary-development-secret-key-32-chars"
);

// Endpoints that are accessible without an auth token
const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass check for public authentication endpoints
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Only enforce authentication on backend API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  let token = "";

  // 3. Extract the bearer token from the Authorization header
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    // Fallback to cookie authentication if cookies are configured (e.g. standard browser flow)
    token = request.cookies.get("auth-token")?.value || "";
  }

  // If no token is provided, reject the request with 401 Unauthenticated
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication token missing.",
        error: { message: "Unauthenticated", code: "UNAUTHENTICATED" },
      },
      { status: 401 }
    );
  }

  try {
    // 4. Verify the stateless JWT signature using our secret
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Create cloned headers to propagate parsed credentials down to the request handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.userId));
    requestHeaders.set("x-user-email", String(payload.email));
    requestHeaders.set("x-user-role", String(payload.role));
    requestHeaders.set("x-user-permissions", JSON.stringify(payload.permissions || []));

    // 5. Early Route Protection: Restrict administrative endpoints to admin roles
    const userRole = String(payload.role);
    if (pathname.startsWith("/api/admin") && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Admin access required.",
          error: { message: "Forbidden", code: "FORBIDDEN" },
        },
        { status: 403 }
      );
    }

    // Forward the request containing the injected headers downstream
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (_error) {
    // If JWT verification fails (signature check, expired token, etc.), return 401
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired token.",
        error: { message: "Unauthorized", code: "UNAUTHORIZED" },
      },
      { status: 401 }
    );
  }
}

// Intercept all API endpoints
export const config = {
  matcher: "/api/:path*",
};

