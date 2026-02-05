"use client";

import { TrendingDown, DollarSign, Percent } from "lucide-react";
import { useCurrencyStore } from "@/stores/currency-store";
import { formatAmount } from "@/lib/format";

export interface SavingsDisplayProps {
  originalPrice: number;
  salePrice: number;
  currency?: string;
  showPercentage?: boolean;
  showAmount?: boolean;
  variant?: "inline" | "badge" | "card";
  className?: string;
}

/**
 * SavingsDisplay - Show amount saved on discounted products
 */
export function SavingsDisplay({
  originalPrice,
  salePrice,
  currency,
  showPercentage = true,
  showAmount = true,
  variant = "inline",
  className = "",
}: SavingsDisplayProps) {
  const preferredCurrency = useCurrencyStore((state) => state.currency);
  const finalCurrency = currency || preferredCurrency || "PLN";

  if (salePrice >= originalPrice) return null;

  const savingsAmount = originalPrice - salePrice;
  const savingsPercentage = Math.round(
    (savingsAmount / originalPrice) * 100
  );

  // Use centralized formatAmount with proper locale based on currency
  const formatPrice = (amount: number) => formatAmount(amount, finalCurrency);

  if (variant === "inline") {
    return (
      <div
        className={`inline-flex items-center gap-2 text-sm text-green-600 ${className}`}
        suppressHydrationWarning
      >
        <TrendingDown className="h-4 w-4" />
        <span className="font-medium">
          You save{" "}
          {showAmount && <span className="font-bold">{formatPrice(savingsAmount)}</span>}
          {showAmount && showPercentage && " "}
          {showPercentage && <span className="font-bold">({savingsPercentage}%)</span>}
        </span>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-semibold text-green-700 dark:text-green-400 ${className}`}
        suppressHydrationWarning
      >
        <TrendingDown className="h-3.5 w-3.5" />
        <span>
          Save{" "}
          {showAmount && formatPrice(savingsAmount)}
          {showAmount && showPercentage && " "}
          {showPercentage && `(${savingsPercentage}%)`}
        </span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 p-4 ${className}`}
        suppressHydrationWarning
      >
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-600 p-2">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              You're Saving
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              {showAmount && (
                <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {formatPrice(savingsAmount)}
                </span>
              )}
              {showPercentage && (
                <span className="text-lg font-semibold text-green-600 dark:text-green-500">
                  ({savingsPercentage}% off)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export interface TotalSavingsProps {
  items: Array<{
    originalPrice: number;
    salePrice: number;
    quantity: number;
  }>;
  currency?: string;
  className?: string;
}

/**
 * TotalSavings - Display total savings across multiple items (for cart)
 */
export function TotalSavings({
  items,
  currency,
  className = "",
}: TotalSavingsProps) {
  const preferredCurrency = useCurrencyStore((state) => state.currency);
  const finalCurrency = currency || preferredCurrency || "PLN";

  const totalSavings = items.reduce((sum, item) => {
    const itemSavings = (item.originalPrice - item.salePrice) * item.quantity;
    return sum + (itemSavings > 0 ? itemSavings : 0);
  }, 0);

  if (totalSavings <= 0) return null;

  return (
    <div
      className={`flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-900/20 px-4 py-3 ${className}`}
      suppressHydrationWarning
    >
      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
        <DollarSign className="h-5 w-5" />
        <span className="font-medium">Total Savings</span>
      </div>
      <span className="text-lg font-bold text-green-700 dark:text-green-400">
        {formatAmount(totalSavings, finalCurrency)}
      </span>
    </div>
  );
}

export interface SavingsBreakdownProps {
  originalPrice: number;
  salePrice: number;
  currency?: string;
  className?: string;
}

/**
 * SavingsBreakdown - Detailed breakdown of price and savings
 */
export function SavingsBreakdown({
  originalPrice,
  salePrice,
  currency,
  className = "",
}: SavingsBreakdownProps) {
  const preferredCurrency = useCurrencyStore((state) => state.currency);
  const finalCurrency = currency || preferredCurrency || "PLN";

  if (salePrice >= originalPrice) return null;

  const savingsAmount = originalPrice - salePrice;
  const savingsPercentage = Math.round(
    (savingsAmount / originalPrice) * 100
  );

  return (
    <div
      className={`space-y-2 rounded-lg border border-border bg-muted/50 p-4 ${className}`}
      suppressHydrationWarning
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Original Price</span>
        <span className="font-medium text-foreground line-through">
          {formatAmount(originalPrice, finalCurrency)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-green-600">
          <Percent className="h-3.5 w-3.5" />
          Discount ({savingsPercentage}%)
        </span>
        <span className="font-medium text-green-600">
          -{formatAmount(savingsAmount, finalCurrency)}
        </span>
      </div>

      <div className="border-t border-border pt-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Sale Price</span>
          <span className="text-xl font-bold text-foreground">
            {formatAmount(salePrice, finalCurrency)}
          </span>
        </div>
      </div>
    </div>
  );
}
