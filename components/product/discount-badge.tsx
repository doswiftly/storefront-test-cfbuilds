"use client";

import { Badge } from "@/components/ui/badge";
import { Tag, Percent, TrendingDown } from "lucide-react";

export interface DiscountBadgeProps {
  discountPercentage?: number;
  discountAmount?: number;
  currency?: string;
  label?: string;
  variant?: "percentage" | "amount" | "sale" | "new" | "custom";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * DiscountBadge - Display sale/discount badge on products
 */
export function DiscountBadge({
  discountPercentage,
  discountAmount,
  currency = "PLN",
  label,
  variant = "percentage",
  size = "md",
  className = "",
}: DiscountBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const getContent = () => {
    switch (variant) {
      case "percentage":
        return discountPercentage ? `-${discountPercentage}%` : null;
      case "amount":
        return discountAmount
          ? `-${new Intl.NumberFormat("pl-PL", {
              style: "currency",
              currency,
            }).format(discountAmount)}`
          : null;
      case "sale":
        return "SALE";
      case "new":
        return "NEW";
      case "custom":
        return label || null;
      default:
        return null;
    }
  };

  const content = getContent();

  if (!content) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "percentage":
      case "amount":
        return "bg-red-600 text-white hover:bg-red-700";
      case "sale":
        return "bg-red-600 text-white hover:bg-red-700";
      case "new":
        return "bg-green-600 text-white hover:bg-green-700";
      case "custom":
        return "bg-primary text-primary-foreground hover:bg-primary/90";
      default:
        return "";
    }
  };

  return (
    <Badge
      className={`${sizeClasses[size]} ${getVariantStyles()} font-bold ${className}`}
    >
      {content}
    </Badge>
  );
}

export interface ProductDiscountBadgeProps {
  originalPrice: number;
  salePrice: number;
  showPercentage?: boolean;
  showAmount?: boolean;
  className?: string;
}

/**
 * ProductDiscountBadge - Automatically calculate and display discount
 */
export function ProductDiscountBadge({
  originalPrice,
  salePrice,
  showPercentage = true,
  showAmount = false,
  className = "",
}: ProductDiscountBadgeProps) {
  if (salePrice >= originalPrice) return null;

  const discountAmount = originalPrice - salePrice;
  const discountPercentage = Math.round(
    (discountAmount / originalPrice) * 100
  );

  if (showPercentage) {
    return (
      <DiscountBadge
        discountPercentage={discountPercentage}
        variant="percentage"
        className={className}
      />
    );
  }

  if (showAmount) {
    return (
      <DiscountBadge
        discountAmount={discountAmount}
        variant="amount"
        className={className}
      />
    );
  }

  return null;
}

export interface DiscountLabelProps {
  type: "percentage" | "amount" | "bogo" | "free_shipping";
  value?: number;
  currency?: string;
  className?: string;
}

/**
 * DiscountLabel - Display discount information with icon
 */
export function DiscountLabel({
  type,
  value,
  currency = "PLN",
  className = "",
}: DiscountLabelProps) {
  const getContent = () => {
    switch (type) {
      case "percentage":
        return {
          icon: Percent,
          text: value ? `${value}% OFF` : "DISCOUNT",
          color: "text-red-600",
        };
      case "amount":
        return {
          icon: TrendingDown,
          text: value
            ? `Save ${new Intl.NumberFormat("pl-PL", {
                style: "currency",
                currency,
              }).format(value)}`
            : "SAVE",
          color: "text-red-600",
        };
      case "bogo":
        return {
          icon: Tag,
          text: "Buy One Get One",
          color: "text-green-600",
        };
      case "free_shipping":
        return {
          icon: Tag,
          text: "Free Shipping",
          color: "text-blue-600",
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 ${className}`}
    >
      <Icon className={`h-4 w-4 ${content.color}`} />
      <span className={`text-sm font-semibold ${content.color}`}>
        {content.text}
      </span>
    </div>
  );
}
