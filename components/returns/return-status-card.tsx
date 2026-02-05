"use client";

import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  XCircle,
  RefreshCw,
  CreditCard,
  Gift,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Return status enum matching backend
 */
export type ReturnStatus =
  | "DRAFT"
  | "REQUESTED"
  | "APPROVED"
  | "LABEL_GENERATED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "INSPECTING"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "COMPLETED"
  | "EXCHANGED"
  | "REPLACED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "FAILED";

export type ReturnReason =
  | "DEFECTIVE"
  | "NOT_AS_DESCRIBED"
  | "WRONG_ITEM"
  | "CHANGED_MIND"
  | "BETTER_PRICE"
  | "DAMAGED_SHIPPING"
  | "OTHER";

export type CompensationType = "REFUND" | "STORE_CREDIT";

/**
 * Return item data
 */
export interface ReturnItemData {
  id: string;
  productTitle: string;
  variantTitle?: string;
  sku?: string;
  imageUrl?: string;
  quantity: number;
  reason: ReturnReason;
  condition?: string;
  unitPrice?: {
    amount: string;
    currencyCode: string;
  };
}

/**
 * Return data from GraphQL
 */
export interface ReturnData {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  status: ReturnStatus;
  reason: ReturnReason;
  customerNote?: string;
  compensationType?: CompensationType;
  items: ReturnItemData[];
  refundAmount?: {
    amount: string;
    currencyCode: string;
  };
  shippingLabel?: {
    url: string;
    carrier?: string;
    trackingNumber?: string;
    expiresAt?: string;
  };
  requestedAt?: string;
  approvedAt?: string;
  receivedAt?: string;
  refundedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ReturnStatusCardProps {
  returnData: ReturnData;
  onCancel?: () => void;
  className?: string;
}

/**
 * Get status configuration for display
 */
function getStatusConfig(status: ReturnStatus) {
  switch (status) {
    case "DRAFT":
      return {
        icon: FileText,
        label: "Draft",
        description: "Return request is being prepared",
        color: "text-gray-600",
        bgColor: "bg-gray-100 dark:bg-gray-900/30",
        variant: "secondary" as const,
      };
    case "REQUESTED":
      return {
        icon: Clock,
        label: "Requested",
        description: "Waiting for approval",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        variant: "warning" as const,
      };
    case "APPROVED":
      return {
        icon: CheckCircle,
        label: "Approved",
        description: "Your return has been approved",
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        variant: "success" as const,
      };
    case "LABEL_GENERATED":
      return {
        icon: Package,
        label: "Label Ready",
        description: "Download your return shipping label",
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        variant: "default" as const,
      };
    case "IN_TRANSIT":
      return {
        icon: Truck,
        label: "In Transit",
        description: "Your return is on its way to us",
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        variant: "default" as const,
      };
    case "RECEIVED":
      return {
        icon: Package,
        label: "Received",
        description: "We have received your return",
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        variant: "default" as const,
      };
    case "INSPECTING":
      return {
        icon: RefreshCw,
        label: "Inspecting",
        description: "Your items are being inspected",
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        variant: "default" as const,
      };
    case "REFUND_PENDING":
      return {
        icon: CreditCard,
        label: "Refund Pending",
        description: "Your refund is being processed",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        variant: "warning" as const,
      };
    case "REFUNDED":
      return {
        icon: CreditCard,
        label: "Refunded",
        description: "Your refund has been issued",
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        variant: "success" as const,
      };
    case "COMPLETED":
      return {
        icon: CheckCircle,
        label: "Completed",
        description: "Return process completed",
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        variant: "success" as const,
      };
    case "EXCHANGED":
      return {
        icon: RefreshCw,
        label: "Exchanged",
        description: "Items have been exchanged",
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        variant: "success" as const,
      };
    case "REPLACED":
      return {
        icon: Package,
        label: "Replaced",
        description: "Replacement items shipped",
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        variant: "success" as const,
      };
    case "REJECTED":
      return {
        icon: XCircle,
        label: "Rejected",
        description: "Return request was rejected",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        variant: "secondary" as const,
      };
    case "CANCELLED":
      return {
        icon: XCircle,
        label: "Cancelled",
        description: "Return request was cancelled",
        color: "text-gray-600",
        bgColor: "bg-gray-100 dark:bg-gray-900/30",
        variant: "secondary" as const,
      };
    case "EXPIRED":
      return {
        icon: AlertCircle,
        label: "Expired",
        description: "Return request has expired",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        variant: "secondary" as const,
      };
    case "FAILED":
      return {
        icon: AlertCircle,
        label: "Failed",
        description: "Return process failed",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        variant: "secondary" as const,
      };
    default:
      return {
        icon: Package,
        label: "Unknown",
        description: "Status unknown",
        color: "text-gray-600",
        bgColor: "bg-gray-100 dark:bg-gray-900/30",
        variant: "secondary" as const,
      };
  }
}

/**
 * Get reason label
 */
function getReasonLabel(reason: ReturnReason): string {
  const labels: Record<ReturnReason, string> = {
    DEFECTIVE: "Defective Product",
    NOT_AS_DESCRIBED: "Not as Described",
    WRONG_ITEM: "Wrong Item",
    CHANGED_MIND: "Changed Mind",
    BETTER_PRICE: "Better Price Found",
    DAMAGED_SHIPPING: "Damaged in Shipping",
    OTHER: "Other",
  };
  return labels[reason] || reason;
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
 * Check if return can be cancelled
 */
function canCancel(status: ReturnStatus): boolean {
  return ["DRAFT", "REQUESTED", "APPROVED"].includes(status);
}

/**
 * ReturnStatusCard - Display return status and details
 *
 * Shows:
 * - Current return status with icon and badge
 * - Return number and order reference
 * - Items being returned
 * - Shipping label download (if available)
 * - Refund amount (if processed)
 * - Timeline of status changes
 *
 * Requirements: R30.4, R30.5, R30.6, R30.7
 */
export function ReturnStatusCard({
  returnData,
  onCancel,
  className = "",
}: ReturnStatusCardProps) {
  const config = getStatusConfig(returnData.status);
  const Icon = config.icon;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            <div className={`rounded-full p-2 ${config.bgColor}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>

            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Return #{returnData.returnNumber}
                <Badge variant={config.variant}>{config.label}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            </div>
          </div>

          {/* Cancel button (if applicable) */}
          {canCancel(returnData.status) && onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel Return
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Reference */}
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Order:</span>{" "}
            <span className="font-medium">#{returnData.orderNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Reason:</span>{" "}
            <span className="font-medium">
              {getReasonLabel(returnData.reason)}
            </span>
          </div>
          {returnData.compensationType && (
            <div>
              <span className="text-muted-foreground">Compensation:</span>{" "}
              <span className="font-medium">
                {returnData.compensationType === "REFUND"
                  ? "Refund"
                  : "Store Credit"}
              </span>
            </div>
          )}
        </div>

        {/* Customer Note */}
        {returnData.customerNote && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Your note:</p>
            <p className="text-sm mt-1">{returnData.customerNote}</p>
          </div>
        )}

        {/* Items */}
        <div>
          <h4 className="font-medium mb-3">Items to Return</h4>
          <div className="space-y-3">
            {returnData.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 border border-border rounded-lg"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.productTitle}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.productTitle}</p>
                  {item.variantTitle && (
                    <p className="text-sm text-muted-foreground">
                      {item.variantTitle}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                    {item.condition && ` | Condition: ${item.condition}`}
                  </p>
                </div>
                {item.unitPrice && (
                  <p className="font-medium">
                    {item.unitPrice.amount} {item.unitPrice.currencyCode}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Label */}
        {returnData.shippingLabel && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Return Shipping Label
                </h4>
                {returnData.shippingLabel.carrier && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Carrier: {returnData.shippingLabel.carrier}
                    {returnData.shippingLabel.trackingNumber &&
                      ` | Tracking: ${returnData.shippingLabel.trackingNumber}`}
                  </p>
                )}
                {returnData.shippingLabel.expiresAt && (
                  <p className="text-sm text-muted-foreground">
                    Expires: {formatDate(returnData.shippingLabel.expiresAt)}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(returnData.shippingLabel!.url, "_blank")
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Download Label
              </Button>
            </div>
          </div>
        )}

        {/* Refund Amount */}
        {returnData.refundAmount && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  {returnData.compensationType === "STORE_CREDIT" ? (
                    <Gift className="h-4 w-4" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {returnData.compensationType === "STORE_CREDIT"
                    ? "Store Credit Issued"
                    : "Refund Amount"}
                </h4>
              </div>
              <p className="text-xl font-bold">
                {returnData.refundAmount.amount}{" "}
                {returnData.refundAmount.currencyCode}
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* Timeline */}
        <div>
          <h4 className="font-medium mb-3">Timeline</h4>
          <div className="space-y-2 text-sm">
            {returnData.completedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span>{formatDate(returnData.completedAt)}</span>
              </div>
            )}
            {returnData.refundedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refunded</span>
                <span>{formatDate(returnData.refundedAt)}</span>
              </div>
            )}
            {returnData.receivedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Received</span>
                <span>{formatDate(returnData.receivedAt)}</span>
              </div>
            )}
            {returnData.approvedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approved</span>
                <span>{formatDate(returnData.approvedAt)}</span>
              </div>
            )}
            {returnData.requestedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested</span>
                <span>{formatDate(returnData.requestedAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(returnData.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ReturnStatusCardSkeleton - Loading state
 */
export function ReturnStatusCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-20 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}
