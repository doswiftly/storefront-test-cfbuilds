"use client";

import { cn } from "@/lib/utils";
import { Receipt } from "lucide-react";

/**
 * Types matching GraphQL schema
 */
export interface Money {
  amount: string;
  currencyCode: string;
}

export interface TaxLine {
  title: string;
  rate: number;
  price: Money;
}

export interface TaxBreakdownProps {
  taxLines: TaxLine[];
  totalTax: Money;
  className?: string;
  /** Whether to show the header */
  showHeader?: boolean;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

/**
 * TaxBreakdown - Display tax line items with rates and amounts
 *
 * Features:
 * - Shows each tax line with name, rate, and amount
 * - Shows total tax
 * - Supports compact mode for checkout summary
 *
 * Requirements: R36.1, R36.2, R36.3
 */
export function TaxBreakdown({
  taxLines,
  totalTax,
  className,
  showHeader = true,
  compact = false,
}: TaxBreakdownProps) {
  const formatPrice = (money: Money) => {
    const amount = parseFloat(money.amount);
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: money.currencyCode,
    }).format(amount);
  };

  const formatRate = (rate: number) => {
    return `${(rate * 100).toFixed(0)}%`;
  };

  // No tax lines to show
  if (taxLines.length === 0) {
    return null;
  }

  // Compact mode - just show total
  if (compact) {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <span className="text-sm text-muted-foreground">Tax</span>
        <span className="text-sm font-medium text-foreground">
          {formatPrice(totalTax)}
        </span>
      </div>
    );
  }

  // Full breakdown
  return (
    <div className={cn("space-y-2", className)}>
      {showHeader && (
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground">Tax Breakdown</h4>
        </div>
      )}

      <div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
        {taxLines.map((taxLine, index) => (
          <div
            key={`${taxLine.title}-${index}`}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">
              {taxLine.title}
              <span className="ml-1 text-xs">({formatRate(taxLine.rate)})</span>
            </span>
            <span className="font-medium text-foreground">
              {formatPrice(taxLine.price)}
            </span>
          </div>
        ))}

        {/* Total if multiple tax lines */}
        {taxLines.length > 1 && (
          <>
            <div className="border-t border-border my-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Total Tax</span>
              <span className="font-semibold text-foreground">
                {formatPrice(totalTax)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Tax exemption note (for B2B) */}
      {parseFloat(totalTax.amount) === 0 && taxLines.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Tax exempt order
        </p>
      )}
    </div>
  );
}

/**
 * TaxSummaryLine - Simple tax line for order summary
 */
export function TaxSummaryLine({
  totalTax,
  label = "Tax",
  className,
}: {
  totalTax: Money;
  label?: string;
  className?: string;
}) {
  const formatPrice = (money: Money) => {
    const amount = parseFloat(money.amount);
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: money.currencyCode,
    }).format(amount);
  };

  return (
    <div className={cn("flex items-center justify-between text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{formatPrice(totalTax)}</span>
    </div>
  );
}

export default TaxBreakdown;
