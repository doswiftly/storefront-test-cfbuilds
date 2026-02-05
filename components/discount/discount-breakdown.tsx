"use client";

/**
 * DiscountBreakdown - Component to display applied discounts
 *
 * Features:
 * - Shows each applied discount with code and amount
 * - Calculates and displays total savings
 * - Supports multiple stacked discounts
 * - Remove discount option
 *
 * Requirements: 25.6
 */

import { cn } from "@/lib/utils";
import { Tag, X, Percent, Truck, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

export interface AppliedDiscount {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING" | "BUY_X_GET_Y";
  value?: number; // Percentage value or fixed amount
  allocatedAmount: {
    amount: string;
    currencyCode: string;
  };
  targetType?: "ORDER" | "LINE_ITEM" | "SHIPPING";
  description?: string;
}

export interface DiscountBreakdownProps {
  /** List of applied discounts */
  discounts: AppliedDiscount[];
  /** Called when user removes a discount */
  onRemove?: (discountId: string, code: string) => void | Promise<void>;
  /** Whether remove is in progress */
  isRemoving?: boolean;
  /** Show total savings */
  showTotal?: boolean;
  /** Currency code for total calculation */
  currencyCode?: string;
  /** Compact mode for smaller spaces */
  compact?: boolean;
  className?: string;
}

/**
 * Get icon for discount type
 */
function getDiscountIcon(type: AppliedDiscount["type"]) {
  switch (type) {
    case "PERCENTAGE":
      return Percent;
    case "FREE_SHIPPING":
      return Truck;
    case "BUY_X_GET_Y":
      return Gift;
    default:
      return Tag;
  }
}

/**
 * Get label for discount type
 */
function getDiscountTypeLabel(discount: AppliedDiscount): string {
  switch (discount.type) {
    case "PERCENTAGE":
      return discount.value ? `${discount.value}% zniżki` : "Rabat procentowy";
    case "FIXED_AMOUNT":
      return "Rabat kwotowy";
    case "FREE_SHIPPING":
      return "Darmowa dostawa";
    case "BUY_X_GET_Y":
      return "Kup X, dostań Y";
    default:
      return "Rabat";
  }
}

/**
 * DiscountBreakdown - Display applied discounts with breakdown
 *
 * Shows all applied discount codes with their savings amounts
 * and optionally a total savings summary.
 */
export function DiscountBreakdown({
  discounts,
  onRemove,
  isRemoving = false,
  showTotal = true,
  currencyCode = "PLN",
  compact = false,
  className,
}: DiscountBreakdownProps) {
  if (discounts.length === 0) {
    return null;
  }

  // Calculate total savings
  const totalSavings = discounts.reduce((sum, discount) => {
    return sum + parseFloat(discount.allocatedAmount.amount);
  }, 0);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Individual discounts */}
      {discounts.map((discount) => {
        const Icon = getDiscountIcon(discount.type);
        const isNegative = parseFloat(discount.allocatedAmount.amount) > 0;

        return (
          <div
            key={discount.id}
            className={cn(
              "flex items-center justify-between rounded-md border bg-green-50/50 p-2 dark:bg-green-950/20",
              compact && "px-2 py-1"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon className={cn("h-4 w-4 text-green-600 shrink-0", compact && "h-3 w-3")} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium text-green-700 dark:text-green-400 truncate",
                      compact && "text-sm"
                    )}
                  >
                    {discount.code}
                  </span>
                  {!compact && (
                    <span className="text-xs text-muted-foreground">
                      {getDiscountTypeLabel(discount)}
                    </span>
                  )}
                </div>
                {discount.description && !compact && (
                  <p className="text-xs text-muted-foreground truncate">
                    {discount.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  "font-medium text-green-700 dark:text-green-400",
                  compact && "text-sm"
                )}
              >
                -{formatPrice(discount.allocatedAmount)}
              </span>
              {onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn("h-6 w-6 text-muted-foreground hover:text-destructive", compact && "h-5 w-5")}
                  onClick={() => onRemove(discount.id, discount.code)}
                  disabled={isRemoving}
                >
                  <X className={cn("h-3 w-3", compact && "h-2.5 w-2.5")} />
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {/* Total savings */}
      {showTotal && discounts.length > 1 && (
        <div
          className={cn(
            "flex items-center justify-between border-t pt-2",
            compact && "pt-1"
          )}
        >
          <span className={cn("font-medium", compact && "text-sm")}>
            Łączne oszczędności
          </span>
          <span
            className={cn(
              "font-semibold text-green-700 dark:text-green-400",
              compact && "text-sm"
            )}
          >
            -{formatPrice({ amount: totalSavings.toFixed(2), currencyCode })}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * DiscountSummaryLine - Single line discount display for order summary
 */
export interface DiscountSummaryLineProps {
  label?: string;
  amount: {
    amount: string;
    currencyCode: string;
  };
  code?: string;
  onRemove?: () => void;
  className?: string;
}

export function DiscountSummaryLine({
  label = "Rabat",
  amount,
  code,
  onRemove,
  className,
}: DiscountSummaryLineProps) {
  return (
    <div className={cn("flex items-center justify-between text-sm", className)}>
      <div className="flex items-center gap-1.5">
        <Tag className="h-3.5 w-3.5 text-green-600" />
        <span className="text-muted-foreground">
          {label}
          {code && <span className="ml-1 font-medium text-foreground">({code})</span>}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-green-600 font-medium">-{formatPrice(amount)}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export default DiscountBreakdown;
