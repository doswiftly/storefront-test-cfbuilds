"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/graphql/hooks";
import { useCartStore } from "@/stores/cart-store";

/**
 * Mapped cart item for display components.
 * Server is the single source of truth — no client-side items[].
 */
export interface CartItemData {
  lineId: string;
  variantId: string;
  productId: string;
  productHandle?: string;
  productTitle: string;
  variantTitle: string;
  productType?: string;
  quantity: number;
  price: { amount: string; currencyCode: string };
  image?: { url: string; altText?: string | null } | null;
  available: boolean;
}

/**
 * Primary data source for cart display.
 *
 * Reads cart from GraphQL (server as source of truth).
 * Maps GraphQL lines to display-friendly CartItemData.
 * Detects and auto-clears stale cart IDs.
 */
export function useCartSync() {
  const cartId = useCartStore((state) => state.cartId);
  const isHydrated = useCartStore((state) => state.isHydrated);
  const setCartId = useCartStore((state) => state.setCartId);

  const { data, isLoading, error, refetch } = useCart(cartId, {
    enabled: isHydrated && Boolean(cartId),
    retry: false,
  });

  const cart = data?.cart;

  // Detect stale cart: cartId exists but server returns nothing
  const isStaleCart = isHydrated && Boolean(cartId) && !isLoading && !cart;

  // Auto-clear stale cartId
  useEffect(() => {
    if (isStaleCart) {
      setCartId(null);
    }
  }, [isStaleCart, setCartId]);

  // Map GraphQL lines to display-friendly items
  const items: CartItemData[] = (cart?.lines ?? []).map((line: any) => {
    const merchandiseTitle = line.merchandise.title ?? "";
    // Hide generic variant names like "Default" or "Default Title"
    const isDefaultVariant = /^default(\s+title)?$/i.test(merchandiseTitle);
    const productTitle = line.productTitle || merchandiseTitle;
    const variantTitle = isDefaultVariant ? "" : merchandiseTitle;

    return {
      lineId: line.id,
      variantId: line.merchandise.id,
      productId: line.productId || line.merchandise.id,
      productHandle: line.productHandle,
      productTitle,
      variantTitle,
      productType: line.productType,
      quantity: line.quantity,
      price: {
        amount: line.merchandise.price.amount,
        currencyCode: line.merchandise.price.currencyCode,
      },
      image: line.merchandise.image || null,
      available: line.merchandise.available,
    };
  });

  const totalQuantity = cart?.totalQuantity ?? 0;
  const subtotal = cart?.cost?.subtotalAmount
    ? parseFloat(cart.cost.subtotalAmount.amount)
    : 0;
  const total = cart?.cost?.totalAmount
    ? parseFloat(cart.cost.totalAmount.amount)
    : subtotal;
  const currency = cart?.cost?.subtotalAmount?.currencyCode ?? "PLN";

  // Discount data from server
  const discountCodes: string[] = (cart?.discountCodes ?? [])
    .filter((dc: any) => dc.applicable)
    .map((dc: any) => dc.code);
  const totalDiscount = subtotal - total;

  return {
    cart,
    cartId,
    items,
    totalQuantity,
    subtotal,
    total,
    currency,
    discountCodes,
    totalDiscount,
    isLoading: !isHydrated || isLoading,
    isStaleCart,
    error,
    refetch,
  };
}
