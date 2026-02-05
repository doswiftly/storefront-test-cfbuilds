# Currency Cookie Manager

A robust, type-safe solution for managing currency preferences in Next.js storefronts with full SSR support.

## Overview

The Cookie Manager provides a unified API for storing and retrieving currency preferences using HTTP cookies. This ensures currency preferences persist across page refreshes and work seamlessly with Server-Side Rendering (SSR), eliminating hydration mismatches.

## Why Cookies?

Previously, currency preferences were stored in localStorage, which caused several issues:

- ❌ **Not accessible during SSR** - localStorage is client-only
- ❌ **Hydration mismatches** - Server renders base currency, client renders selected currency
- ❌ **Flash of incorrect content** - Prices appear in wrong currency briefly after page load
- ❌ **Missing headers** - GraphQL requests from SSR couldn't include preferred currency

Cookies solve all these problems:

- ✅ **Accessible in SSR** - via `next/headers` cookies() API
- ✅ **Zero hydration mismatch** - Server and client read same value
- ✅ **Automatic header injection** - GraphQL client can read cookie in SSR
- ✅ **Persistent** - Survives page refreshes and navigation

## Installation

The cookie manager requires these dependencies:

```bash
pnpm add js-cookie
pnpm add -D @types/js-cookie
```

## Quick Start

### Basic Usage

```typescript
import { getCookieManager } from "@/lib/currency";

// Get the cookie manager instance
const cookieManager = getCookieManager();

// Read currency preference
const currency = cookieManager.getCurrency();
console.log(currency); // "EUR" or null

// Set currency preference (client-side only)
cookieManager.setCurrency("USD");

// Remove currency preference (client-side only)
cookieManager.removeCurrency();

// Check execution context
if (cookieManager.isServer()) {
  console.log("Running in SSR");
}
```

### Convenience Functions

For simpler usage, use the convenience functions:

```typescript
import {
  getCurrencyFromCookie,
  setCurrencyInCookie,
  removeCurrencyFromCookie,
} from "@/lib/currency";

// Read currency
const currency = getCurrencyFromCookie();

// Set currency
setCurrencyInCookie("EUR");

// Remove currency
removeCurrencyFromCookie();
```

## Architecture

### Dual Implementation

The cookie manager uses different implementations for SSR and client contexts:

```typescript
// Client context (browser)
class ClientCookieManager {
  // Uses js-cookie library
  getCurrency() { return Cookies.get('preferred-currency'); }
  setCurrency(currency) { Cookies.set('preferred-currency', currency, { ... }); }
  removeCurrency() { Cookies.remove('preferred-currency'); }
}

// Server context (SSR)
class ServerCookieManager {
  // Uses Next.js cookies() API
  getCurrency() { return cookies().get('preferred-currency')?.value; }
  setCurrency() { /* No-op - SSR is read-only */ }
  removeCurrency() { /* No-op - SSR is read-only */ }
}
```

### Cookie Specification

- **Name**: `preferred-currency`
- **Path**: `/` (accessible across all pages)
- **Max-Age**: 365 days
- **SameSite**: `lax` (prevents CSRF, allows navigation)
- **Secure**: `true` in production (HTTPS only)
- **HttpOnly**: `false` (needs client-side access)

## API Reference

### `getCookieManager(): CookieManager`

Returns the singleton cookie manager instance. Automatically detects SSR vs client context.

```typescript
const manager = getCookieManager();
```

### `CookieManager.getCurrency(): string | null`

Reads currency from cookie. Works in both SSR and client contexts.

**Returns:** Currency code (e.g., `"USD"`) or `null` if not set

```typescript
const currency = manager.getCurrency();
if (currency) {
  console.log(`User prefers: ${currency}`);
}
```

### `CookieManager.setCurrency(currency: string): void`

Writes currency to cookie. Only works in client context (SSR is read-only).

**Parameters:**

- `currency` - Currency code to store (e.g., `"EUR"`)

```typescript
manager.setCurrency("GBP");
```

### `CookieManager.removeCurrency(): void`

Removes currency cookie. Only works in client context.

```typescript
manager.removeCurrency();
```

### `CookieManager.isServer(): boolean`

Returns `true` if running in SSR context, `false` if in browser.

```typescript
if (manager.isServer()) {
  console.log("Rendering on server");
}
```

## Integration Patterns

### With Zustand Store

The currency store should use the cookie manager instead of localStorage:

```typescript
import { create } from "zustand";
import { getCookieManager } from "@/lib/currency";

interface CurrencyStore {
  currency: string | null;
  setCurrency: (currency: string) => void;
}

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  currency: null,

  setCurrency: (currency: string) => {
    // Update Zustand state
    set({ currency });

    // Persist to cookie
    const cookieManager = getCookieManager();
    cookieManager.setCurrency(currency);
  },
}));
```

### With GraphQL Client

The GraphQL client should read from cookies for SSR compatibility:

```typescript
import { GraphQLClient } from "graphql-request";
import { getCurrencyFromCookie } from "@/lib/currency";

export function createGraphQLClient() {
  return new GraphQLClient(API_URL, {
    headers: () => {
      const currency = getCurrencyFromCookie();

      return {
        "X-Shop-Slug": SHOP_SLUG,
        // Include header only if currency exists
        ...(currency && { "X-Preferred-Currency": currency }),
      };
    },
  });
}
```

### In Server Components

Server Components can read currency for SSR:

```typescript
import { getCurrencyFromCookie } from "@/lib/currency";

export default function ProductPage() {
  // This runs on the server
  const currency = getCurrencyFromCookie();

  return (
    <div>
      <h1>Products</h1>
      <p>Showing prices in: {currency || "USD"}</p>
    </div>
  );
}
```

### In Client Components

Client Components can both read and write:

```typescript
"use client";

import { getCurrencyFromCookie, setCurrencyInCookie } from "@/lib/currency";
import { useState, useEffect } from "react";

export function CurrencySelector() {
  const [currency, setCurrency] = useState<string | null>(null);

  useEffect(() => {
    // Read on mount
    setCurrency(getCurrencyFromCookie());
  }, []);

  const handleChange = (newCurrency: string) => {
    // Update state
    setCurrency(newCurrency);

    // Persist to cookie
    setCurrencyInCookie(newCurrency);
  };

  return (
    <select
      value={currency || ""}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
      <option value="GBP">GBP</option>
    </select>
  );
}
```

## Error Handling

The cookie manager handles errors gracefully:

### Blocked Cookies

If cookies are blocked by the browser:

```typescript
// Setting fails silently
cookieManager.setCurrency("EUR"); // Logs warning, continues

// Reading returns null
const currency = cookieManager.getCurrency(); // null
```

### SSR Write Attempts

If code tries to write in SSR:

```typescript
// In SSR context
cookieManager.setCurrency("USD"); // Logs warning, no-op
```

### Missing Next.js Headers

If `cookies()` API is unavailable:

```typescript
// Returns null gracefully
const currency = cookieManager.getCurrency(); // null (with warning)
```

## Testing

### Unit Tests

The cookie manager includes comprehensive unit tests:

```bash
pnpm test lib/currency/cookie-manager.test.ts
```

Tests cover:

- ✅ Client-side cookie operations
- ✅ Server-side cookie reading
- ✅ Error handling and fallbacks
- ✅ Singleton pattern
- ✅ SSR/client context detection

### Manual Testing

Test the complete flow:

1. **Set currency in browser**

   ```typescript
   setCurrencyInCookie("EUR");
   ```

2. **Refresh page** - Currency should persist

3. **Check DevTools** - Cookie should be visible in Application tab

4. **Check Network** - GraphQL requests should include `X-Preferred-Currency: EUR`

## Migration from localStorage

If you're migrating from localStorage-based storage:

### Before (localStorage)

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCurrencyStore = create(
  persist(
    (set) => ({
      currency: null,
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "currency-storage" }
  )
);
```

### After (Cookies)

```typescript
import { create } from "zustand";
import { getCookieManager } from "@/lib/currency";

export const useCurrencyStore = create((set) => ({
  currency: null,

  // Initialize from cookie
  initialize: () => {
    const currency = getCookieManager().getCurrency();
    set({ currency });
  },

  setCurrency: (currency) => {
    set({ currency });
    getCookieManager().setCurrency(currency);
  },
}));
```

**Note:** Users will need to re-select their currency after the update. This is acceptable as it's a one-time inconvenience.

## Best Practices

### ✅ DO

- Use `getCookieManager()` for SSR-safe access
- Read from cookie in GraphQL client for header injection
- Handle `null` return values gracefully
- Let the cookie manager handle SSR/client detection

### ❌ DON'T

- Access cookies directly with `document.cookie`
- Cache the currency value (always read fresh)
- Try to write cookies in SSR context
- Assume cookies are always available (they can be blocked)

## Troubleshooting

### Currency not persisting

**Symptom:** Currency resets to default on page refresh

**Causes:**

1. Cookies are blocked by browser
2. Third-party cookie restrictions
3. Incognito/private browsing mode

**Solution:** Check browser DevTools > Application > Cookies

### SSR hydration mismatch

**Symptom:** React warning about hydration mismatch

**Causes:**

1. Reading from Zustand store instead of cookie in SSR
2. Using `useEffect` to initialize currency

**Solution:** Initialize currency from cookie in `initialize()` method, call it before SSR

### GraphQL header missing

**Symptom:** Backend returns prices in base currency

**Causes:**

1. GraphQL client reads from Zustand instead of cookie
2. Cookie not set yet
3. SSR context can't access cookie

**Solution:** Use `getCurrencyFromCookie()` in GraphQL client headers function

## Constants

```typescript
export const CURRENCY_COOKIE_NAME = "preferred-currency";
export const CURRENCY_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 365 days in seconds
```

## Type Definitions

```typescript
export interface CookieManager {
  getCurrency(): string | null;
  setCurrency(currency: string): void;
  removeCurrency(): void;
  isServer(): boolean;
}
```

## License

MIT
