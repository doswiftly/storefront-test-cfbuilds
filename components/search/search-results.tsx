"use client";

import { ProductGrid, type ProductCardProduct } from "@/components/product/product-grid";
import { EmptyProducts } from "@/components/ui/empty-state";

export interface SearchResultsProps {
  query: string;
  results: ProductCardProduct[];
}

/**
 * SearchResults - Display search results
 */
export function SearchResults({ query, results }: SearchResultsProps) {
  if (!query) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
        <p className="text-muted-foreground">
          Enter a search term to find products
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyProducts />
        
        {/* Search tips */}
        <div className="rounded-lg border border-border bg-muted/50 p-6">
          <h3 className="mb-3 font-semibold text-foreground">Search Tips:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Check your spelling</li>
            <li>• Try more general keywords</li>
            <li>• Try different keywords</li>
            <li>• Browse our categories instead</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Found {results.length} {results.length === 1 ? "result" : "results"} for "{query}"
      </p>
      
      <ProductGrid
        products={results}
        columns={4}
        priorityCount={4}
        showBadges
      />
    </div>
  );
}
