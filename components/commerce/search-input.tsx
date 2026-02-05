"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { useGraphQLQuery } from "@/lib/graphql/hooks";
import { ProductSearchDocument } from "@/generated/graphql";
import { useDebouncedValue } from "@/lib/hooks";
import Link from "next/link";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

/**
 * SearchInput - Product search with autocomplete
 *
 * Shows instant search results as user types.
 * Pressing Enter navigates to full search page.
 */
export function SearchInput({
  placeholder = "Search products...",
  className = "",
}: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  const debouncedQuery = useDebouncedValue(query, 300);

  // Fetch search results using GraphQL Codegen
  const { data, isLoading } = useGraphQLQuery(
    ProductSearchDocument,
    { query: debouncedQuery, first: 5 },
    { enabled: debouncedQuery.length >= 2 }
  );

  const products = data?.products?.edges?.map((edge) => edge.node) ?? [];
  const hasResults = products.length > 0;

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {isOpen && debouncedQuery.length >= 2 && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-md border border-border bg-background shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          ) : hasResults ? (
            <div className="max-h-96 overflow-y-auto">
              {products.slice(0, 5).map((product: any) => (
                <Link
                  key={product.id}
                  href={`/products/${product.handle}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 border-b border-border p-3 last:border-0 hover:bg-muted"
                >
                  {product.featuredImage && (
                    <img
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {product.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.priceRange.minVariantPrice.amount}{" "}
                      {product.priceRange.minVariantPrice.currencyCode}
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="block border-t border-border p-3 text-center text-sm text-primary hover:bg-muted"
              >
                View all results for "{query}"
              </Link>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No products found for "{debouncedQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
