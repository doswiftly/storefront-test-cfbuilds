"use client";

import { ProductCard, type ProductCardProduct } from "./product-card";
import { EmptyProducts } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

// Re-export for external use
export type { ProductCardProduct };

export interface ProductGridProps {
  products: ProductCardProduct[];
  className?: string;
  columns?: 2 | 3 | 4 | 5;
  gap?: "sm" | "md" | "lg";
  priorityCount?: number;
  showBadges?: boolean;
  emptyMessage?: string;
  onResetFilters?: () => void;
}

/**
 * ProductGrid - Display products in responsive grid
 * 
 * Client Component for interactive grid features
 * 
 * @example
 * ```tsx
 * <ProductGrid 
 *   products={products}
 *   columns={4}
 *   priorityCount={4} // First 4 images load with priority
 *   showBadges
 * />
 * ```
 */
export function ProductGrid({
  products,
  className,
  columns = 4,
  gap = "md",
  priorityCount = 4,
  showBadges = true,
  emptyMessage,
  onResetFilters,
}: ProductGridProps) {
  // Empty state
  if (products.length === 0) {
    return <EmptyProducts onReset={onResetFilters} />;
  }

  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  const gapClasses = {
    sm: "gap-3",
    md: "gap-4 md:gap-6",
    lg: "gap-6 md:gap-8",
  };

  return (
    <div
      className={cn(
        "grid",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
          showBadges={showBadges}
        />
      ))}
    </div>
  );
}
