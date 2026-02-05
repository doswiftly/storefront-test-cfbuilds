'use client';

import { GraphQLClient } from 'graphql-request';
import { getCurrencyFromCookie } from '@/lib/currency/';

// Import config - will be injected by CLI during template generation
let config: {
  shop: { slug: string };
  api: { url: string };
} | null = null;

try {
  // Dynamic import to handle cases where config doesn't exist yet
  const configModule = require('@/doswiftly.config');
  config = configModule.default || configModule;
} catch (error) {
  // Fallback to environment variables if config file doesn't exist
  config = {
    shop: {
      slug: process.env.NEXT_PUBLIC_SHOP_SLUG || 'demo-shop',
    },
    api: {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    },
  };
}

/**
 * Create a GraphQL client with dynamic currency header
 * 
 * This factory creates a new client instance that reads the current
 * preferred currency from cookies on each request, ensuring SSR compatibility.
 * 
 * The client injects:
 * - X-Shop-Slug: Shop identifier for multi-tenancy
 * - X-Preferred-Currency: User's preferred currency (from cookie, SSR-safe)
 * 
 * @returns GraphQL client configured for client-side usage with currency support
 * 
 * @example
 * ```typescript
 * const client = createGraphQLClient();
 * const data = await client.request(ProductDocument, { handle: 'my-product' });
 * ```
 */
export function createGraphQLClient(): GraphQLClient {
  return new GraphQLClient(`${config!.api.url}/storefront/graphql`, {
    headers: () => {
      // Read current currency from cookie (SSR-safe, always fresh)
      const currency = getCurrencyFromCookie();
      
      return {
        'X-Shop-Slug': config!.shop.slug,
        // Dynamic currency header - reads from cookie on each request
        ...(currency && { 'X-Preferred-Currency': currency }),
      };
    },
  });
}

/**
 * Singleton GraphQL client instance
 * 
 * Reuses the same client instance across the application to avoid
 * creating multiple connections. The client's headers are evaluated
 * dynamically on each request, so currency changes are reflected
 * automatically.
 */
let clientInstance: GraphQLClient | null = null;

/**
 * Get or create the singleton GraphQL client
 * 
 * Returns a cached client instance that automatically includes
 * the current preferred currency in request headers.
 * 
 * The client is currency-aware and will include the user's
 * preferred currency in the X-Preferred-Currency header on
 * every request.
 * 
 * @returns Singleton GraphQL client instance
 * 
 * @example
 * ```typescript
 * // In a Client Component
 * 'use client';
 * import { getGraphQLClient } from '@/lib/graphql/client';
 * import { ProductDocument } from '@/generated/graphql';
 * 
 * export function ProductPrice({ handle }) {
 *   const client = getGraphQLClient();
 *   
 *   const fetchProduct = async () => {
 *     return client.request(ProductDocument, { handle });
 *   };
 *   
 *   // Product will be fetched with current preferred currency
 *   const { data } = useQuery(['product', handle], fetchProduct);
 *   
 *   return <div>{data.product.priceRange.minVariantPrice.amount}</div>;
 * }
 * ```
 */
export function getGraphQLClient(): GraphQLClient {
  if (!clientInstance) {
    clientInstance = createGraphQLClient();
  }
  return clientInstance;
}
