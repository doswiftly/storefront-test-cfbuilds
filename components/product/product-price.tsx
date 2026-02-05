"use client";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { PriceMoney } from "@/lib/format";

export interface ProductPriceMoney {
  amount: string;
  currencyCode: string;
}

export interface ProductPriceRange {
  minVariantPrice: ProductPriceMoney;
  maxVariantPrice: ProductPriceMoney;
}

export interface ProductPriceProps {
  /** Single price (for selected variant) */
  price?: ProductPriceMoney;
  /** Price range (for product with multiple variants) */
  priceRange?: ProductPriceRange;
  /** Compare at price (original price before discount) */
  compareAtPrice?: ProductPriceMoney;
  /** Show "from" prefix for price ranges */
  showFromPrefix?: boolean;
  /** Show compare at price with strikethrough */
  showCompareAt?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Custom className */
  className?: string;
}

/**
 * ProductPrice - Display product price with currency formatting
 *
 * Uses centralized formatPrice from lib/format.ts for consistent
 * formatting with proper locale based on currency code.
 *
 * Uses suppressHydrationWarning to prevent hydration mismatches
 * when currency is changed client-side
 *
 * @example
 * ```tsx
 * // Single price
 * <ProductPrice price={variant.price} />
 *
 * // Price range
 * <ProductPrice
 *   priceRange={product.priceRange}
 *   showFromPrefix
 * />
 *
 * // With sale price
 * <ProductPrice
 *   price={variant.price}
 *   compareAtPrice={variant.compareAtPrice}
 *   showCompareAt
 * />
 * ```
 */
export function ProductPrice({
  price,
  priceRange,
  compareAtPrice,
  showFromPrefix = false,
  showCompareAt = true,
  size = "md",
  className,
}: ProductPriceProps) {
  // Use centralized formatPrice from lib/format.ts

  const displayPrice = price || priceRange?.minVariantPrice;
  
  if (!displayPrice) {
    return null;
  }

  const hasVariedRange =
    priceRange &&
    priceRange.minVariantPrice.amount !== priceRange.maxVariantPrice.amount;

  const isOnSale =
    compareAtPrice &&
    parseFloat(compareAtPrice.amount) > parseFloat(displayPrice.amount);

  const sizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-2xl",
  };

  const smallTextStyles = {
    sm: "text-xs",
    md: "text-xs",
    lg: "text-sm",
    xl: "text-base",
  };

  return (
    <div
      className={cn("flex flex-col gap-0.5", className)}
      suppressHydrationWarning
    >
      {/* Main price line */}
      <div className="flex items-baseline gap-2 flex-wrap">
        {/* Compare at price (strikethrough) */}
        {showCompareAt && isOnSale && compareAtPrice && (
          <span
            className={cn(
              "text-muted-foreground line-through",
              smallTextStyles[size]
            )}
            suppressHydrationWarning
          >
            {formatPrice(compareAtPrice)}
          </span>
        )}

        {/* Current price */}
        <span
          className={cn(
            "font-semibold",
            sizeStyles[size],
            isOnSale ? "text-destructive" : "text-foreground"
          )}
          suppressHydrationWarning
        >
          {showFromPrefix && hasVariedRange && (
            <span className="font-normal text-muted-foreground mr-1">
              from
            </span>
          )}
          {formatPrice(displayPrice)}
        </span>

        {/* Sale badge */}
        {isOnSale && (
          <span className="px-1.5 py-0.5 text-xs font-medium bg-destructive/10 text-destructive rounded">
            Sale
          </span>
        )}
      </div>

      {/* Price range (if varies) */}
      {hasVariedRange && priceRange && (
        <span
          className={cn("text-muted-foreground", smallTextStyles[size])}
          suppressHydrationWarning
        >
          {formatPrice(priceRange.minVariantPrice)} –{" "}
          {formatPrice(priceRange.maxVariantPrice)}
        </span>
      )}
    </div>
  );
}
