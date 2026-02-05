'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { getGraphQLClient } from './client';
import { useCurrencyStore } from '@/stores/currency-store';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Normalized response for paginated queries
 * Converts GraphQL edges/nodes structure to flat arrays
 */
export interface NormalizedConnection<T> {
  items: T[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string | null;
    endCursor?: string | null;
  };
  totalCount?: number;
}

/**
 * GraphQL connection edge structure
 */
interface Edge<T> {
  node: T;
  cursor: string;
}

/**
 * GraphQL connection structure
 */
interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string | null;
    endCursor?: string | null;
  };
  totalCount?: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize GraphQL connection to flat array
 * 
 * Converts edges/nodes structure to a simple array of items
 * for easier consumption in components.
 * 
 * @param connection - GraphQL connection object
 * @returns Normalized response with flat items array
 * 
 * @example
 * ```typescript
 * const data = { products: { edges: [...], pageInfo: {...} } };
 * const normalized = normalizeConnection(data.products);
 * // normalized.items is now a flat array
 * ```
 */
export function normalizeConnection<T>(
  connection: Connection<T>
): NormalizedConnection<T> {
  return {
    items: connection.edges.map((edge) => edge.node),
    pageInfo: connection.pageInfo,
    totalCount: connection.totalCount,
  };
}

// ============================================================================
// GENERIC QUERY HOOK
// ============================================================================

/**
 * Generic query hook with currency-aware caching
 * 
 * Wraps React Query's useQuery with automatic currency injection
 * into query keys for proper cache invalidation when currency changes.
 * 
 * @param document - TypedDocumentNode from codegen
 * @param variables - Query variables
 * @param options - React Query options
 * @returns React Query result
 * 
 * @example
 * ```typescript
 * const { data } = useGraphQLQuery(ProductDocument, { handle: 'my-product' });
 * ```
 */
export function useGraphQLQuery<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: TVariables,
  options?: Omit<UseQueryOptions<TResult>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();
  const currency = useCurrencyStore((s: any) => s.currency);
  
  // Generate query key from document name and variables
  // Include currency to invalidate cache when currency changes
  const queryKey = [
    // Extract operation name from document
    (document as any).definitions?.[0]?.name?.value || 'GraphQLQuery',
    variables,
    currency,
  ];
  
  return useQuery({
    queryKey,
    queryFn: () => client.request(document, variables as any),
    ...options,
  });
}

/**
 * Generic mutation hook
 * 
 * Wraps React Query's useMutation for GraphQL mutations.
 * 
 * @param document - TypedDocumentNode from codegen
 * @param options - React Query mutation options
 * @returns React Query mutation result
 * 
 * @example
 * ```typescript
 * const mutation = useGraphQLMutation(CartCreateDocument);
 * await mutation.mutateAsync({ input: {...} });
 * ```
 */
export function useGraphQLMutation<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  options?: UseMutationOptions<TResult, Error, TVariables>
) {
  const client = getGraphQLClient();
  
  return useMutation({
    mutationFn: (variables: TVariables) => client.request(document, variables as any),
    ...options,
  });
}

// ============================================================================
// PRODUCT HOOKS
// ============================================================================

/**
 * Fetch single product by handle or ID
 * 
 * Automatically includes current currency in request headers
 * and query key for proper cache invalidation.
 * 
 * @param handleOrId - Product handle (string) or ID (gid://)
 * @param options - React Query options
 * @returns Product query result
 * 
 * @example
 * ```typescript
 * // In a Client Component
 * 'use client';
 * 
 * export function ProductPrice({ handle }) {
 *   const { data, isLoading } = useProduct(handle);
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   return (
 *     <div suppressHydrationWarning>
 *       {data.product.priceRange.minVariantPrice.amount}{' '}
 *       {data.product.priceRange.minVariantPrice.currencyCode}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProduct(
  handleOrId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();
  const currency = useCurrencyStore((s: any) => s.currency);
  
  // Determine if it's an ID or handle
  const isId = handleOrId.startsWith('gid://');
  
  return useQuery({
    queryKey: ['Product', handleOrId, currency],
    queryFn: async () => {
      // Dynamic import to avoid circular dependencies
      const { ProductDocument } = await import('@/generated/graphql');
      
      const variables = isId ? { id: handleOrId } : { handle: handleOrId };
      return client.request(ProductDocument, variables as any);
    },
    ...options,
  });
}

/**
 * Fetch products with pagination and normalization
 * 
 * Automatically normalizes GraphQL edges/nodes structure to flat arrays.
 * Includes currency in query key for cache invalidation.
 * 
 * @param variables - Query variables (first, after, query, sortKey, reverse)
 * @param options - React Query options
 * @returns Normalized products response
 * 
 * @example
 * ```typescript
 * // In a Client Component
 * 'use client';
 * 
 * export function ProductList() {
 *   const { data, isLoading } = useProducts({ first: 20 });
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   return (
 *     <div>
 *       {data.products.map(product => (
 *         <ProductCard key={product.id} product={product} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
/**
 * Map frontend sort values to GraphQL enum values
 */
function normalizeSortKey(sortKey?: string): { sortKey?: string; reverse?: boolean } {
  if (!sortKey) return { sortKey: 'BEST_SELLING', reverse: false };
  
  const sortMap: Record<string, { sortKey: string; reverse: boolean }> = {
    'relevance': { sortKey: 'RELEVANCE', reverse: false },
    'best-selling': { sortKey: 'BEST_SELLING', reverse: false },
    'price-low-to-high': { sortKey: 'PRICE', reverse: false },
    'price-high-to-low': { sortKey: 'PRICE', reverse: true },
    'title-asc': { sortKey: 'TITLE', reverse: false },
    'title-desc': { sortKey: 'TITLE', reverse: true },
    'created-desc': { sortKey: 'CREATED', reverse: true },
    'created-asc': { sortKey: 'CREATED', reverse: false },
  };
  
  return sortMap[sortKey] || { sortKey: 'BEST_SELLING', reverse: false };
}

export function useProducts(
  variables?: {
    first?: number;
    after?: string;
    query?: string;
    sortKey?: string;
    reverse?: boolean;
  },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();
  const currency = useCurrencyStore((s: any) => s.currency);
  
  return useQuery({
    queryKey: ['Products', variables, currency],
    queryFn: async () => {
      // Dynamic import to avoid circular dependencies
      const { ProductsDocument } = await import('@/generated/graphql');
      
      // Normalize sort key to GraphQL enum format
      const { sortKey: normalizedSortKey, reverse: normalizedReverse } = normalizeSortKey(variables?.sortKey);
      
      const data = await client.request(ProductsDocument, {
        first: variables?.first ?? 20,
        after: variables?.after,
        query: variables?.query,
        sortKey: normalizedSortKey as any,
        reverse: variables?.reverse !== undefined ? variables.reverse : normalizedReverse,
      });
      
      // Normalize: edges/nodes → flat array
      return {
        products: data.products.edges.map((edge: any) => edge.node),
        pageInfo: data.products.pageInfo,
        totalCount: data.products.totalCount,
      };
    },
    ...options,
  });
}

// ============================================================================
// COLLECTION HOOKS
// ============================================================================

/**
 * Fetch single collection by handle or ID
 * 
 * @param handleOrId - Collection handle or ID
 * @param options - React Query options
 * @returns Collection query result
 * 
 * @example
 * ```typescript
 * const { data } = useCollection('featured-products');
 * ```
 */
export function useCollection(
  handleOrId: string,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();
  const currency = useCurrencyStore((s: any) => s.currency);
  
  const isId = handleOrId.startsWith('gid://');
  
  return useQuery({
    queryKey: ['Collection', handleOrId, currency],
    queryFn: async () => {
      const { CollectionDocument } = await import('@/generated/graphql');
      
      // Type-safe conditional variables
      const variables = isId 
        ? { id: handleOrId } as { id: string }
        : { handle: handleOrId } as { handle: string };
      
      return client.request(CollectionDocument, variables as any);
    },
    ...options,
  });
}

/**
 * Fetch collections with pagination and normalization
 * 
 * @param variables - Query variables
 * @param options - React Query options
 * @returns Normalized collections response
 * 
 * @example
 * ```typescript
 * const { data } = useCollections({ first: 10 });
 * ```
 */
export function useCollections(
  variables?: {
    first?: number;
    after?: string;
    query?: string;
    sortKey?: string;
    reverse?: boolean;
  },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();
  const currency = useCurrencyStore((s: any) => s.currency);
  
  return useQuery({
    queryKey: ['Collections', variables, currency],
    queryFn: async () => {
      const { CollectionsDocument } = await import('@/generated/graphql');
      
      const data = await client.request(CollectionsDocument, {
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
    },
    ...options,
  });
}

// ============================================================================
// CATEGORY HOOKS
// ============================================================================

/**
 * Fetch categories with hierarchical structure
 * 
 * Categories are hierarchical (tree structure) and used for catalog organization.
 * Use for filters, navigation, and SEO.
 * 
 * Returns flat array of all categories (roots + children) for easy filtering.
 * 
 * @param options - React Query options
 * @returns Categories response with flat array
 * 
 * @example
 * ```typescript
 * const { data } = useCategories();
 * const categories = data?.categories ?? [];
 * ```
 */
export function useCategories(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();
  const currency = useCurrencyStore((s: any) => s.currency);
  
  return useQuery({
    queryKey: ['Categories', currency],
    queryFn: async () => {
      const { CategoriesDocument } = await import('@/generated/graphql');
      
      const data = await client.request(CategoriesDocument);
      
      // Flatten hierarchical structure to array for filters
      const flattenCategories = (cats: any[]): any[] => {
        return cats.flatMap((cat: any) => [
          cat,
          ...(cat.children ? flattenCategories(cat.children) : [])
        ]);
      };
      
      const allCategories = flattenCategories(data.categories.roots || []);
      
      return {
        categories: allCategories,
        roots: data.categories.roots,
        totalCount: data.categories.totalCount,
      };
    },
    ...options,
  });
}

// ============================================================================
// CART HOOKS
// ============================================================================

/**
 * Fetch cart by ID
 * 
 * Includes currency in query key to refetch when currency changes.
 * Cart prices are locked for 24 hours, but currency header is still
 * included for consistency.
 * 
 * @param cartId - Cart ID
 * @param options - React Query options
 * @returns Cart query result
 * 
 * @example
 * ```typescript
 * const { data } = useCart(cartId);
 * ```
 */
export function useCart(
  cartId: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();
  const currency = useCurrencyStore((s: any) => s.currency);
  
  return useQuery({
    queryKey: ['Cart', cartId, currency],
    queryFn: async () => {
      if (!cartId) return null;
      
      const { CartDocument } = await import('@/generated/graphql');
      
      return client.request(CartDocument, { id: cartId });
    },
    enabled: Boolean(cartId),
    ...options,
  });
}

/**
 * Create a new cart
 * 
 * @param options - React Query mutation options
 * @returns Cart create mutation
 * 
 * @example
 * ```typescript
 * const createCart = useCartCreate();
 * 
 * const handleCreate = async () => {
 *   const { cartCreate } = await createCart.mutateAsync({
 *     input: { lines: [...] }
 *   });
 *   
 *   if (cartCreate.cart) {
 *     // Store cart ID
 *     localStorage.setItem('cartId', cartCreate.cart.id);
 *   }
 * };
 * ```
 */
export function useCartCreate(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: any) => {
      const { CartCreateDocument } = await import('@/generated/graphql');
      return client.request(CartCreateDocument, variables);
    },
    onSuccess: () => {
      // Invalidate cart queries
      queryClient.invalidateQueries({ queryKey: ['Cart'] });
    },
    ...options,
  });
}

/**
 * Add lines to cart
 * 
 * @param options - React Query mutation options
 * @returns Cart lines add mutation
 * 
 * @example
 * ```typescript
 * const addLines = useCartLinesAdd();
 * 
 * const handleAddToCart = async () => {
 *   await addLines.mutateAsync({
 *     cartId: 'cart-123',
 *     lines: [{ merchandiseId: 'variant-456', quantity: 1 }]
 *   });
 * };
 * ```
 */
export function useCartLinesAdd(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: any) => {
      const { CartLinesAddDocument } = await import('@/generated/graphql');
      return client.request(CartLinesAddDocument, variables);
    },
    onSuccess: () => {
      // Invalidate cart queries
      queryClient.invalidateQueries({ queryKey: ['Cart'] });
    },
    ...options,
  });
}

/**
 * Update cart lines
 * 
 * @param options - React Query mutation options
 * @returns Cart lines update mutation
 * 
 * @example
 * ```typescript
 * const updateLines = useCartLinesUpdate();
 * 
 * const handleUpdateQuantity = async (lineId: string, quantity: number) => {
 *   await updateLines.mutateAsync({
 *     cartId: 'cart-123',
 *     lines: [{ id: lineId, quantity }]
 *   });
 * };
 * ```
 */
export function useCartLinesUpdate(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: any) => {
      const { CartLinesUpdateDocument } = await import('@/generated/graphql');
      return client.request(CartLinesUpdateDocument, variables);
    },
    onSuccess: () => {
      // Invalidate cart queries
      queryClient.invalidateQueries({ queryKey: ['Cart'] });
    },
    ...options,
  });
}

/**
 * Remove lines from cart
 * 
 * @param options - React Query mutation options
 * @returns Cart lines remove mutation
 * 
 * @example
 * ```typescript
 * const removeLines = useCartLinesRemove();
 * 
 * const handleRemove = async (lineId: string) => {
 *   await removeLines.mutateAsync({
 *     cartId: 'cart-123',
 *     lineIds: [lineId]
 *   });
 * };
 * ```
 */
export function useCartLinesRemove(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: any) => {
      const { CartLinesRemoveDocument } = await import('@/generated/graphql');
      return client.request(CartLinesRemoveDocument, variables);
    },
    onSuccess: () => {
      // Invalidate cart queries
      queryClient.invalidateQueries({ queryKey: ['Cart'] });
    },
    ...options,
  });
}

/**
 * Update discount codes on cart
 *
 * Invalidates cart query on success so all consumers (useCartSync)
 * automatically receive updated discount data.
 *
 * @param options - React Query mutation options
 * @returns Cart discount codes update mutation
 */
export function useCartDiscountCodesUpdate(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { CartDiscountCodesUpdateDocument } = await import('@/generated/graphql');
      return client.request(CartDiscountCodesUpdateDocument, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Cart'] });
    },
    ...options,
  });
}

// ============================================================================
// CHECKOUT HOOKS
// ============================================================================

/**
 * Fetch checkout by ID
 *
 * @param checkoutId - Checkout ID
 * @param options - React Query options
 * @returns Checkout query result
 */
export function useCheckout(
  checkoutId: string | null,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();
  const currency = useCurrencyStore((s: any) => s.currency);

  return useQuery({
    queryKey: ['Checkout', checkoutId, currency],
    queryFn: async () => {
      if (!checkoutId) return null;

      const { CheckoutDocument } = await import('@/generated/graphql');
      return client.request(CheckoutDocument, { id: checkoutId });
    },
    enabled: Boolean(checkoutId),
    ...options,
  });
}

/**
 * Create checkout from cart
 *
 * @param options - React Query mutation options
 * @returns Checkout create mutation
 */
export function useCheckoutCreate(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { CheckoutCreateDocument } = await import('@/generated/graphql');
      return client.request(CheckoutCreateDocument, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Checkout'] });
    },
    ...options,
  });
}

/**
 * Update checkout shipping address
 *
 * @param options - React Query mutation options
 * @returns Checkout shipping address update mutation
 */
export function useCheckoutShippingAddressUpdate(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { CheckoutShippingAddressUpdateDocument } = await import('@/generated/graphql');
      return client.request(CheckoutShippingAddressUpdateDocument, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Checkout'] });
    },
    ...options,
  });
}

/**
 * Update checkout billing address
 *
 * @param options - React Query mutation options
 * @returns Checkout billing address update mutation
 */
export function useCheckoutBillingAddressUpdate(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { CheckoutBillingAddressUpdateDocument } = await import('@/generated/graphql');
      return client.request(CheckoutBillingAddressUpdateDocument, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Checkout'] });
    },
    ...options,
  });
}

/**
 * Update checkout email
 *
 * @param options - React Query mutation options
 * @returns Checkout email update mutation
 */
export function useCheckoutEmailUpdate(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { CheckoutEmailUpdateDocument } = await import('@/generated/graphql');
      return client.request(CheckoutEmailUpdateDocument, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Checkout'] });
    },
    ...options,
  });
}

/**
 * Update checkout shipping line (select shipping method)
 *
 * @param options - React Query mutation options
 * @returns Checkout shipping line update mutation
 */
export function useCheckoutShippingLineUpdate(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { CheckoutShippingLineUpdateDocument } = await import('@/generated/graphql');
      return client.request(CheckoutShippingLineUpdateDocument, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Checkout'] });
    },
    ...options,
  });
}

/**
 * Apply discount code to checkout
 *
 * @param options - React Query mutation options
 * @returns Checkout discount code apply mutation
 */
export function useCheckoutDiscountCodeApply(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { CheckoutDiscountCodeApplyDocument } = await import('@/generated/graphql');
      return client.request(CheckoutDiscountCodeApplyDocument, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Checkout'] });
    },
    ...options,
  });
}

/**
 * Remove discount code from checkout
 *
 * @param options - React Query mutation options
 * @returns Checkout discount code remove mutation
 */
export function useCheckoutDiscountCodeRemove(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { CheckoutDiscountCodeRemoveDocument } = await import('@/generated/graphql');
      return client.request(CheckoutDiscountCodeRemoveDocument, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Checkout'] });
    },
    ...options,
  });
}

/**
 * Complete checkout (finalize order)
 *
 * @param options - React Query mutation options
 * @returns Checkout complete mutation
 */
export function useCheckoutComplete(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { CheckoutCompleteDocument } = await import('@/generated/graphql');
      return client.request(CheckoutCompleteDocument, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Checkout'] });
      queryClient.invalidateQueries({ queryKey: ['Cart'] });
    },
    ...options,
  });
}

/**
 * Apply gift card code to checkout
 *
 * @param options - React Query mutation options
 * @returns Checkout gift card apply mutation
 */
export function useCheckoutGiftCardApply(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { CheckoutGiftCardApplyDocument } = await import('@/generated/graphql');
      return client.request(CheckoutGiftCardApplyDocument, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Checkout'] });
    },
    ...options,
  });
}

/**
 * Remove gift card from checkout
 *
 * @param options - React Query mutation options
 * @returns Checkout gift card remove mutation
 */
export function useCheckoutGiftCardRemove(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { CheckoutGiftCardRemoveDocument } = await import('@/generated/graphql');
      return client.request(CheckoutGiftCardRemoveDocument, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Checkout'] });
    },
    ...options,
  });
}

// ============================================================================
// CUSTOMER HOOKS
// ============================================================================

/**
 * Customer login mutation
 * 
 * @param options - React Query mutation options
 * @returns Customer login mutation
 * 
 * @example
 * ```typescript
 * const login = useCustomerLogin();
 * 
 * const handleLogin = async (email: string, password: string) => {
 *   const { customerAccessTokenCreate } = await login.mutateAsync({
 *     input: { email, password }
 *   });
 *   
 *   if (customerAccessTokenCreate.customerAccessToken) {
 *     // Store token in httpOnly cookie via API route
 *     await fetch('/api/auth/set-token', {
 *       method: 'POST',
 *       body: JSON.stringify({
 *         token: customerAccessTokenCreate.customerAccessToken.accessToken
 *       })
 *     });
 *   }
 * };
 * ```
 */
export function useCustomerLogin(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  
  return useMutation({
    mutationFn: async (variables: any) => {
      const { CustomerLoginDocument } = await import('@/generated/graphql');
      return client.request(CustomerLoginDocument, variables);
    },
    ...options,
  });
}

/**
 * Customer logout mutation
 * 
 * @param options - React Query mutation options
 * @returns Customer logout mutation
 * 
 * @example
 * ```typescript
 * const logout = useCustomerLogout();
 * 
 * const handleLogout = async () => {
 *   await logout.mutateAsync({ customerAccessToken: token });
 *   
 *   // Clear cookie via API route
 *   await fetch('/api/auth/clear-token', { method: 'POST' });
 * };
 * ```
 */
export function useCustomerLogout(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: any) => {
      const { CustomerLogoutDocument } = await import('@/generated/graphql');
      return client.request(CustomerLogoutDocument, variables);
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
    ...options,
  });
}

// ============================================================================
// LOYALTY HOOKS
// ============================================================================

/**
 * Fetch loyalty member data
 *
 * @param options - React Query options
 * @returns Loyalty member query result
 */
export function useLoyaltyMember(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();
  const currency = useCurrencyStore((s: any) => s.currency);

  return useQuery({
    queryKey: ['LoyaltyMember', currency],
    queryFn: async () => {
      const { LoyaltyMemberDocument } = await import('@/generated/graphql');
      return client.request(LoyaltyMemberDocument);
    },
    ...options,
  });
}

/**
 * Fetch loyalty rewards
 *
 * @param options - React Query options
 * @returns Loyalty rewards query result
 */
export function useLoyaltyRewards(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();
  const currency = useCurrencyStore((s: any) => s.currency);

  return useQuery({
    queryKey: ['LoyaltyRewards', currency],
    queryFn: async () => {
      const { LoyaltyRewardsDocument } = await import('@/generated/graphql');
      return client.request(LoyaltyRewardsDocument);
    },
    ...options,
  });
}

/**
 * Fetch loyalty transactions with pagination
 *
 * @param variables - Query variables (first, after)
 * @param options - React Query options
 * @returns Loyalty transactions query result
 */
export function useLoyaltyTransactions(
  variables?: { first?: number; after?: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();
  const currency = useCurrencyStore((s: any) => s.currency);

  return useQuery({
    queryKey: ['LoyaltyTransactions', variables, currency],
    queryFn: async () => {
      const { LoyaltyTransactionsDocument } = await import('@/generated/graphql');
      return client.request(LoyaltyTransactionsDocument, {
        first: variables?.first ?? 20,
        after: variables?.after,
      });
    },
    ...options,
  });
}

/**
 * Fetch loyalty settings
 *
 * @param options - React Query options
 * @returns Loyalty settings query result
 */
export function useLoyaltySettings(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();

  return useQuery({
    queryKey: ['LoyaltySettings'],
    queryFn: async () => {
      const { LoyaltySettingsDocument } = await import('@/generated/graphql');
      return client.request(LoyaltySettingsDocument);
    },
    ...options,
  });
}

/**
 * Fetch referral stats
 *
 * @param options - React Query options
 * @returns Referral stats query result
 */
export function useReferralStats(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  const client = getGraphQLClient();

  return useQuery({
    queryKey: ['ReferralStats'],
    queryFn: async () => {
      const { ReferralStatsDocument } = await import('@/generated/graphql');
      return client.request(ReferralStatsDocument);
    },
    ...options,
  });
}

/**
 * Redeem loyalty reward mutation
 *
 * @param options - React Query mutation options
 * @returns Redeem reward mutation
 */
export function useRedeemLoyaltyReward(
  options?: UseMutationOptions<any, Error, any>
) {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: any) => {
      const { RedeemLoyaltyRewardDocument } = await import('@/generated/graphql');
      return client.request(RedeemLoyaltyRewardDocument, variables);
    },
    onSuccess: () => {
      // Invalidate loyalty queries to refresh points and rewards
      queryClient.invalidateQueries({ queryKey: ['LoyaltyMember'] });
      queryClient.invalidateQueries({ queryKey: ['LoyaltyRewards'] });
      queryClient.invalidateQueries({ queryKey: ['LoyaltyTransactions'] });
    },
    ...options,
  });
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Hook to invalidate all queries when currency changes
 * 
 * This is automatically handled by including currency in query keys,
 * but this utility can be used for manual invalidation if needed.
 * 
 * @example
 * ```typescript
 * const invalidateOnCurrencyChange = useInvalidateOnCurrencyChange();
 * 
 * // Manually trigger invalidation
 * invalidateOnCurrencyChange();
 * ```
 */
export function useInvalidateOnCurrencyChange() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries();
  };
}
