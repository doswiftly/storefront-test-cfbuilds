"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Globe } from "lucide-react";
import { useCurrencyStore } from "@/stores/currency-store";
import { useQueryClient } from "@tanstack/react-query";

// ============================================================================
// CURRENCY DATA
// ============================================================================

const CURRENCY_SYMBOLS: Record<string, string> = {
  PLN: "zł",
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
  CZK: "Kč",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  JPY: "¥",
  CNY: "¥",
  AUD: "A$",
  CAD: "C$",
};

const CURRENCY_NAMES: Record<string, string> = {
  PLN: "Polski złoty",
  EUR: "Euro",
  USD: "US Dollar",
  GBP: "British Pound",
  CHF: "Swiss Franc",
  CZK: "Czech Koruna",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  JPY: "Japanese Yen",
  CNY: "Chinese Yuan",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
};

// ============================================================================
// TYPES
// ============================================================================

interface CurrencySelectorProps {
  className?: string;
  variant?: "default" | "compact";
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CurrencySelector - Dropdown for selecting preferred currency
 *
 * Features:
 * - Shows current currency with symbol
 * - Lists all supported currencies from Shop
 * - Persists selection to HTTP cookie (SSR-safe)
 * - Invalidates React Query cache on change (refetches prices)
 * - Handles hydration properly (no flash)
 * - Works seamlessly with Server-Side Rendering
 *
 * Technical Details:
 * - Currency stored in cookie (not localStorage)
 * - Cookie accessible by both client and server
 * - GraphQL requests automatically include X-Preferred-Currency header
 * - Cache invalidation ensures immediate price updates
 *
 * @example
 * ```tsx
 * <CurrencySelector />
 * <CurrencySelector variant="compact" />
 * ```
 */
export function CurrencySelector({
  className = "",
  variant = "default",
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get currency state from store
  const currency = useCurrencyStore((state) => state.currency);
  const supportedCurrencies = useCurrencyStore((state) => state.supportedCurrencies);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const isHydrated = useCurrencyStore((state) => state.isHydrated);

  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    // Update Zustand store (which automatically writes to cookie)
    setCurrency(newCurrency);
    
    // Close dropdown
    setIsOpen(false);
    
    // Invalidate all React Query cache to refetch with new currency
    // This ensures prices are immediately updated across the app
    queryClient.invalidateQueries();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Don't render until hydrated (prevents flash)
  if (!isHydrated) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const currentSymbol = currency ? (CURRENCY_SYMBOLS[currency] || currency) : "USD";
  const currentName = currency ? (CURRENCY_NAMES[currency] || currency) : "US Dollar";

  if (variant === "compact") {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-muted"
          aria-label="Select currency"
        >
          <span className="font-medium">{currentSymbol}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-border bg-background shadow-lg">
            <div className="max-h-64 overflow-y-auto p-1">
              {supportedCurrencies.map((code) => (
                <button
                  key={code}
                  onClick={() => handleCurrencyChange(code)}
                  className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium">
                      {CURRENCY_SYMBOLS[code] || code}
                    </span>
                    <span className="text-muted-foreground">{code}</span>
                  </span>
                  {currency === code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
        aria-label="Select currency"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{currentSymbol}</span>
        <span className="text-muted-foreground">{currency}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-border bg-background shadow-lg">
          <div className="border-b border-border p-3">
            <p className="text-sm font-medium text-foreground">
              Select Currency
            </p>
            <p className="text-xs text-muted-foreground">
              Prices will be displayed in your selected currency
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {supportedCurrencies.map((code) => (
              <button
                key={code}
                onClick={() => handleCurrencyChange(code)}
                className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-muted"
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium">
                    {CURRENCY_SYMBOLS[code] || code}
                  </span>
                  <span className="text-muted-foreground">
                    {CURRENCY_NAMES[code] || code}
                  </span>
                </span>
                {currency === code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
