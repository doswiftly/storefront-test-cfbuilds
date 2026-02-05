"use client";

import { useState } from "react";
import { Tag, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PromoCodeInputProps {
  onApply: (code: string) => Promise<{ success: boolean; message?: string }>;
  appliedCode?: string;
  onRemove?: () => void;
  className?: string;
}

/**
 * PromoCodeInput - Discount code input with validation
 */
export function PromoCodeInput({
  onApply,
  appliedCode,
  onRemove,
  className,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onApply(code.trim());
      
      if (result.success) {
        setSuccess(result.message || "Promo code applied successfully!");
        setCode("");
      } else {
        setError(result.message || "Invalid promo code");
      }
    } catch (err) {
      setError("Failed to apply promo code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      setSuccess(null);
      setError(null);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Applied code display */}
      {appliedCode ? (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              {appliedCode}
            </span>
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700 dark:text-green-400"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter promo code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
                disabled={isLoading}
                className="pl-9"
              />
            </div>
            <Button
              onClick={handleApply}
              disabled={!code.trim() || isLoading}
              size="default"
            >
              {isLoading ? "Applying..." : "Apply"}
            </Button>
          </div>

          {/* Messages */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {success}
            </p>
          )}
        </>
      )}
    </div>
  );
}
