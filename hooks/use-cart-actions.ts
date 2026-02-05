'use client';

import { useCallback, useRef } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { useCartCreate, useCartLinesAdd, useCartLinesUpdate, useCartLinesRemove } from '@/lib/graphql/hooks';
import { toast } from 'sonner';

// Debounce delay for quantity updates (prevents rate limiting)
const QUANTITY_UPDATE_DEBOUNCE_MS = 500;

/**
 * Hook for cart mutations — server-only, no local state manipulation.
 *
 * All mutations go through GraphQL. React Query cache invalidation
 * (configured in hooks.ts) automatically updates all consumers via useCartSync.
 *
 * @example
 * ```typescript
 * const { addToCart, updateQuantity, removeFromCart } = useCartActions();
 *
 * await addToCart({
 *   variantId: 'variant-123',
 *   productId: 'product-456',
 *   productTitle: 'T-Shirt',
 *   variantTitle: 'Large / Blue',
 *   price: { amount: '29.99', currencyCode: 'USD' },
 *   quantity: 1
 * });
 *
 * // updateQuantity and removeFromCart take lineId (not variantId)
 * updateQuantity('line-abc', 3);
 * removeFromCart('line-abc');
 * ```
 */
export function useCartActions() {
  const {
    setCartId,
    clearCart,
    openCart,
  } = useCartStore();

  // GraphQL mutations
  const createCartMutation = useCartCreate();
  const addLinesMutation = useCartLinesAdd();
  const updateLinesMutation = useCartLinesUpdate();
  const removeLinesMutation = useCartLinesRemove();

  // Debounce refs for quantity updates (prevents ThrottlerException on rapid clicks)
  const updateTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingUpdatesRef = useRef<Map<string, { lineId: string; quantity: number }>>(new Map());

  /**
   * Get or create cart ID.
   * Reads cartId from store (fresh, not stale closure) or creates a new cart.
   */
  const getOrCreateCartId = useCallback(async (forceNew: boolean = false): Promise<string> => {
    const currentCartId = useCartStore.getState().cartId;
    if (currentCartId && !forceNew) {
      return currentCartId;
    }

    try {
      const result = await createCartMutation.mutateAsync({ input: {} });

      if (result.cartCreate.cart) {
        const newCartId = result.cartCreate.cart.id;
        setCartId(newCartId);
        return newCartId;
      }

      if (result.cartCreate.userErrors?.length > 0) {
        throw new Error(result.cartCreate.userErrors[0].message);
      }

      throw new Error('Failed to create cart');
    } catch (error: any) {
      console.error('Cart creation failed:', error);
      throw error;
    }
  }, [setCartId, createCartMutation]);

  /**
   * Check if error is a "Cart not found" error (stale/expired cart)
   */
  const isCartNotFoundError = (error: any): boolean => {
    const message = error?.message || '';
    return message.toLowerCase().includes('cart not found') ||
           message.toLowerCase().includes('cart does not exist');
  };

  /**
   * Add item to cart (server-only).
   *
   * Creates cart if needed. On "cart not found", clears cartId, creates new cart, retries once.
   * React Query cache invalidation in hooks.ts updates all useCartSync consumers.
   */
  const addToCart = useCallback(async (item: {
    variantId: string;
    productId: string;
    productHandle?: string;
    productTitle: string;
    variantTitle: string;
    price: { amount: string; currencyCode: string };
    image?: { url: string; altText?: string | null } | null;
    available?: boolean;
    quantity?: number;
  }, _options?: { _forceNewCart?: boolean }) => {
    const forceNewCart = _options?._forceNewCart ?? false;

    try {
      const cartId = await getOrCreateCartId(forceNewCart);

      const result = await addLinesMutation.mutateAsync({
        cartId,
        lines: [{
          merchandiseId: item.variantId,
          quantity: item.quantity ?? 1,
        }],
      });

      if (result.cartLinesAdd.userErrors?.length > 0) {
        const errorMessage = result.cartLinesAdd.userErrors[0].message;

        if (isCartNotFoundError({ message: errorMessage }) && !forceNewCart) {
          console.warn('Cart expired, creating new cart and retrying...');
          setCartId(null);
          return addToCart(item, { _forceNewCart: true });
        }

        throw new Error(errorMessage);
      }

      // Open cart drawer to show the added item
      openCart();
      toast.success('Added to cart');
    } catch (error: any) {
      if (isCartNotFoundError(error) && !forceNewCart) {
        console.warn('Cart expired (caught), creating new cart and retrying...');
        setCartId(null);
        return addToCart(item, { _forceNewCart: true });
      }

      console.error('Add to cart failed:', error);
      toast.error(error.message || 'Failed to add to cart');
      throw error;
    }
  }, [setCartId, openCart, getOrCreateCartId, addLinesMutation]);

  /**
   * Execute the actual GraphQL update for a pending quantity change
   */
  const executeQuantityUpdate = useCallback(async (lineId: string, quantity: number) => {
    try {
      const currentCartId = useCartStore.getState().cartId;
      if (!currentCartId) {
        throw new Error('No cart found');
      }

      const result = await updateLinesMutation.mutateAsync({
        cartId: currentCartId,
        lines: [{
          id: lineId,
          quantity,
        }],
      });

      if (result.cartLinesUpdate.userErrors?.length > 0) {
        const errorMessage = result.cartLinesUpdate.userErrors[0].message;

        if (isCartNotFoundError({ message: errorMessage })) {
          console.warn('Cart expired during update, clearing cart');
          clearCart();
          toast.error('Your cart has expired. Please add items again.');
          return;
        }

        throw new Error(errorMessage);
      }
    } catch (error: any) {
      if (isCartNotFoundError(error)) {
        console.warn('Cart expired during update (caught), clearing cart');
        clearCart();
        toast.error('Your cart has expired. Please add items again.');
        return;
      }

      console.error('Update quantity failed:', error);
      toast.error(error.message || 'Failed to update quantity');
    }
  }, [updateLinesMutation, clearCart]);

  /**
   * Remove item from cart by line ID.
   *
   * Silently handles expired cart (just clears stale cartId).
   */
  const removeFromCart = useCallback(async (lineId: string) => {
    try {
      const currentCartId = useCartStore.getState().cartId;
      if (!currentCartId) {
        return;
      }

      const result = await removeLinesMutation.mutateAsync({
        cartId: currentCartId,
        lineIds: [lineId],
      });

      if (result.cartLinesRemove.userErrors?.length > 0) {
        const errorMessage = result.cartLinesRemove.userErrors[0].message;

        if (isCartNotFoundError({ message: errorMessage })) {
          console.warn('Cart expired during remove, clearing stale cartId');
          setCartId(null);
          return;
        }

        throw new Error(errorMessage);
      }

      toast.success('Removed from cart');
    } catch (error: any) {
      if (isCartNotFoundError(error)) {
        console.warn('Cart expired during remove (caught), clearing stale cartId');
        setCartId(null);
        return;
      }

      console.error('Remove from cart failed:', error);
      toast.error(error.message || 'Failed to remove from cart');
      throw error;
    }
  }, [setCartId, removeLinesMutation]);

  /**
   * Update item quantity (debounced, takes lineId).
   *
   * Debounces GraphQL API calls to prevent ThrottlerException on rapid clicks.
   * If quantity <= 0, removes the item instead.
   */
  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineId);
      return;
    }

    // Cancel any pending update for this line
    const existingTimeout = updateTimeoutRef.current.get(lineId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Store the pending update
    pendingUpdatesRef.current.set(lineId, { lineId, quantity });

    // Schedule debounced API call
    const timeout = setTimeout(() => {
      const pending = pendingUpdatesRef.current.get(lineId);
      if (pending) {
        pendingUpdatesRef.current.delete(lineId);
        updateTimeoutRef.current.delete(lineId);
        executeQuantityUpdate(pending.lineId, pending.quantity);
      }
    }, QUANTITY_UPDATE_DEBOUNCE_MS);

    updateTimeoutRef.current.set(lineId, timeout);
  }, [removeFromCart, executeQuantityUpdate]);

  /**
   * Clear entire cart.
   * Clears cartId in zustand persist → useCartSync returns empty.
   */
  const clearEntireCart = useCallback(() => {
    clearCart();
    toast.success('Cart cleared');
  }, [clearCart]);

  return {
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart: clearEntireCart,
    isLoading: createCartMutation.isPending || addLinesMutation.isPending ||
               updateLinesMutation.isPending || removeLinesMutation.isPending,
  };
}
