"use client";

import { useState, useEffect } from "react";
import { Truck, Package, Clock, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

/**
 * Types matching GraphQL schema
 */
export interface ShippingCarrier {
  id?: string;
  name: string;
  logoUrl?: string;
  serviceCode?: string;
}

export interface DeliveryEstimate {
  minDays?: number;
  maxDays?: number;
  description?: string;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface FreeShippingProgress {
  qualifies: boolean;
  currentAmount?: Money;
  threshold?: Money;
  remaining?: Money;
  progressPercent?: number;
  message?: string;
}

export interface AvailableShippingMethod {
  id: string;
  name: string;
  description?: string;
  carrier?: ShippingCarrier;
  price: Money;
  isFree: boolean;
  estimatedDelivery?: DeliveryEstimate;
  freeShippingProgress?: FreeShippingProgress;
  sortOrder: number;
}

export interface ShippingMethodSelectorProps {
  methods: AvailableShippingMethod[];
  selectedMethodId?: string;
  onSelect: (method: AvailableShippingMethod) => void;
  freeShippingProgress?: FreeShippingProgress;
  isLoading?: boolean;
  error?: string;
  currencyCode?: string;
  className?: string;
}

/**
 * ShippingMethodSelector - Select shipping method during checkout
 *
 * Features:
 * - Displays available shipping methods with carrier info
 * - Shows delivery estimates
 * - Free shipping progress indicator
 * - Supports carrier logos
 */
export function ShippingMethodSelector({
  methods,
  selectedMethodId,
  onSelect,
  freeShippingProgress,
  isLoading,
  error,
  currencyCode = "PLN",
  className,
}: ShippingMethodSelectorProps) {
  const formatPrice = (money: Money) => {
    const amount = parseFloat(money.amount);
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: money.currencyCode || currencyCode,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Shipping Method</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Spinner className="h-6 w-6" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading shipping options...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Shipping Method</h3>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Shipping Method</h3>
        </div>
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground text-center">
            No shipping methods available for this address
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">Shipping Method</h3>
      </div>

      {/* Free Shipping Progress Banner */}
      {freeShippingProgress && !freeShippingProgress.qualifies && (
        <FreeShippingBanner progress={freeShippingProgress} />
      )}

      {/* Shipping Methods List */}
      <div className="space-y-2">
        {methods.map((method) => (
          <ShippingMethodCard
            key={method.id}
            method={method}
            isSelected={selectedMethodId === method.id}
            onSelect={() => onSelect(method)}
            formatPrice={formatPrice}
          />
        ))}
      </div>

      {/* Free Shipping Achieved */}
      {freeShippingProgress?.qualifies && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-700">
              {freeShippingProgress.message || "You qualify for free shipping!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual shipping method card
 */
function ShippingMethodCard({
  method,
  isSelected,
  onSelect,
  formatPrice,
}: {
  method: AvailableShippingMethod;
  isSelected: boolean;
  onSelect: () => void;
  formatPrice: (money: Money) => string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-4 text-left transition-all",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Method Info */}
        <div className="flex items-start gap-3 flex-1">
          {/* Carrier Logo or Icon */}
          {method.carrier?.logoUrl ? (
            <img
              src={method.carrier.logoUrl}
              alt={method.carrier.name}
              className="h-10 w-10 rounded object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Method Name */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                {method.name}
              </p>
              {method.isFree && (
                <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-700">
                  FREE
                </span>
              )}
            </div>

            {/* Carrier Name (if different from method name) */}
            {method.carrier?.name && method.carrier.name !== method.name && (
              <p className="text-xs text-muted-foreground">
                via {method.carrier.name}
              </p>
            )}

            {/* Description */}
            {method.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {method.description}
              </p>
            )}

            {/* Delivery Estimate */}
            {method.estimatedDelivery && (
              <div className="mt-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {method.estimatedDelivery.description}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Price and Selection */}
        <div className="flex flex-col items-end">
          <p
            className={cn(
              "text-sm font-semibold",
              method.isFree ? "text-green-600" : "text-foreground"
            )}
          >
            {method.isFree ? "FREE" : formatPrice(method.price)}
          </p>

          {/* Selection Indicator */}
          <div
            className={cn(
              "mt-2 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
              isSelected
                ? "border-primary bg-primary"
                : "border-muted-foreground/30"
            )}
          >
            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
        </div>
      </div>

      {/* Method-specific free shipping progress */}
      {method.freeShippingProgress &&
        !method.freeShippingProgress.qualifies &&
        method.freeShippingProgress.progressPercent !== undefined && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">
                {method.freeShippingProgress.message}
              </span>
              <span className="font-medium text-foreground">
                {Math.round(method.freeShippingProgress.progressPercent)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${method.freeShippingProgress.progressPercent}%`,
                }}
              />
            </div>
          </div>
        )}
    </button>
  );
}

/**
 * Free shipping progress banner
 */
function FreeShippingBanner({ progress }: { progress: FreeShippingProgress }) {
  if (!progress.remaining || !progress.threshold) return null;

  return (
    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-amber-700">
          {progress.message}
        </p>
        <span className="text-xs font-medium text-amber-700">
          {progress.progressPercent?.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-amber-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-500 transition-all"
          style={{ width: `${progress.progressPercent || 0}%` }}
        />
      </div>
    </div>
  );
}

export default ShippingMethodSelector;
