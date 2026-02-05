"use client";

import { useCurrencyStore } from "@/stores/currency-store";

export interface PriceDisplayProps {
  amount: string | number;
  currency?: string;
  className?: string;
  showCurrency?: boolean;
  locale?: string;
}

/**
 * PriceDisplay - Formatted price with currency
 * Automatically uses the user's preferred currency from the currency store
 */
export function PriceDisplay({
  amount,
  currency,
  className = "",
  showCurrency = true,
  locale = "pl-PL",
}: PriceDisplayProps) {
  const preferredCurrency = useCurrencyStore((state) => state.currency);
  const finalCurrency = currency || preferredCurrency || "PLN";

  const formatPrice = (value: string | number, curr: string) => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return "—";
    }

    if (showCurrency) {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: curr,
      }).format(numericValue);
    }

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  return (
    <span className={className} suppressHydrationWarning>
      {formatPrice(amount, finalCurrency)}
    </span>
  );
}

export interface PriceRangeDisplayProps {
  minAmount: string | number;
  maxAmount: string | number;
  currency?: string;
  className?: string;
  locale?: string;
}

/**
 * PriceRangeDisplay - Display a price range (e.g., "$10 - $20")
 */
export function PriceRangeDisplay({
  minAmount,
  maxAmount,
  currency,
  className = "",
  locale = "pl-PL",
}: PriceRangeDisplayProps) {
  const preferredCurrency = useCurrencyStore((state) => state.currency);
  const finalCurrency = currency || preferredCurrency || "PLN";

  const formatPrice = (value: string | number) => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return "—";
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: finalCurrency,
    }).format(numericValue);
  };

  const min = typeof minAmount === "string" ? parseFloat(minAmount) : minAmount;
  const max = typeof maxAmount === "string" ? parseFloat(maxAmount) : maxAmount;

  // If min and max are the same, just show one price
  if (min === max) {
    return (
      <span className={className} suppressHydrationWarning>
        {formatPrice(min)}
      </span>
    );
  }

  return (
    <span className={className} suppressHydrationWarning>
      {formatPrice(min)} - {formatPrice(max)}
    </span>
  );
}

export interface ComparePriceDisplayProps {
  originalPrice: string | number;
  salePrice: string | number;
  currency?: string;
  className?: string;
  locale?: string;
}

/**
 * ComparePriceDisplay - Display original and sale price with strikethrough
 */
export function ComparePriceDisplay({
  originalPrice,
  salePrice,
  currency,
  className = "",
  locale = "pl-PL",
}: ComparePriceDisplayProps) {
  const preferredCurrency = useCurrencyStore((state) => state.currency);
  const finalCurrency = currency || preferredCurrency || "PLN";

  const formatPrice = (value: string | number) => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return "—";
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: finalCurrency,
    }).format(numericValue);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} suppressHydrationWarning>
      <span className="text-lg font-semibold text-foreground">
        {formatPrice(salePrice)}
      </span>
      <span className="text-sm text-muted-foreground line-through">
        {formatPrice(originalPrice)}
      </span>
    </div>
  );
}
