"use client";

import { useSearchParams } from "next/navigation";
import { SearchResults } from "@/components/search/search-results";
import { SearchBar } from "@/components/search/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/lib/graphql/hooks";

export function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Fetch search results using GraphQL
  const { data, isLoading, error } = useProducts({
    first: 20,
    query: query || undefined,
  });

  const results = data?.products ?? [];

  return (
    <>
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-foreground">
          {query ? `Search results for "${query}"` : "Search Products"}
        </h1>
        
        {/* Search Bar */}
        <div className="mx-auto max-w-2xl">
          <SearchBar defaultValue={query} />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : (
        <SearchResults query={query} results={results} />
      )}
    </>
  );
}
