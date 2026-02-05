"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCollections } from "@/lib/graphql/hooks";

export interface CategoryGridProps {
  className?: string;
}

export function CategoryGrid({ className }: CategoryGridProps) {
  // Use collections for homepage marketing (not categories)
  // Collections are better for homepage because they're curated and flexible
  const { data, isLoading, error } = useCollections({
    first: 8,
  });

  const collections = data?.collections ?? [];

  if (isLoading) {
    return (
      <section className={cn("container mx-auto px-4", className)}>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">Shop by Category</h2>
          <p className="mt-2 text-muted-foreground">
            Find exactly what you're looking for
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border p-6">
              <div className="mb-3 h-10 w-10 bg-muted rounded mx-auto"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || collections.length === 0) {
    return null; // Don't show section if no collections
  }

  return (
    <section className={cn("container mx-auto px-4", className)}>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground">Shop by Category</h2>
        <p className="mt-2 text-muted-foreground">
          Find exactly what you're looking for
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {collections.map((collection: any) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="group flex flex-col items-center justify-center rounded-lg border border-border bg-background p-6 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="mb-3 text-4xl transition-transform group-hover:scale-110">
              🛍️
            </div>
            <span className="text-center font-medium text-foreground group-hover:text-primary">
              {collection.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
