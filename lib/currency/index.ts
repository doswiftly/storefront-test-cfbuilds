/**
 * Currency Module
 *
 * Provides utilities for managing currency preferences in the storefront.
 * Uses cookies as the single source of truth for SSR/client consistency.
 *
 * @module lib/currency
 */

export {
  // Types
  type CookieManager,

  // Constants
  CURRENCY_COOKIE_NAME,
  CURRENCY_COOKIE_MAX_AGE,

  // Main API
  getCookieManager,
  resetCookieManager,

  // Convenience functions
  getCurrencyFromCookie,
  getCurrencyFromCookieAsync,
  setCurrencyInCookie,
  removeCurrencyFromCookie,
} from "./cookie-manager";
