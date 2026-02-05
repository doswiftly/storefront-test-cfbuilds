"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { PaymentMethodCard, PaymentMethod } from "./payment-method-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export interface PaymentStepProps {
  /** Available payment methods from checkout */
  availablePaymentMethods: PaymentMethod[];
  /** Currently selected payment method ID */
  selectedPaymentMethodId?: string | null;
  /** Callback when payment method is selected */
  onPaymentMethodSelect: (paymentMethodId: string) => void | Promise<void>;
  /** Whether the mutation is loading */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Whether checkout is ready for payment */
  checkoutReady?: boolean;
  /** Callback to proceed to next step */
  onContinue?: () => void;
  className?: string;
}

/**
 * PaymentStep - Checkout step for selecting payment method
 *
 * Features:
 * - Lists available payment methods with icons
 * - Pre-selects default or previously selected method
 * - Shows loading state during mutation
 * - Error handling with user feedback
 *
 * Requirements: R23.1, R23.2, R23.5
 */
export function PaymentStep({
  availablePaymentMethods,
  selectedPaymentMethodId,
  onPaymentMethodSelect,
  isLoading = false,
  error,
  checkoutReady = false,
  onContinue,
  className,
}: PaymentStepProps) {
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(
    selectedPaymentMethodId ||
    availablePaymentMethods.find((m) => m.isDefault)?.id ||
    availablePaymentMethods[0]?.id ||
    null
  );

  const handleSelect = useCallback(
    async (method: PaymentMethod) => {
      setLocalSelectedId(method.id);
      await onPaymentMethodSelect(method.id);
    },
    [onPaymentMethodSelect]
  );

  // No payment methods available
  if (availablePaymentMethods.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Payment Method</h3>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No payment methods are available. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedMethod = availablePaymentMethods.find(
    (m) => m.id === (selectedPaymentMethodId || localSelectedId)
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Payment Method</h3>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        Choose how you'd like to pay for your order.
      </p>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Payment Methods List */}
      <div className="space-y-3">
        {availablePaymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            selected={
              method.id === (selectedPaymentMethodId || localSelectedId)
            }
            onSelect={handleSelect}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Updating payment method...</span>
        </div>
      )}

      {/* Continue Button */}
      {onContinue && (
        <Button
          onClick={onContinue}
          disabled={!selectedMethod || isLoading || !checkoutReady}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Continue to Review"
          )}
        </Button>
      )}

      {/* Selected Method Info */}
      {selectedMethod && (
        <p className="text-xs text-muted-foreground text-center">
          Selected: {selectedMethod.name}
          {selectedMethod.description && ` - ${selectedMethod.description}`}
        </p>
      )}
    </div>
  );
}

export default PaymentStep;
