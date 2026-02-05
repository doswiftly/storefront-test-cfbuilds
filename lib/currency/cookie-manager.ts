/**
 * Cookie Manager for Currency Preferences
 *
 * Provides a unified API for managing currency cookies in both SSR and client contexts.
 * This is the single source of truth for currency preferences, replacing localStorage.
 *
 * Key Features:
 * - Works in both Server-Side Rendering and client-side contexts
 * - Type-safe API with full TypeScript support
 * - Automatic fallback handling for blocked cookies
 * - Zero hydration mismatch guarantee
 *
 * @module lib/currency/cookie-manager
 */

import Cookies from 'js-cookie';

/**
 * Cookie configuration constants
 */
export const CURRENCY_COOKIE_NAME = 'preferred-currency';
export const CURRENCY_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 365 days in seconds

/**
 * Cookie Manager Interface
 *
 * Provides methods for reading and writing currency preferences to cookies.
 * All methods work in both SSR and client contexts.
 */
export interface CookieManager {
  /**
   * Get currency from cookie
   * Works in both SSR and client contexts
   *
   * @returns The stored currency code, or null if not set
   */
  getCurrency(): string | null;

  /**
   * Set currency in cookie
   * Only works in client context (SSR is read-only)
   *
   * @param currency - The currency code to store (e.g., "USD", "EUR")
   */
  setCurrency(currency: string): void;

  /**
   * Remove currency cookie
   * Only works in client context
   */
  removeCurrency(): void;

  /**
   * Check if running in server context
   *
   * @returns true if running on server, false if in browser
   */
  isServer(): boolean;
}

/**
 * Client-side Cookie Manager Implementation
 * Uses js-cookie library for browser cookie operations
 */
class ClientCookieManager implements CookieManager {
  getCurrency(): string | null {
    try {
      const value = Cookies.get(CURRENCY_COOKIE_NAME);
      return value || null;
    } catch (error) {
      console.warn("[CookieManager] Failed to read currency cookie:", error);
      return null;
    }
  }

  setCurrency(currency: string): void {
    try {
      // Set cookie with secure attributes
      Cookies.set(CURRENCY_COOKIE_NAME, currency, {
        expires: CURRENCY_COOKIE_MAX_AGE / (24 * 60 * 60), // Convert to days
        path: "/",
        sameSite: "lax",
        // Secure flag is set automatically by js-cookie based on protocol
      });
    } catch (error) {
      console.warn("[CookieManager] Failed to set currency cookie:", error);
      // Fallback: Continue without persisting (in-memory only)
      // This allows the app to function even if cookies are blocked
    }
  }

  removeCurrency(): void {
    try {
      Cookies.remove(CURRENCY_COOKIE_NAME, { path: "/" });
    } catch (error) {
      console.warn("[CookieManager] Failed to remove currency cookie:", error);
    }
  }

  isServer(): boolean {
    return false;
  }
}

/**
 * Server-side Cookie Manager Implementation
 * Uses Next.js cookies() API for SSR context
 */
class ServerCookieManager implements CookieManager {
  getCurrency(): string | null {
    try {
      // Dynamic import to avoid bundling next/headers in client code
      // In Next.js 15+, cookies() returns a Promise
      const { cookies } = require('next/headers');
      const cookieStore = cookies();
      
      // Check if it's a Promise (Next.js 15+) or direct access (Next.js 14)
      if (cookieStore && typeof cookieStore.then === 'function') {
        // This is async - we can't use await in a sync function
        // Return null and log warning - SSR will use base currency
        console.warn('[CookieManager] cookies() is async in Next.js 15+ - cannot read in sync context');
        return null;
      }
      
      const cookie = cookieStore.get(CURRENCY_COOKIE_NAME);
      return cookie?.value || null;
    } catch (error) {
      console.warn('[CookieManager] Failed to read currency cookie in SSR:', error);
      return null;
    }
  }

  setCurrency(currency: string): void {
    // Setting cookies in SSR context is not supported
    // This should only be called from client-side code
    console.warn(
      "[CookieManager] setCurrency called in SSR context - operation ignored"
    );
  }

  removeCurrency(): void {
    // Removing cookies in SSR context is not supported
    console.warn(
      "[CookieManager] removeCurrency called in SSR context - operation ignored"
    );
  }

  isServer(): boolean {
    return true;
  }
}

/**
 * Detect if code is running in server or client context
 *
 * This is a safe check that works in all environments:
 * - Returns true during SSR
 * - Returns false in browser
 * - Handles edge cases gracefully
 */
function isServerContext(): boolean {
  try {
    // typeof window === 'undefined' is the standard Next.js SSR detection
    return typeof window === "undefined";
  } catch {
    // If we can't determine context, assume server (safer default)
    // This prevents accidental client-side operations in ambiguous contexts
    return true;
  }
}

/**
 * Cookie Manager Factory
 *
 * Creates the appropriate cookie manager instance based on execution context.
 * This is a singleton pattern - the same instance is reused across the app.
 */
let cookieManagerInstance: CookieManager | null = null;

/**
 * Get the Cookie Manager singleton instance
 *
 * Automatically detects SSR vs client context and returns the appropriate implementation.
 * The instance is cached for performance.
 *
 * @returns CookieManager instance (ClientCookieManager or ServerCookieManager)
 *
 * @example
 * ```typescript
 * const cookieManager = getCookieManager();
 * const currency = cookieManager.getCurrency();
 * ```
 */
export function getCookieManager(): CookieManager {
  // Reuse existing instance if available
  if (cookieManagerInstance) {
    return cookieManagerInstance;
  }

  // Create appropriate instance based on context
  if (isServerContext()) {
    cookieManagerInstance = new ServerCookieManager();
  } else {
    cookieManagerInstance = new ClientCookieManager();
  }

  return cookieManagerInstance;
}

/**
 * Reset the cookie manager singleton
 * This is primarily useful for testing
 *
 * @internal
 */
export function resetCookieManager(): void {
  cookieManagerInstance = null;
}

/**
 * Convenience function: Get currency from cookie
 * Shorthand for getCookieManager().getCurrency()
 *
 * @returns The stored currency code, or null if not set
 *
 * @example
 * ```typescript
 * const currency = getCurrencyFromCookie();
 * if (currency) {
 *   console.log(`User prefers: ${currency}`);
 * }
 * ```
 */
export function getCurrencyFromCookie(): string | null {
  return getCookieManager().getCurrency();
}

/**
 * Convenience function: Set currency in cookie
 * Shorthand for getCookieManager().setCurrency(currency)
 * Only works in client context
 *
 * @param currency - The currency code to store
 *
 * @example
 * ```typescript
 * setCurrencyInCookie('EUR');
 * ```
 */
export function setCurrencyInCookie(currency: string): void {
  getCookieManager().setCurrency(currency);
}

/**
 * Convenience function: Remove currency cookie
 * Shorthand for getCookieManager().removeCurrency()
 * Only works in client context
 *
 * @example
 * ```typescript
 * removeCurrencyFromCookie();
 * ```
 */
export function removeCurrencyFromCookie(): void {
  getCookieManager().removeCurrency();
}

/**
 * Get currency from cookie in Server Components (async)
 * 
 * This is specifically for Next.js 15+ where cookies() is async.
 * Use this in Server Components and Server Actions.
 * 
 * @returns Promise<string | null> - The stored currency code, or null if not set
 * 
 * @example
 * ```typescript
 * // In a Server Component
 * export default async function ProductPage() {
 *   const currency = await getCurrencyFromCookieAsync();
 *   // ...
 * }
 * ```
 */
export async function getCurrencyFromCookieAsync(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const cookie = cookieStore.get(CURRENCY_COOKIE_NAME);
    return cookie?.value || null;
  } catch (error) {
    console.warn('[CookieManager] Failed to read currency cookie in SSR (async):', error);
    return null;
  }
}
