"use client";

import { cn } from "@/lib/utils";
import { CreditCard, Building2, Wallet, Banknote, Check, Smartphone } from "lucide-react";

/**
 * Payment method type enum (matches GraphQL PaymentMethodType)
 * Based on actual payment providers supported in the system
 */
export type PaymentMethodType =
  | "CARD"
  | "BLIK"
  | "BANK_TRANSFER"
  | "CASH_ON_DELIVERY"
  | "APPLE_PAY"
  | "GOOGLE_PAY"
  | "PAYPAL"
  | "OTHER";

/**
 * Payment method interface matching GraphQL PaymentMethod type
 */
export interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  type: PaymentMethodType;
  icon?: string | null;
  description?: string | null;
  isDefault: boolean;
  supportedCurrencies?: string[] | null;
  position: number;
}

export interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Get icon component based on payment method type
 * Requirements: R23.3
 */
function getPaymentTypeIcon(type: PaymentMethodType) {
  switch (type) {
    case "CARD":
      return CreditCard;
    case "BLIK":
      return Smartphone;
    case "BANK_TRANSFER":
      return Building2;
    case "CASH_ON_DELIVERY":
      return Banknote;
    case "APPLE_PAY":
    case "GOOGLE_PAY":
    case "PAYPAL":
      return Wallet;
    case "OTHER":
    default:
      return CreditCard;
  }
}

/**
 * Get human-readable label for payment type
 */
function getPaymentTypeLabel(type: PaymentMethodType): string {
  switch (type) {
    case "CARD":
      return "Karta płatnicza";
    case "BLIK":
      return "BLIK";
    case "BANK_TRANSFER":
      return "Przelew bankowy";
    case "CASH_ON_DELIVERY":
      return "Płatność przy odbiorze";
    case "APPLE_PAY":
      return "Apple Pay";
    case "GOOGLE_PAY":
      return "Google Pay";
    case "PAYPAL":
      return "PayPal";
    case "OTHER":
      return "Inna metoda płatności";
    default:
      return type;
  }
}

/**
 * PaymentMethodCard - Selectable payment method card
 *
 * Features:
 * - Shows payment method name, provider, and icon
 * - Visual selection state with ring
 * - Default badge for default payment method
 * - Type-based fallback icon
 *
 * Requirements: R23.1, R23.3
 */
export function PaymentMethodCard({
  method,
  selected,
  onSelect,
  disabled = false,
  className,
}: PaymentMethodCardProps) {
  const Icon = getPaymentTypeIcon(method.type);

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(method)}
      disabled={disabled}
      className={cn(
        "relative flex items-center gap-4 w-full p-4 rounded-lg border text-left transition-all",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
          : "border-border bg-background hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Payment Icon */}
      <div
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-lg",
          selected ? "bg-primary/10" : "bg-muted"
        )}
      >
        {method.icon ? (
          <img
            src={method.icon}
            alt={method.name}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              // Fallback to icon if image fails to load
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <Icon
          className={cn(
            "w-6 h-6",
            method.icon ? "hidden" : "",
            selected ? "text-primary" : "text-muted-foreground"
          )}
        />
      </div>

      {/* Payment Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {method.name}
          </span>
          {method.isDefault && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
              Default
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {method.description || getPaymentTypeLabel(method.type)}
        </p>
      </div>

      {/* Selection Indicator */}
      <div
        className={cn(
          "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        )}
      >
        {selected && <Check className="w-3 h-3" />}
      </div>
    </button>
  );
}

export default PaymentMethodCard;
