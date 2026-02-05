"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

export interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
  className?: string;
}

/**
 * CategoryCard - Display card for product category
 */
export function CategoryCard({
  id,
  name,
  slug,
  description,
  imageUrl,
  productCount,
  className = "",
}: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`} className={`block ${className}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        {/* Category Image */}
        {imageUrl && (
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Category Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>

          {description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {productCount !== undefined && (
            <p className="mt-2 text-xs text-muted-foreground">
              {productCount} {productCount === 1 ? "product" : "products"}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

export interface CategoryCardGridProps {
  categories: CategoryCardProps[];
  className?: string;
}

/**
 * CategoryCardGrid - Grid layout for category cards
 */
export function CategoryCardGrid({
  categories,
  className = "",
}: CategoryCardGridProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
        <p className="text-muted-foreground">No categories available</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {categories.map((category) => (
        <CategoryCard key={category.id} {...category} />
      ))}
    </div>
  );
}
