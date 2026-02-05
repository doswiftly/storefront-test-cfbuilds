/**
 * Auth Routes Configuration (SSOT)
 *
 * This file is the single source of truth for authentication routes.
 * Used by middleware.ts and can be imported by components if needed.
 *
 * IMPORTANT: Checkout is NOT protected to allow guest checkout (e-commerce best practice).
 * Users can optionally log in during checkout to use saved addresses.
 *
 * @example
 * // Add new protected route
 * export const protectedRoutes = ['/account', '/wishlist'];
 *
 * @example
 * // Add new guest-only route
 * export const guestOnlyRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
 */

/**
 * Routes that require authentication.
 * Unauthenticated users will be redirected to login.
 *
 * NOTE: /checkout is intentionally NOT here - guest checkout is allowed.
 */
export const protectedRoutes = ["/account"];

/**
 * Routes only accessible to guests (unauthenticated users).
 * Authenticated users will be redirected to account.
 */
export const guestOnlyRoutes = ["/auth/login", "/auth/register"];

/**
 * Cookie name for customer access token.
 * Must match the cookie name used by commerce-sdk.
 */
export const AUTH_COOKIE_NAME = "customerAccessToken";

/**
 * Default redirect paths
 */
export const redirects = {
  /** Where to redirect unauthenticated users trying to access protected routes */
  unauthenticated: "/auth/login",
  /** Where to redirect authenticated users trying to access guest-only routes */
  authenticated: "/account",
} as const;

/**
 * Check if a pathname matches any route in the list.
 * Supports both exact matches and prefix matches (e.g., /account matches /account/orders).
 */
export function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
