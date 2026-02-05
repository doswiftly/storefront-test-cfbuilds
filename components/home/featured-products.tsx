"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/lib/graphql/hooks";

export function FeaturedProducts() {
  // Fetch featured products using GraphQL
  const { data, isLoading, error } = useProducts({
    first: 8,
    // TODO: Add featured filter when backend supports it
  });

  const products = data?.products ?? [];

  if (isLoading) {
    return (
      <section className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
            <p className="mt-2 text-muted-foreground">
              Handpicked favorites just for you
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-lg mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Handle error state explicitly
  if (error) {
    console.error('[FeaturedProducts] Failed to load products:', error);
    return null; // Gracefully hide section on error
  }

  // Hide section if no products
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
          <p className="mt-2 text-muted-foreground">
            Handpicked favorites just for you
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/products">View All</Link>
        </Button>
      </div>

      {products.length > 0 ? (
        <ProductGrid
          products={products}
          columns={4}
          priorityCount={4}
          showBadges
        />
      ) : (
        <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
          <p className="text-muted-foreground">
            No featured products available at the moment.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
