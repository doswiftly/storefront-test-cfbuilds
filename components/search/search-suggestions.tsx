"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  className?: string;
}

/**
 * SearchSuggestions - Dropdown with search suggestions
 */
export function SearchSuggestions({
  suggestions,
  onSelect,
  className,
}: SearchSuggestionsProps) {
  return (
    <div
      className={cn(
        "absolute top-full z-50 mt-2 w-full rounded-lg border border-border bg-background shadow-lg",
        className
      )}
    >
      <ul className="max-h-80 overflow-y-auto py-2">
        {suggestions.map((suggestion) => (
          <li key={`suggestion-${suggestion.toLowerCase().replace(/\s+/g, '-')}`}>
            <button
              type="button"
              onClick={() => onSelect(suggestion)}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-accent"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{suggestion}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
