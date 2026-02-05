/**
 * Cookie Helpers for Authentication
 *
 * Provides utilities for managing authentication cookies in both
 * client-side and server-side contexts.
 *
 * Security Notes:
 * - Cookies are httpOnly (set via API routes, not client-side)
 * - Cookies are secure in production (HTTPS only)
 * - Cookies are SameSite=Lax to prevent CSRF
 * - Token validation happens on GraphQL backend
 *
 * @see lib/auth/routes.ts - Cookie name constant
 * @see app/api/auth/set-token/route.ts - Server-side cookie setter
 * @see app/api/auth/clear-token/route.ts - Server-side cookie clearer
 */

import { AUTH_COOKIE_NAME } from "./routes";

/**
 * Cookie configuration for authentication token
 */
export const AUTH_COOKIE_CONFIG = {
  name: AUTH_COOKIE_NAME,
  maxAge: 60 * 60 * 24 * 30, // 30 days (in seconds)
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true, // Cannot be accessed via JavaScript (security)
} as const;

/**
 * Get authentication token from cookies (client-side)
 *
 * Note: This only works if the cookie is NOT httpOnly.
 * For httpOnly cookies, use server-side methods or API routes.
 *
 * @returns Token string or null if not found
 *
 * @example
 * ```tsx
 * const token = getAuthToken();
 * if (token) {
 *   // User is authenticated
 * }
 * ```
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null; // Server-side
  }

  const cookies = document.cookie.split("; ");
  const authCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!authCookie) {
    return null;
  }

  return authCookie.split("=")[1] || null;
}

/**
 * Check if user is authenticated (client-side)
 *
 * Note: This checks cookie EXISTENCE, not VALIDITY.
 * Token validation happens on the GraphQL backend.
 *
 * @returns True if auth cookie exists
 *
 * @example
 * ```tsx
 * const isAuthenticated = isAuthTokenPresent();
 * if (isAuthenticated) {
 *   // Show authenticated UI
 * }
 * ```
 */
export function isAuthTokenPresent(): boolean {
  return getAuthToken() !== null;
}

/**
 * Set authentication token (via API route)
 *
 * This function calls the API route to set an httpOnly cookie.
 * Direct client-side cookie setting is NOT secure for auth tokens.
 *
 * @param token - Customer access token from GraphQL
 * @returns Promise that resolves when cookie is set
 *
 * @example
 * ```tsx
 * const { customerAccessToken } = await loginMutation.mutateAsync({
 *   input: { email, password }
 * });
 *
 * if (customerAccessToken) {
 *   await setAuthToken(customerAccessToken.accessToken);
 * }
 * ```
 */
export async function setAuthToken(token: string): Promise<void> {
  const response = await fetch("/api/auth/set-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error("Failed to set authentication token");
  }
}

/**
 * Clear authentication token (via API route)
 *
 * This function calls the API route to clear the httpOnly cookie.
 *
 * @returns Promise that resolves when cookie is cleared
 *
 * @example
 * ```tsx
 * await clearAuthToken();
 * router.push('/auth/login');
 * ```
 */
export async function clearAuthToken(): Promise<void> {
  const response = await fetch("/api/auth/clear-token", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to clear authentication token");
  }
}

/**
 * Parse cookie string into key-value object
 *
 * Utility function for parsing cookie strings in server-side contexts.
 *
 * @param cookieString - Raw cookie string from request headers
 * @returns Object with cookie key-value pairs
 *
 * @example
 * ```tsx
 * const cookies = parseCookies(request.headers.get('cookie') || '');
 * const token = cookies[AUTH_COOKIE_NAME];
 * ```
 */
export function parseCookies(cookieString: string): Record<string, string> {
  return cookieString
    .split("; ")
    .reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
}

/**
 * Serialize cookie for Set-Cookie header
 *
 * Utility function for creating Set-Cookie header values in API routes.
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options (maxAge, path, etc.)
 * @returns Serialized cookie string for Set-Cookie header
 *
 * @example
 * ```tsx
 * const cookieHeader = serializeCookie(
 *   AUTH_COOKIE_NAME,
 *   token,
 *   AUTH_COOKIE_CONFIG
 * );
 * response.headers.set('Set-Cookie', cookieHeader);
 * ```
 */
export function serializeCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    sameSite?: "strict" | "lax" | "none";
    secure?: boolean;
    httpOnly?: boolean;
  } = {}
): string {
  const parts = [`${name}=${value}`];

  if (options.maxAge) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  return parts.join("; ");
}
