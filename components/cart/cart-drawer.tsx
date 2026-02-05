"use client";

import { useEffect } from "react";
import { X, ShoppingBag, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useCartSync } from "@/hooks/use-cart-sync";
import { useCartActions } from "@/hooks/use-cart-actions";
import { CartItem } from "./cart-item";
import { CartSummary } from "./cart-summary";
import { Button } from "@/components/ui/button";
import { EmptyCart } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface CartDrawerProps {
  className?: string;
}

/**
 * CartDrawer - Sliding cart panel
 *
 * Reads cart data from server via useCartSync (source of truth).
 * Mutations go through useCartActions (server-only).
 */
export function CartDrawer({ className }: CartDrawerProps) {
  // UI state from Zustand
  const { isOpen, closeCart } = useCartStore();

  // Server cart data (source of truth)
  const { items, totalQuantity, subtotal, total, totalDiscount, currency, isLoading } = useCartSync();

  // Actions that mutate via GraphQL
  const { updateQuantity, removeFromCart } = useCartActions();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCheckout = () => {
    closeCart();
    if (typeof window !== 'undefined') {
      window.location.href = "/checkout";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-xl",
          "flex flex-col",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              Shopping Cart
              {totalQuantity > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({totalQuantity})
                </span>
              )}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeCart}
            className="h-8 w-8 p-0"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyCart onContinueShopping={closeCart} />
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <CartItem
                    key={item.lineId}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-border p-4">
              <CartSummary
                subtotal={subtotal}
                total={total}
                totalDiscount={totalDiscount}
                currencyCode={currency}
                itemCount={totalQuantity}
                onCheckout={handleCheckout}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
