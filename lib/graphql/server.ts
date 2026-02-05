import { cache } from 'react';
import { GraphQLClient } from 'graphql-request';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { getCurrencyFromCookieAsync } from '@/lib/currency/';

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
 * Cached GraphQL client factory for Server Components
 * 
 * Uses React cache() to deduplicate requests within a single render pass.
 * Server-side requests now include X-Preferred-Currency header from cookie
 * for SSR currency consistency.
 * 
 * Note: This is an async function in Next.js 15+ because cookies() is async.
 * 
 * @returns GraphQL client configured for server-side usage with currency support
 */
export const getClient = cache(async () => {
  // Read currency from cookie (SSR-safe, async in Next.js 15+)
  const currency = await getCurrencyFromCookieAsync();
  
  return new GraphQLClient(`${config!.api.url}/storefront/graphql`, {
    headers: {
      'X-Shop-Slug': config!.shop.slug,
      // Include X-Preferred-Currency from cookie for SSR consistency
      ...(currency && { 'X-Preferred-Currency': currency }),
    },
  });
});

/**
 * Generic request helper with React cache
 * 
 * @param document - TypedDocumentNode from codegen
 * @param variables - Query variables
 * @returns Query result
 */
export const request = cache(async <TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables
): Promise<TResult> => {
  const client = await getClient();
  return client.request(document, variables as any);
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch shop data with currency configuration
 * 
 * Used in root layout to initialize currency store.
 * Cached per render to avoid duplicate requests.
 * 
 * @returns Shop query result
 * 
 * @example
 * ```typescript
 * // app/layout.tsx
 * import { fetchShop } from '@/lib/graphql/server';
 * 
 * export default async function RootLayout() {
 *   const data = await fetchShop();
 *   return <CurrencyProvider shopData={data.shop}>...</CurrencyProvider>;
 * }
 * ```
 */
export const fetchShop = cache(async () => {
  // Import generated types dynamically to avoid circular dependencies
  const { ShopDocument } = await import('@/generated/graphql');
  return request(ShopDocument, {});
});

/**
 * Fetch single product by handle or ID
 * 
 * Returns product in base currency for SSG compatibility.
 * Client components should refetch with preferred currency if needed.
 * 
 * @param handleOrId - Product handle (string) or ID
 * @returns Product query result
 * 
 * @example
 * ```typescript
 * // app/products/[handle]/page.tsx
 * import { fetchProduct } from '@/lib/graphql/server';
 * 
 * export default async function ProductPage({ params }) {
 *   const data = await fetchProduct(params.handle);
 *   return <ProductClient initialProduct={data.product} />;
 * }
 * ```
 */
export const fetchProduct = cache(async (handleOrId: string) => {
  if (!handleOrId) {
    throw new Error('Product handle or ID is required');
  }
  
  const { ProductDocument } = await import('@/generated/graphql');
  
  // Determine if it's an ID or handle
  const isId = handleOrId.startsWith('gid://');
  
  return request(ProductDocument, {
    ...(isId ? { id: handleOrId } : { handle: handleOrId }),
  });
});

/**
 * Fetch products with pagination and normalization
 * 
 * Automatically normalizes GraphQL edges/nodes structure to flat arrays
 * for easier consumption in components.
 * 
 * @param variables - Query variables (first, after, query, sortKey, reverse)
 * @returns Normalized products response
 * 
 * @example
 * ```typescript
 * // app/products/page.tsx
 * import { fetchProducts } from '@/lib/graphql/server';
 * 
 * export default async function ProductsPage() {
 *   const { products, pageInfo } = await fetchProducts({ first: 20 });
 *   return products.map(product => <ProductCard key={product.id} product={product} />);
 * }
 * ```
 */
export const fetchProducts = cache(async (variables?: {
  first?: number;
  after?: string;
  query?: string;
  sortKey?: string;
  reverse?: boolean;
}) => {
  const { ProductsDocument } = await import('@/generated/graphql');
  
  const data = await request(ProductsDocument, {
    first: variables?.first ?? 20,
    after: variables?.after,
    query: variables?.query,
    sortKey: variables?.sortKey as any,
    reverse: variables?.reverse,
  });
  
  // Normalize: edges/nodes → flat array
  return {
    products: data.products.edges.map((edge: any) => edge.node),
    pageInfo: data.products.pageInfo,
    totalCount: data.products.totalCount,
  };
});

/**
 * Fetch collections with pagination and normalization
 * 
 * @param variables - Query variables
 * @returns Normalized collections response
 * 
 * @example
 * ```typescript
 * import { fetchCollections } from '@/lib/graphql/server';
 * 
 * const { collections } = await fetchCollections({ first: 10 });
 * ```
 */
export const fetchCollections = cache(async (variables?: {
  first?: number;
  after?: string;
  query?: string;
  sortKey?: string;
  reverse?: boolean;
}) => {
  const { CollectionsDocument } = await import('@/generated/graphql');
  
  const data = await request(CollectionsDocument, {
    first: variables?.first ?? 20,
    after: variables?.after,
    query: variables?.query,
    sortKey: variables?.sortKey as any,
    reverse: variables?.reverse,
  });
  
  // Normalize: edges/nodes → flat array
  return {
    collections: data.collections.edges.map((edge: any) => edge.node),
    pageInfo: data.collections.pageInfo,
    totalCount: data.collections.totalCount,
  };
});

/**
 * Fetch single collection by handle or ID
 * 
 * @param handleOrId - Collection handle or ID
 * @returns Collection query result
 * 
 * @example
 * ```typescript
 * import { fetchCollection } from '@/lib/graphql/server';
 * 
 * const data = await fetchCollection('featured-products');
 * ```
 */
export const fetchCollection = cache(async (handleOrId: string) => {
  const { CollectionDocument } = await import('@/generated/graphql');
  
  const isId = handleOrId.startsWith('gid://');
  
  return request(CollectionDocument, {
    ...(isId ? { id: handleOrId } : { handle: handleOrId }),
  });
});

/**
 * Fetch categories from GraphQL API
 * 
 * @returns Categories query result with tree structure
 */
export const fetchCategories = cache(async () => {
  const { CategoriesDocument } = await import('@/generated/graphql');
  return request(CategoriesDocument, {});
});

/**
 * Fetch customer data (requires access token)
 * 
 * @param accessToken - Customer access token
 * @returns Customer query result with addresses and orders
 */
export const fetchCustomer = cache(async (accessToken: string) => {
  const { CustomerDocument } = await import('@/generated/graphql');
  return request(CustomerDocument, { customerAccessToken: accessToken });
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Normalized response types for helper functions
 * These types will be inferred from generated GraphQL types
 */
export type NormalizedProductsResponse = Awaited<ReturnType<typeof fetchProducts>>;
export type NormalizedCollectionsResponse = Awaited<ReturnType<typeof fetchCollections>>;
