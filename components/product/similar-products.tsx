"use client";

import { ProductCard, type ProductCardProduct } from "./product-card";
import { cn } from "@/lib/utils";

export interface SimilarProductsProps {
  products: ProductCardProduct[];
  title?: string;
  className?: string;
  columns?: 2 | 3 | 4;
}

/**
 * SimilarProducts - Display similar products based on tags/category
 * 
 * @example
 * ```tsx
 * <SimilarProducts 
 *   products={similarProducts}
 *   title="You might also like"
 *   columns={4}
 * />
 * ```
 */
export function SimilarProducts({
  products,
  title = "Similar Products",
  className,
  columns = 4,
}: SimilarProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <section className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      
      <div className={cn("grid gap-4 md:gap-6", columnClasses[columns])}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={false}
            showBadges
          />
        ))}
      </div>
    </section>
  );
}
