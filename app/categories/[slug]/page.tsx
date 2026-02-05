"use client";

import { useParams } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/lib/graphql/hooks";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Fetch products for this category using GraphQL query
  const { data, isLoading, error } = useProducts({
    first: 20,
    query: `category:${slug}`,
  });

  const products = data?.products ?? [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Category Not Found
          </h1>
          <p className="text-muted-foreground">
            The category you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse products in this category
        </p>
      </div>

      {/* Products Grid */}
      <ProductGrid
        products={products}
        columns={4}
        priorityCount={8}
        showBadges
        emptyMessage="No products in this category"
      />
    </div>
  );
}
