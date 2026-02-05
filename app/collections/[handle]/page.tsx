"use client";

import { useParams } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection } from "@/lib/graphql/hooks";

export default function CollectionPage() {
  const params = useParams();
  const handle = params.handle as string;

  // Fetch collection using GraphQL
  const { data, isLoading, error } = useCollection(handle);

  const collection = data?.collection;
  const products = collection?.products?.edges?.map((edge: any) => edge.node) ?? [];

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

  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Collection Not Found
          </h1>
          <p className="text-muted-foreground">
            The collection you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />

      {/* Collection Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{collection.title}</h1>
        {collection.description && (
          <p className="mt-2 text-muted-foreground">{collection.description}</p>
        )}
      </div>

      {/* Products Grid */}
      <ProductGrid
        products={products}
        columns={4}
        priorityCount={8}
        showBadges
        emptyMessage="No products in this collection"
      />
    </div>
  );
}
