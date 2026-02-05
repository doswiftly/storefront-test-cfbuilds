"use client";

/**
 * DiscountCodeInput - Input component for entering and validating discount codes
 *
 * Features:
 * - Code validation on blur or button click
 * - Shows validation result (savings preview or error)
 * - Applies code only after successful validation
 * - Loading state during validation
 *
 * Requirements: 27.1, 27.3, 27.4
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Tag, Loader2, Check, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPrice } from "@/lib/format";

export interface DiscountValidationResult {
  valid: boolean;
  code?: string;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountValue?: number;
  estimatedSavings?: {
    amount: string;
    currencyCode: string;
  };
  minimumOrderAmount?: {
    amount: string;
    currencyCode: string;
  };
  errorMessage?: string;
  errorCode?: string;
}

export interface DiscountCodeInputProps {
  /** Called when user wants to apply a validated code */
  onApply: (code: string) => void | Promise<void>;
  /** Optional: Validate code before applying (returns validation result) */
  onValidate?: (code: string) => Promise<DiscountValidationResult>;
  /** Already applied discount codes */
  appliedCodes?: string[];
  /** Whether the apply mutation is loading */
  isApplying?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Disable input */
  disabled?: boolean;
  className?: string;
}

/**
 * DiscountCodeInput - Discount code entry with validation
 *
 * Validates discount codes before applying them to provide
 * immediate feedback on savings or errors.
 */
export function DiscountCodeInput({
  onApply,
  onValidate,
  appliedCodes = [],
  isApplying = false,
  placeholder = "Wpisz kod rabatowy",
  disabled = false,
  className,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<DiscountValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = isValidating || isApplying;

  const handleValidate = useCallback(async () => {
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setError("Wpisz kod rabatowy");
      return;
    }

    // Check if already applied
    if (appliedCodes.includes(trimmedCode)) {
      setError("Ten kod jest już zastosowany");
      return;
    }

    setError(null);
    setValidationResult(null);

    if (onValidate) {
      setIsValidating(true);
      try {
        const result = await onValidate(trimmedCode);
        setValidationResult(result);

        if (!result.valid) {
          setError(result.errorMessage || "Kod jest nieprawidłowy");
        }
      } catch (e: any) {
        setError(e.message || "Nie udało się zweryfikować kodu");
      } finally {
        setIsValidating(false);
      }
    } else {
      // No validation function, assume valid
      setValidationResult({ valid: true, code: trimmedCode });
    }
  }, [code, appliedCodes, onValidate]);

  const handleApply = useCallback(async () => {
    const trimmedCode = code.trim().toUpperCase();

    // If not yet validated, validate first
    if (!validationResult?.valid) {
      await handleValidate();
      return;
    }

    if (validationResult.valid) {
      await onApply(trimmedCode);
      // Reset state after successful apply
      setCode("");
      setValidationResult(null);
      setError(null);
    }
  }, [code, validationResult, onApply, handleValidate]);

  const handleClear = () => {
    setCode("");
    setValidationResult(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  // Format discount value for display
  const getDiscountPreview = () => {
    if (!validationResult?.valid) return null;

    if (validationResult.estimatedSavings) {
      return `Oszczędzisz ${formatPrice(validationResult.estimatedSavings)}`;
    }

    if (validationResult.discountType === "PERCENTAGE" && validationResult.discountValue) {
      return `${validationResult.discountValue}% zniżki`;
    }

    if (validationResult.discountType === "FREE_SHIPPING") {
      return "Darmowa dostawa";
    }

    return "Kod jest prawidłowy";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setValidationResult(null);
              setError(null);
            }}
            onBlur={handleValidate}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              "pl-9 pr-8 uppercase",
              validationResult?.valid && "border-green-500 focus-visible:ring-green-500",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {code && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="button"
          onClick={handleApply}
          disabled={disabled || isLoading || !code.trim()}
          variant={validationResult?.valid ? "default" : "secondary"}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : validationResult?.valid ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Zastosuj
            </>
          ) : (
            "Zastosuj"
          )}
        </Button>
      </div>

      {/* Validation result - success preview */}
      {validationResult?.valid && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            {getDiscountPreview()}
          </AlertDescription>
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Minimum order info */}
      {validationResult?.minimumOrderAmount && (
        <p className="text-xs text-muted-foreground">
          Minimalna kwota zamówienia: {formatPrice(validationResult.minimumOrderAmount)}
        </p>
      )}
    </div>
  );
}

export default DiscountCodeInput;
