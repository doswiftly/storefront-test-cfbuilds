"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SearchSuggestions } from "./search-suggestions";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

/**
 * SearchBar - Search input with autocomplete
 */
export function SearchBar({
  defaultValue = "",
  placeholder = "Search products...",
  className,
  showSuggestions = true,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  // Fetch suggestions when query changes (debounced)
  useEffect(() => {
    // Clear previous debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (query.length >= 2 && showSuggestions) {
      // Debounce suggestions fetch
      debounceTimeoutRef.current = setTimeout(() => {
        // TODO: Replace placeholder with real API call
        // Example implementation with proper error handling:
        //
        // const controller = new AbortController();
        // fetchSuggestions(query, { signal: controller.signal })
        //   .then((results) => setSuggestions(results))
        //   .catch((error) => {
        //     if (error.name !== 'AbortError') {
        //       console.error('Failed to fetch suggestions:', error);
        //       setSuggestions([]);
        //     }
        //   });
        // return () => controller.abort();

        // Placeholder suggestions (remove when implementing API)
        setSuggestions([
          `${query} laptop`,
          `${query} phone`,
          `${query} accessories`,
        ]);
      }, 300);
    } else {
      setSuggestions([]);
    }
  }, [query, showSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              // Delay to allow clicking suggestions
              if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
              blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
            }}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <SearchSuggestions
          suggestions={suggestions}
          onSelect={handleSuggestionClick}
        />
      )}
    </div>
  );
}
