"use client";

import { cn } from "@/lib/utils";
import { Tag, LogIn, TrendingDown } from "lucide-react";
import Link from "next/link";

/**
 * Types matching GraphQL schema
 */
export interface Money {
  amount: string;
  currencyCode: string;
}

export interface CustomerGroup {
  id: string;
  name: string;
  code: string;
  discountPercent: number;
}

export interface B2BVariantPricing {
  retailPrice: Money;
  yourPrice: Money;
  savings: Money;
  savingsPercent: number;
  hasGroupDiscount: boolean;
  appliedGroup?: CustomerGroup;
  tierName?: string;
}

export interface B2BPriceDisplay {
  pricing: B2BVariantPricing;
  isAuthenticated: boolean;
  guestMessage?: string;
}

export interface B2BPriceDisplayProps {
  priceData: B2BPriceDisplay;
  showRetailPrice?: boolean;
  showSavings?: boolean;
  loginUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * B2BPriceDisplay - Display B2B pricing with group discounts
 *
 * Features:
 * - Shows retail vs your price comparison
 * - Displays savings amount and percentage
 * - Shows applied customer group
 * - Login prompt for guests
 *
 * Requirements: R37.2, R37.5
 */
export function B2BPriceDisplayComponent({
  priceData,
  showRetailPrice = true,
  showSavings = true,
  loginUrl = "/auth/login",
  className,
  size = "md",
}: B2BPriceDisplayProps) {
  const { pricing, isAuthenticated, guestMessage } = priceData;

  const formatPrice = (money: Money) => {
    const amount = parseFloat(money.amount);
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: money.currencyCode,
    }).format(amount);
  };

  const textSizes = {
    sm: {
      price: "text-lg",
      retail: "text-sm",
      savings: "text-xs",
      badge: "text-xs px-1.5 py-0.5",
    },
    md: {
      price: "text-2xl",
      retail: "text-base",
      savings: "text-sm",
      badge: "text-xs px-2 py-1",
    },
    lg: {
      price: "text-3xl",
      retail: "text-lg",
      savings: "text-sm",
      badge: "text-sm px-2 py-1",
    },
  };

  const sizes = textSizes[size];

  // Guest view - show retail price with login prompt
  if (!isAuthenticated) {
    return (
      <div className={cn("space-y-2", className)}>
        {/* Retail price */}
        <div>
          <p className={cn("font-bold text-foreground", sizes.price)}>
            {formatPrice(pricing.retailPrice)}
          </p>
        </div>

        {/* Login prompt */}
        {guestMessage && (
          <Link
            href={loginUrl}
            className={cn(
              "inline-flex items-center gap-1.5 text-primary hover:underline",
              sizes.savings
            )}
          >
            <LogIn className="h-3.5 w-3.5" />
            {guestMessage}
          </Link>
        )}
      </div>
    );
  }

  // Authenticated view with group discount
  if (pricing.hasGroupDiscount) {
    return (
      <div className={cn("space-y-2", className)}>
        {/* Your price */}
        <div className="flex items-baseline gap-2">
          <p className={cn("font-bold text-primary", sizes.price)}>
            {formatPrice(pricing.yourPrice)}
          </p>

          {/* Group badge */}
          {pricing.appliedGroup && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary font-medium",
                sizes.badge
              )}
            >
              <Tag className="h-3 w-3" />
              {pricing.appliedGroup.name}
            </span>
          )}
        </div>

        {/* Retail price (crossed out) */}
        {showRetailPrice && (
          <p
            className={cn(
              "text-muted-foreground line-through",
              sizes.retail
            )}
          >
            Retail: {formatPrice(pricing.retailPrice)}
          </p>
        )}

        {/* Savings */}
        {showSavings && parseFloat(pricing.savings.amount) > 0 && (
          <div
            className={cn(
              "flex items-center gap-1.5 text-green-600",
              sizes.savings
            )}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            <span>
              You save {formatPrice(pricing.savings)} (
              {pricing.savingsPercent.toFixed(0)}% off)
            </span>
          </div>
        )}

        {/* Tier name */}
        {pricing.tierName && (
          <p className={cn("text-muted-foreground", sizes.savings)}>
            {pricing.tierName} pricing
          </p>
        )}
      </div>
    );
  }

  // Authenticated view without group discount
  return (
    <div className={cn("space-y-1", className)}>
      <p className={cn("font-bold text-foreground", sizes.price)}>
        {formatPrice(pricing.yourPrice)}
      </p>
    </div>
  );
}

/**
 * B2BPriceBadge - Compact badge showing B2B discount
 */
export function B2BPriceBadge({
  group,
  className,
}: {
  group: CustomerGroup;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5",
        className
      )}
    >
      <Tag className="h-3 w-3" />
      {group.discountPercent > 0
        ? `${group.discountPercent}% off`
        : group.name}
    </span>
  );
}

/**
 * WholesalePrompt - Prompt for guests to log in for wholesale pricing
 */
export function WholesalePrompt({
  loginUrl = "/auth/login",
  message = "Log in for wholesale pricing",
  className,
}: {
  loginUrl?: string;
  message?: string;
  className?: string;
}) {
  return (
    <Link
      href={loginUrl}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-primary hover:underline",
        className
      )}
    >
      <LogIn className="h-4 w-4" />
      {message}
    </Link>
  );
}

export default B2BPriceDisplayComponent;
