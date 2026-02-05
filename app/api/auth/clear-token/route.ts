/**
 * API Route: Clear Authentication Token
 *
 * Clears the customer access token cookie by setting it to expire immediately.
 * This is used during logout to ensure the user is fully signed out.
 *
 * Security Features:
 * 1. Origin validation - Only accepts requests from same origin (CSRF protection)
 * 2. Immediate expiration - Sets maxAge to 0 to delete cookie
 * 3. Same cookie attributes - Ensures proper deletion across all contexts
 *
 * @see lib/auth/cookies.ts - Cookie configuration
 * @see hooks/use-auth.ts - Client-side usage
 *
 * @example
 * ```tsx
 * // Client-side usage (via clearAuthToken helper)
 * await clearAuthToken();
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_CONFIG } from "@/lib/auth/cookies";

/**
 * POST /api/auth/clear-token
 *
 * Clears the authentication token cookie.
 *
 * @param request - Next.js request object
 * @returns Response confirming token was cleared
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

    // 2. Create response
    const response = NextResponse.json(
      { success: true, message: "Token cleared successfully" },
      { status: 200 }
    );

    // 3. Clear cookie by setting maxAge to 0
    response.cookies.set({
      name: AUTH_COOKIE_CONFIG.name,
      value: "",
      maxAge: 0, // Expire immediately
      path: AUTH_COOKIE_CONFIG.path,
      sameSite: AUTH_COOKIE_CONFIG.sameSite,
      secure: AUTH_COOKIE_CONFIG.secure,
      httpOnly: AUTH_COOKIE_CONFIG.httpOnly,
    });

    return response;
  } catch (error) {
    console.error("Error clearing auth token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/auth/clear-token
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
