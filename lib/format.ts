/**
 * Formatting Utilities
 *
 * Common formatting functions for prices, dates, etc.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface PriceMoney {
  amount: string;
  currencyCode: string;
}

export type Money = PriceMoney;

// ============================================================================
// CONSTANTS
// ============================================================================

/** Currency symbols mapping */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  PLN: "zł",
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
  CZK: "Kč",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  JPY: "¥",
  CNY: "¥",
  AUD: "A$",
  CAD: "C$",
};

/** Currency locale mapping for proper formatting */
export const CURRENCY_LOCALES: Record<string, string> = {
  PLN: "pl-PL",
  EUR: "de-DE",
  USD: "en-US",
  GBP: "en-GB",
  CHF: "de-CH",
  CZK: "cs-CZ",
  SEK: "sv-SE",
  NOK: "nb-NO",
  DKK: "da-DK",
  JPY: "ja-JP",
  CNY: "zh-CN",
  AUD: "en-AU",
  CAD: "en-CA",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get currency symbol
 */
export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] || code;
}


// ============================================================================
// PRICE FORMATTING
// ============================================================================

/**
 * Format price with currency symbol
 *
 * @example
 * ```typescript
 * formatPrice({ amount: "99.99", currencyCode: "USD" })
 * // => "$99.99"
 * ```
 */
export function formatPrice(price: PriceMoney | Money | null | undefined): string {
  if (!price) return "";
  
  const amount = parseFloat(price.amount);
  const code = price.currencyCode;
  const locale = CURRENCY_LOCALES[code] || "en-US";
  
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback formatting
    const symbol = CURRENCY_SYMBOLS[code] || code;
    return `${amount.toFixed(2)} ${symbol}`;
  }
}

/**
 * Format price range
 *
 * @example
 * ```typescript
 * formatPriceRange(
 *   { amount: "10.00", currencyCode: "USD" },
 *   { amount: "50.00", currencyCode: "USD" }
 * )
 * // => "$10.00 - $50.00"
 * ```
 */
export function formatPriceRange(
  minPrice: PriceMoney | Money,
  maxPrice: PriceMoney | Money
): string {
  if (minPrice.amount === maxPrice.amount) {
    return formatPrice(minPrice);
  }
  
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
}

/**
 * Format amount with currency
 *
 * @example
 * ```tsx
 * const formatted = formatAmount("115.20", "EUR");
 * // => "115,20 €"
 * ```
 */
export function formatAmount(
  amount: string | number,
  currencyCode: string
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  const locale = CURRENCY_LOCALES[currencyCode] || "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    return `${numAmount.toFixed(2)} ${symbol}`;
  }
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date to locale string
 *
 * @example
 * ```typescript
 * formatDate(new Date())
 * // => "Dec 9, 2025"
 * ```
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Format date with time
 *
 * @example
 * ```typescript
 * formatDateTime(new Date())
 * // => "Dec 9, 2025, 10:30 PM"
 * ```
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format number with thousands separator
 *
 * @example
 * ```typescript
 * formatNumber(1234567)
 * // => "1,234,567"
 * ```
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format percentage
 *
 * @example
 * ```typescript
 * formatPercentage(0.15)
 * // => "15%"
 * ```
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}
