"use client";

import { BrandCard, type BrandCardProps } from "./brand-card";

export interface BrandGridProps {
  brands: BrandCardProps[];
  className?: string;
}

/**
 * BrandGrid - Grid layout for brand cards
 */
export function BrandGrid({ brands, className = "" }: BrandGridProps) {
  if (brands.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
        <p className="text-muted-foreground">No brands available</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ${className}`}
    >
      {brands.map((brand) => (
        <BrandCard key={brand.id} {...brand} />
      ))}
    </div>
  );
}

export interface FeaturedBrandsProps {
  brands: BrandCardProps[];
  title?: string;
  description?: string;
  className?: string;
}

/**
 * FeaturedBrands - Section for displaying featured brands
 */
export function FeaturedBrands({
  brands,
  title = "Featured Brands",
  description,
  className = "",
}: FeaturedBrandsProps) {
  if (brands.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>
      <BrandGrid brands={brands} />
    </section>
  );
}
