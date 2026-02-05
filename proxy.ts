import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  protectedRoutes,
  guestOnlyRoutes,
  AUTH_COOKIE_NAME,
  redirects,
  matchesRoute,
} from "@/lib/auth/routes";

/**
 * Authentication Proxy Function (Next.js 15+)
 *
 * Security Model (3 layers):
 * 1. Proxy function (this file) - Fast redirect based on cookie existence (UX layer)
 * 2. AuthGuard component - Client-side validation via useAuth hook
 * 3. GraphQL Backend - Ultimate security (validates token on every request)
 *
 * IMPORTANT: This proxy checks cookie EXISTENCE, not VALIDITY.
 * Token validation happens in:
 * - AuthGuard (client-side via useAuth hook)
 * - GraphQL API (server-side, ultimate security)
 *
 * Why this approach?
 * - Proxy runs on Edge Runtime (fast, but limited capabilities)
 * - Cannot make GraphQL requests to validate token
 * - Provides instant redirect without waiting for client hydration
 * - Prevents flash of protected content for unauthenticated users
 *
 * @see lib/auth/routes.ts - SSOT for route configuration
 * @see components/auth/auth-guard.tsx - Client-side auth protection
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const hasToken = Boolean(token);

  // Protected routes - redirect to login if no token
  if (matchesRoute(pathname, protectedRoutes)) {
    if (!hasToken) {
      const loginUrl = new URL(redirects.unauthenticated, request.url);
      // Preserve the original URL for redirect after login
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Guest-only routes - redirect to account if has token
  if (matchesRoute(pathname, guestOnlyRoutes)) {
    if (hasToken) {
      return NextResponse.redirect(
        new URL(redirects.authenticated, request.url)
      );
    }
  }

  return NextResponse.next();
}

/**
 * Matcher configuration
 *
 * Only run proxy on routes that need auth checks.
 * This improves performance by skipping static assets, API routes, etc.
 *
 * Update this when adding new protected or guest-only route groups.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
