"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/format";

export interface CartSummaryProps {
  subtotal: number;
  total?: number;
  totalDiscount?: number;
  currencyCode: string;
  itemCount: number;
  onCheckout?: () => void;
  className?: string;
}

/**
 * CartSummary - Cart totals and checkout button
 */
export function CartSummary({
  subtotal,
  total,
  totalDiscount,
  currencyCode,
  itemCount,
  onCheckout,
  className,
}: CartSummaryProps) {
  const displayTotal = total ?? subtotal;
  const hasDiscount = (totalDiscount ?? 0) > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Subtotal */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-base font-medium text-foreground">Subtotal</span>
        <span className={cn("text-lg font-semibold text-foreground", hasDiscount && "text-muted-foreground line-through text-base")}>
          {formatAmount(subtotal, currencyCode)}
        </span>
      </div>

      {/* Discount */}
      {hasDiscount && (
        <>
          <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span>-{formatAmount(totalDiscount!, currencyCode)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-foreground">Total</span>
            <span className="text-lg font-semibold text-foreground">
              {formatAmount(displayTotal, currencyCode)}
            </span>
          </div>
        </>
      )}

      {/* Item count */}
      <p className="text-sm text-muted-foreground">
        {itemCount} {itemCount === 1 ? "item" : "items"} in cart
      </p>

      {/* Shipping note */}
      <p className="text-xs text-muted-foreground">
        Shipping and taxes calculated at checkout
      </p>

      {/* Checkout button */}
      <Button
        onClick={onCheckout}
        size="lg"
        className="w-full"
        disabled={itemCount === 0}
      >
        Proceed to Checkout
      </Button>

      {/* Continue shopping */}
      <Button variant="outline" size="lg" className="w-full" asChild>
        <a href="/products">Continue Shopping</a>
      </Button>
    </div>
  );
}
