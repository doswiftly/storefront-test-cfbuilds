"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  Check,
  X,
  Loader2,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Gift card status for display
 */
type GiftCardStatus = "ACTIVE" | "USED" | "EXPIRED" | "DISABLED";

/**
 * Gift card validation result
 */
export interface GiftCardValidationResult {
  valid: boolean;
  code: string;
  availableBalance?: {
    amount: string;
    currencyCode: string;
  };
  error?: {
    code: string;
    message: string;
  };
  giftCard?: {
    id: string;
    maskedCode: string;
    lastCharacters: string;
    status: GiftCardStatus;
    balance: {
      amount: string;
      currencyCode: string;
    };
    expiresAt?: string;
  };
}

export interface GiftCardInputProps {
  onValidate: (code: string) => Promise<GiftCardValidationResult>;
  onApply: (code: string, validation: GiftCardValidationResult) => void;
  onRemove?: (code: string) => void;
  appliedCodes?: string[];
  checkoutTotal?: number;
  currencyCode?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Format currency amount for display
 */
function formatAmount(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: currencyCode,
  }).format(num);
}

/**
 * GiftCardInput - Input component for gift card codes
 *
 * Features:
 * - Real-time validation on blur or button click
 * - Shows balance and status feedback
 * - Supports multiple gift cards
 * - Error handling with user-friendly messages
 *
 * Requirements: R32.1, R32.4, R32.5
 */
export function GiftCardInput({
  onValidate,
  onApply,
  onRemove,
  appliedCodes = [],
  checkoutTotal,
  currencyCode = "PLN",
  disabled = false,
  className = "",
}: GiftCardInputProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<GiftCardValidationResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  /**
   * Format code as user types (XXXX-XXXX-XXXX-XXXX)
   */
  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

      // Format with dashes every 4 characters
      if (value.length > 0) {
        const parts = value.match(/.{1,4}/g) || [];
        value = parts.join("-");
      }

      // Limit to 19 characters (16 + 3 dashes)
      if (value.length <= 19) {
        setCode(value);
        setValidation(null);
        setError(null);
      }
    },
    []
  );

  /**
   * Validate the gift card code
   */
  const handleValidate = useCallback(async () => {
    if (!code || code.length < 4) {
      setError("Please enter a valid gift card code");
      return;
    }

    // Check if already applied
    if (appliedCodes.includes(code)) {
      setError("This gift card has already been applied");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await onValidate(code);
      setValidation(result);

      if (!result.valid && result.error) {
        setError(result.error.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to validate gift card");
    } finally {
      setIsValidating(false);
    }
  }, [code, appliedCodes, onValidate]);

  /**
   * Apply the validated gift card
   */
  const handleApply = useCallback(() => {
    if (validation?.valid) {
      onApply(code, validation);
      setCode("");
      setValidation(null);
    }
  }, [code, validation, onApply]);

  /**
   * Handle Enter key press
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (validation?.valid) {
          handleApply();
        } else {
          handleValidate();
        }
      }
    },
    [validation, handleApply, handleValidate]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Gift card code (e.g., ABCD-EFGH-IJKL-MNOP)"
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onBlur={() => code.length >= 16 && handleValidate()}
            disabled={disabled || isValidating}
            className="pl-10 font-mono tracking-wider"
          />
        </div>
        <Button
          type="button"
          variant={validation?.valid ? "default" : "outline"}
          onClick={validation?.valid ? handleApply : handleValidate}
          disabled={disabled || isValidating || !code}
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : validation?.valid ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Apply
            </>
          ) : (
            "Check"
          )}
        </Button>
      </div>

      {/* Validation result */}
      {validation && !error && (
        <div
          className={cn(
            "rounded-lg p-3 text-sm",
            validation.valid
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
              : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
          )}
        >
          {validation.valid ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Gift card valid!</span>
              </div>
              {validation.availableBalance && (
                <span className="font-semibold">
                  Balance:{" "}
                  {formatAmount(
                    validation.availableBalance.amount,
                    validation.availableBalance.currencyCode
                  )}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <span>{validation.error?.message || "Invalid gift card"}</span>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Applied gift cards */}
      {appliedCodes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Applied gift cards:
          </p>
          <div className="flex flex-wrap gap-2">
            {appliedCodes.map((appliedCode) => (
              <Badge
                key={appliedCode}
                variant="secondary"
                className="flex items-center gap-1 py-1"
              >
                <CreditCard className="h-3 w-3" />
                <span className="font-mono text-xs">
                  ****{appliedCode.slice(-4)}
                </span>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(appliedCode)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * GiftCardInputSkeleton - Loading state
 */
export function GiftCardInputSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-muted animate-pulse rounded-md" />
        <div className="w-20 h-10 bg-muted animate-pulse rounded-md" />
      </div>
    </div>
  );
}
