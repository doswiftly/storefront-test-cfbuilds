"use client";

import Link from "next/link";
import { Gift } from "lucide-react";
import { ProductImage } from "./product-image";
import { ProductPrice } from "./product-price";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ProductCardProduct {
  id: string;
  handle: string;
  title: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  } | null;
  availableForSale: boolean;
  tags?: string[];
  type?: string;
}

export interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
  priority?: boolean;
  showBadges?: boolean;
}

/**
 * ProductCard - Display product in grid/list
 * 
 * Client Component for interactive features (hover, click)
 * 
 * @example
 * ```tsx
 * <ProductCard 
 *   product={product} 
 *   priority={index < 4} // LCP optimization
 *   showBadges
 * />
 * ```
 */
export function ProductCard({
  product,
  className,
  priority = false,
  showBadges = true,
}: ProductCardProps) {
  const isOnSale = product.compareAtPriceRange &&
    parseFloat(product.compareAtPriceRange.minVariantPrice.amount) >
    parseFloat(product.priceRange.minVariantPrice.amount);

  const isNew = product.tags?.some(
    (tag) => tag.toLowerCase() === "new" || tag.toLowerCase() === "nowość"
  );

  const isOutOfStock = !product.availableForSale;
  const isGiftCard = product.type === "GIFT_CARD";

  return (
    <Link
      href={`/products/${product.handle}`}
      className={cn(
        "group block overflow-hidden rounded-lg border border-border bg-background transition-shadow hover:shadow-lg",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ProductImage
          image={product.featuredImage}
          alt={product.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges */}
        {showBadges && (
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {isGiftCard && (
              <Badge variant="default" className="shadow-sm">
                <Gift className="mr-1 h-3 w-3" />
                Karta podarunkowa
              </Badge>
            )}
            {isNew && !isGiftCard && (
              <Badge variant="default" className="shadow-sm">
                NEW
              </Badge>
            )}
            {isOnSale && (
              <Badge variant="destructive" className="shadow-sm">
                SALE
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary" className="shadow-sm">
                Out of Stock
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        <ProductPrice
          priceRange={product.priceRange}
          compareAtPrice={
            isOnSale ? product.compareAtPriceRange?.minVariantPrice : undefined
          }
          showFromPrefix
          showCompareAt
          size="sm"
        />

        {isOutOfStock && (
          <p className="mt-2 text-xs text-muted-foreground">
            Currently unavailable
          </p>
        )}
      </div>
    </Link>
  );
}
