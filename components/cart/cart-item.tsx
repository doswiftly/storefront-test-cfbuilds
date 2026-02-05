"use client";

import { X, Gift } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { ProductQuantitySelector } from "@/components/product/product-quantity-selector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice, formatAmount } from "@/lib/format";
import type { CartItemData } from "@/hooks/use-cart-sync";

export interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
  className?: string;
}

/**
 * CartItem - Single item in cart
 */
export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  className,
}: CartItemProps) {
  const itemTotal = parseFloat(item.price.amount) * item.quantity;

  return (
    <div className={cn("flex gap-4 py-4", className)}>
      {/* Image */}
      <Link
        href={`/products/${item.productHandle || item.productId}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        <ProductImage
          image={item.image}
          alt={item.productTitle}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div className="flex-1">
            <Link
              href={`/products/${item.productHandle || item.productId}`}
              className="text-sm font-medium text-foreground hover:text-primary"
            >
              {item.productTitle}
            </Link>
            {item.productType === "GIFT_CARD" && (
              <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                <Gift className="h-3 w-3" />
                Karta podarunkowa
              </p>
            )}
            {item.variantTitle && (
              <p className="mt-1 text-xs text-muted-foreground">
                {item.variantTitle}
              </p>
            )}
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.lineId)}
            className="h-8 w-8 p-0"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quantity and price */}
        <div className="mt-2 flex items-center justify-between">
          <ProductQuantitySelector
            value={item.quantity}
            onChange={(qty) => onUpdateQuantity(item.lineId, qty)}
            min={1}
            max={99}
            disabled={!item.available}
          />

          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">
              {formatAmount(itemTotal, item.price.currencyCode)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(item.price)} each
              </p>
            )}
          </div>
        </div>

        {/* Out of stock warning */}
        {!item.available && (
          <p className="mt-2 text-xs text-destructive">
            This item is currently out of stock
          </p>
        )}
      </div>
    </div>
  );
}
