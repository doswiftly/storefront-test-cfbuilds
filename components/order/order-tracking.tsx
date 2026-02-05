"use client";

import { Package, Truck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ShipmentCard,
  ShipmentCardSkeleton,
  type ShipmentData,
} from "./shipment-card";
import { MilestoneTimeline } from "./tracking-timeline";

export interface OrderTrackingProps {
  /** Order ID for display */
  orderNumber: string;
  /** Array of shipments for this order */
  shipments: ShipmentData[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error message if fetch failed */
  error?: string | null;
  /** Custom className */
  className?: string;
}

/**
 * Calculate order-level milestone status from shipments
 */
function getOrderMilestones(shipments: ShipmentData[]) {
  if (shipments.length === 0) {
    return [
      { label: "Order Placed", status: "completed" as const, date: undefined },
      { label: "Processing", status: "current" as const, date: undefined },
      { label: "Shipped", status: "pending" as const, date: undefined },
      { label: "Delivered", status: "pending" as const, date: undefined },
    ];
  }

  // Determine overall status from shipments
  const allDelivered = shipments.every((s) => s.status === "DELIVERED");
  const anyShipped = shipments.some(
    (s) =>
      s.status !== "CREATED" &&
      s.status !== "LABEL_PRINTED" &&
      s.status !== "CANCELLED"
  );
  const anyInTransit = shipments.some(
    (s) =>
      s.status === "IN_TRANSIT" ||
      s.status === "OUT_FOR_DELIVERY" ||
      s.status === "PICKED_UP"
  );
  const anyOutForDelivery = shipments.some(
    (s) => s.status === "OUT_FOR_DELIVERY"
  );

  // Find relevant dates
  const shippedAt = shipments.find((s) => s.shippedAt)?.shippedAt;
  const deliveredAt = shipments.find((s) => s.deliveredAt)?.deliveredAt;
  const createdAt = shipments[0]?.createdAt;

  return [
    {
      label: "Order Placed",
      status: "completed" as const,
      date: createdAt,
    },
    {
      label: "Processing",
      status: anyShipped ? ("completed" as const) : ("current" as const),
      date: undefined,
    },
    {
      label: "Shipped",
      status: allDelivered
        ? ("completed" as const)
        : anyInTransit || anyOutForDelivery
        ? ("current" as const)
        : anyShipped
        ? ("completed" as const)
        : ("pending" as const),
      date: shippedAt || undefined,
    },
    {
      label: "Delivered",
      status: allDelivered ? ("completed" as const) : ("pending" as const),
      date: deliveredAt || undefined,
    },
  ];
}

/**
 * OrderTracking - Display order tracking with shipments
 *
 * Shows:
 * - Order-level milestone progress (Order Placed → Processing → Shipped → Delivered)
 * - Individual shipment cards with detailed tracking
 * - Loading and error states
 *
 * Requirements: R29.2, R29.3, R29.4, R29.5, R29.6
 */
export function OrderTracking({
  orderNumber,
  shipments,
  isLoading = false,
  error = null,
  className = "",
}: OrderTrackingProps) {
  const milestones = getOrderMilestones(shipments);

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTitle>Error Loading Tracking</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Order Tracking</h2>
        </div>

        {/* Skeleton milestone timeline */}
        <div className="h-20 bg-muted animate-pulse rounded-lg" />

        {/* Skeleton shipment cards */}
        <div className="space-y-4">
          <ShipmentCardSkeleton />
        </div>
      </div>
    );
  }

  // No shipments yet
  if (shipments.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Order Tracking</h2>
        </div>

        {/* Milestone progress */}
        <MilestoneTimeline milestones={milestones} className="mb-6" />

        {/* No shipments message */}
        <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Shipments Yet
          </h3>
          <p className="text-muted-foreground">
            Your order is being prepared. Tracking information will appear here
            once your items are shipped.
          </p>
        </div>
      </div>
    );
  }

  // With shipments
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Order Tracking</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {shipments.length} {shipments.length === 1 ? "shipment" : "shipments"}
        </span>
      </div>

      {/* Milestone progress */}
      <MilestoneTimeline milestones={milestones} className="mb-6" />

      {/* Shipment cards */}
      <div className="space-y-4">
        {shipments.map((shipment, index) => (
          <div key={shipment.id}>
            {shipments.length > 1 && (
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Shipment {index + 1} of {shipments.length}
              </h3>
            )}
            <ShipmentCard shipment={shipment} showTimeline />
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderTracking;
