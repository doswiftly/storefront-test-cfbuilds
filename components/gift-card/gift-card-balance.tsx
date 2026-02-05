"use client";

import {
  Gift,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * Gift card status
 */
export type GiftCardStatus = "ACTIVE" | "USED" | "EXPIRED" | "DISABLED";

/**
 * Gift card data
 */
export interface GiftCardData {
  id: string;
  maskedCode: string;
  lastCharacters: string;
  status: GiftCardStatus;
  initialAmount: {
    amount: string;
    currencyCode: string;
  };
  balance: {
    amount: string;
    currencyCode: string;
  };
  expiresAt?: string;
  recipientName?: string;
  message?: string;
}

export interface GiftCardBalanceProps {
  giftCard: GiftCardData;
  className?: string;
}

/**
 * Format currency amount
 */
function formatAmount(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: currencyCode,
  }).format(num);
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get status badge configuration
 */
function getStatusConfig(status: GiftCardStatus) {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        variant: "default" as const,
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      };
    case "USED":
      return {
        label: "Fully Redeemed",
        variant: "secondary" as const,
        color: "text-gray-600",
        bgColor: "bg-gray-100 dark:bg-gray-900/30",
      };
    case "EXPIRED":
      return {
        label: "Expired",
        variant: "destructive" as const,
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/30",
      };
    case "DISABLED":
      return {
        label: "Disabled",
        variant: "secondary" as const,
        color: "text-gray-600",
        bgColor: "bg-gray-100 dark:bg-gray-900/30",
      };
    default:
      return {
        label: "Unknown",
        variant: "secondary" as const,
        color: "text-gray-600",
        bgColor: "bg-gray-100 dark:bg-gray-900/30",
      };
  }
}

/**
 * Check if card is expiring soon (within 30 days)
 */
function isExpiringSoon(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
}

/**
 * GiftCardBalance - Display gift card balance and status
 *
 * Shows:
 * - Current balance with progress bar
 * - Card status (active, used, expired)
 * - Expiration date with warning
 * - Masked code for identification
 *
 * Requirements: R32.1, R32.5
 */
export function GiftCardBalance({
  giftCard,
  className = "",
}: GiftCardBalanceProps) {
  const statusConfig = getStatusConfig(giftCard.status);
  const initialAmount = parseFloat(giftCard.initialAmount.amount);
  const currentBalance = parseFloat(giftCard.balance.amount);
  const usedPercentage =
    initialAmount > 0 ? ((initialAmount - currentBalance) / initialAmount) * 100 : 0;
  const expiringSoon = isExpiringSoon(giftCard.expiresAt);

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("rounded-full p-2", statusConfig.bgColor)}>
              <Gift className={cn("h-5 w-5", statusConfig.color)} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Gift Card
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {giftCard.maskedCode}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Balance display */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <span className="text-2xl font-bold">
              {formatAmount(
                giftCard.balance.amount,
                giftCard.balance.currencyCode
              )}
            </span>
          </div>

          {/* Progress bar */}
          <Progress value={100 - usedPercentage} className="h-2" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Used:{" "}
              {formatAmount(
                (initialAmount - currentBalance).toFixed(2),
                giftCard.balance.currencyCode
              )}
            </span>
            <span>
              Initial:{" "}
              {formatAmount(
                giftCard.initialAmount.amount,
                giftCard.initialAmount.currencyCode
              )}
            </span>
          </div>
        </div>

        {/* Expiration warning */}
        {giftCard.expiresAt && (
          <div
            className={cn(
              "flex items-center gap-2 text-sm p-2 rounded-lg",
              expiringSoon
                ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
                : "bg-muted/50"
            )}
          >
            {expiringSoon ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Calendar className="h-4 w-4 text-muted-foreground" />
            )}
            <span>
              {expiringSoon ? "Expires soon: " : "Expires: "}
              {formatDate(giftCard.expiresAt)}
            </span>
          </div>
        )}

        {/* No expiration */}
        {!giftCard.expiresAt && giftCard.status === "ACTIVE" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>No expiration date</span>
          </div>
        )}

        {/* Recipient/message */}
        {(giftCard.recipientName || giftCard.message) && (
          <div className="pt-3 border-t border-border space-y-2">
            {giftCard.recipientName && (
              <p className="text-sm">
                <span className="text-muted-foreground">To: </span>
                <span className="font-medium">{giftCard.recipientName}</span>
              </p>
            )}
            {giftCard.message && (
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{giftCard.message}&rdquo;
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * GiftCardBalanceSkeleton - Loading state
 */
export function GiftCardBalanceSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          <div className="h-2 w-full bg-muted animate-pulse rounded" />
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * GiftCardBalanceCompact - Compact inline balance display
 */
export interface GiftCardBalanceCompactProps {
  balance: {
    amount: string;
    currencyCode: string;
  };
  maskedCode: string;
  status: GiftCardStatus;
  className?: string;
}

export function GiftCardBalanceCompact({
  balance,
  maskedCode,
  status,
  className = "",
}: GiftCardBalanceCompactProps) {
  const statusConfig = getStatusConfig(status);

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-sm">{maskedCode}</span>
        <Badge variant={statusConfig.variant} className="text-xs">
          {statusConfig.label}
        </Badge>
      </div>
      <span className="font-semibold">
        {formatAmount(balance.amount, balance.currencyCode)}
      </span>
    </div>
  );
}
