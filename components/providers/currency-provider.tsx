'use client';

/**
 * CurrencyProvider - Initializes currency store with Shop data
 *
 * This provider:
 * 1. Receives Shop data from server (via root layout)
 * 2. Initializes currency store on mount
 * 3. Handles currency detection from:
 *    - localStorage (saved preference)
 *    - Browser locale (auto-detection)
 *    - Shop base currency (fallback)
 *
 * The currency store manages:
 * - User's preferred currency
 * - Supported currencies list
 * - Base currency for the shop
 * - Persistence to localStorage
 *
 * @module storefront-nextjs/components/providers/currency-provider
 */

import { useEffect, type ReactNode } from 'react';
import { useCurrencyStore, type ShopCurrencyData } from '@/stores/currency-store';

// ============================================================================
// TYPES
// ============================================================================

interface CurrencyProviderProps {
  /**
   * Shop data containing currency configuration
   * Fetched from GraphQL Shop query in root layout
   */
  shopData: ShopCurrencyData;
  
  /**
   * Child components
   */
  children: ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CurrencyProvider - Initializes currency store with Shop data
 *
 * This component should be placed in the root layout after fetching Shop data.
 * It initializes the currency store once on mount, which triggers:
 * 1. Loading saved currency from localStorage (if valid)
 * 2. Auto-detecting currency from browser locale (if no saved preference)
 * 3. Falling back to shop's base currency
 *
 * The initialization only happens once per session. Subsequent currency changes
 * are handled by the currency store's setCurrency action.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { fetchShop } from '@/lib/graphql/server';
 * import { CurrencyProvider } from '@/components/providers/currency-provider';
 *
 * export default async function RootLayout({ children }) {
 *   const { shop } = await fetchShop();
 *
 *   return (
 *     <html lang="en">
 *       <body>
 *         <QueryProvider>
 *           <CurrencyProvider shopData={shop}>
 *             <Header />
 *             <main>{children}</main>
 *             <Footer />
 *           </CurrencyProvider>
 *         </QueryProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @param props - Component props
 * @param props.shopData - Shop currency configuration
 * @param props.children - Child components to render
 */
export function CurrencyProvider({ shopData, children }: CurrencyProviderProps) {
  const initialize = useCurrencyStore((state: any) => state.initialize);
  
  useEffect(() => {
    // Initialize currency store with Shop data
    // This will:
    // 1. Set base currency and supported currencies
    // 2. Restore saved currency from localStorage (if valid)
    // 3. Auto-detect from browser locale (if no saved preference)
    // 4. Fall back to base currency
    initialize(shopData);
  }, [shopData, initialize]);
  
  // Simply render children - the store initialization happens in the background
  return <>{children}</>;
}
