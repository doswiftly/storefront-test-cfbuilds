"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCollections } from "@/lib/graphql/hooks";

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description?: string;
  image?: {
    url: string;
    altText?: string | null;
  } | null;
}

export function FeaturedCollections() {
  // Fetch collections using GraphQL
  const { data, isLoading, error } = useCollections({
    first: 3,
  });

  const collections = data?.collections ?? [];

  if (isLoading) {
    return (
      <section className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">Featured Collections</h2>
          <p className="mt-2 text-muted-foreground">
            Explore our curated collections
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-muted rounded-lg mb-4"></div>
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
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
    <section className="container mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground">Featured Collections</h2>
        <p className="mt-2 text-muted-foreground">
          Explore our curated collections
        </p>
      </div>

      {collections.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection: Collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group"
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  {collection.image?.url ? (
                    <img
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <span className="text-4xl">🛍️</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {collection.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
          <p className="text-muted-foreground">
            No collections available at the moment.
          </p>
        </div>
      )}
    </section>
  );
}
