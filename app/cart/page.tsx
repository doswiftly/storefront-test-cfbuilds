"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { useCartSync } from "@/hooks/use-cart-sync";
import { useCartActions } from "@/hooks/use-cart-actions";
import { useCartDiscountCodesUpdate } from "@/lib/graphql/hooks";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { PromoCodeInput } from "@/components/cart/promo-code-input";
import { EmptyCart } from "@/components/ui/empty-state";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CartPage() {
  // Server cart data (source of truth)
  const {
    items,
    totalQuantity,
    subtotal,
    total,
    currency,
    discountCodes,
    totalDiscount,
    isLoading,
  } = useCartSync();

  // Actions that mutate via GraphQL
  const { updateQuantity, removeFromCart } = useCartActions();

  // Discount mutation (with React Query cache invalidation)
  const discountMutation = useCartDiscountCodesUpdate();

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    window.location.href = "/checkout";
  };

  const handleApplyPromo = async (code: string) => {
    try {
      const cartId = useCartStore.getState().cartId;
      if (!cartId) {
        return { success: false, message: "Your cart is empty" };
      }

      const result = await discountMutation.mutateAsync({
        cartId,
        discountCodes: [...discountCodes, code],
      });

      const payload = result.cartDiscountCodesUpdate;

      if (payload?.userErrors?.length > 0) {
        return {
          success: false,
          message: payload.userErrors[0].message,
        };
      }

      if (!payload?.cart) {
        return {
          success: false,
          message: "Failed to apply promo code",
        };
      }

      return { success: true, message: "Promo code applied!" };
    } catch (error) {
      return {
        success: false,
        message: "Failed to apply promo code",
      };
    }
  };

  const handleRemovePromo = async () => {
    try {
      const cartId = useCartStore.getState().cartId;
      if (!cartId) return;

      await discountMutation.mutateAsync({
        cartId,
        discountCodes: [],
      });
    } catch (error) {
      // Silently handle — cart query will refetch and show correct state
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyCart onContinueShopping={() => (window.location.href = "/products")} />
      </div>
    );
  }

  const appliedCode = discountCodes.length > 0 ? discountCodes[0] : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
        <Button variant="ghost" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-border rounded-lg border border-border">
            {items.map((item) => (
              <div key={item.lineId} className="p-4">
                <CartItem
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4 rounded-lg border border-border bg-muted/50 p-6">
            <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

            <PromoCodeInput
              onApply={handleApplyPromo}
              appliedCode={appliedCode}
              onRemove={handleRemovePromo}
            />

            <CartSummary
              subtotal={subtotal}
              total={total}
              totalDiscount={totalDiscount}
              currencyCode={currency}
              itemCount={totalQuantity}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
