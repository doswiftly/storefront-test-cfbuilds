/**
 * API Route: Set Authentication Token
 *
 * Sets the customer access token in an httpOnly cookie.
 * This provides security by preventing client-side JavaScript from accessing the token.
 *
 * Security Features:
 * 1. httpOnly cookie - Cannot be accessed via JavaScript (XSS protection)
 * 2. Secure flag - Only sent over HTTPS in production
 * 3. SameSite=Lax - CSRF protection
 * 4. Origin validation - Only accepts requests from same origin
 * 5. Content-Type validation - Only accepts JSON
 *
 * @see lib/auth/cookies.ts - Cookie configuration
 * @see hooks/use-auth.ts - Client-side usage
 *
 * @example
 * ```tsx
 * // Client-side usage (via setAuthToken helper)
 * await setAuthToken(customerAccessToken.accessToken);
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_CONFIG } from "@/lib/auth/cookies";

/**
 * Request body schema
 */
interface SetTokenRequest {
  token: string;
}

/**
 * POST /api/auth/set-token
 *
 * Sets the authentication token in an httpOnly cookie.
 *
 * @param request - Next.js request object
 * @returns Response with Set-Cookie header
 */
export async function POST(request: NextRequest) {
  try {
    // 1. CSRF Protection: Validate origin
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    // Only allow requests from same origin
    if (origin && !origin.includes(host || "")) {
      return NextResponse.json(
        { error: "Invalid origin" },
        { status: 403 }
      );
    }

    // 2. Validate Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    // 3. Parse and validate request body
    let body: SetTokenRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { token } = body;

    if (!token || typeof token !== "string" || token.trim() === "") {
      return NextResponse.json(
        { error: "Token is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // 4. Create response with Set-Cookie header
    const response = NextResponse.json(
      { success: true, message: "Token set successfully" },
      { status: 200 }
    );

    // 5. Set httpOnly cookie
    response.cookies.set({
      name: AUTH_COOKIE_CONFIG.name,
      value: token,
      maxAge: AUTH_COOKIE_CONFIG.maxAge,
      path: AUTH_COOKIE_CONFIG.path,
      sameSite: AUTH_COOKIE_CONFIG.sameSite,
      secure: AUTH_COOKIE_CONFIG.secure,
      httpOnly: AUTH_COOKIE_CONFIG.httpOnly,
    });

    return response;
  } catch (error) {
    console.error("Error setting auth token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/auth/set-token
 *
 * Handle preflight requests for CORS.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
