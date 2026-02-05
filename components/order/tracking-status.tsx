"use client";

import { Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type ShipmentStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned";

export interface TrackingStatusProps {
  status: ShipmentStatus;
  trackingNumber?: string;
  carrier?: string;
  lastUpdate?: string;
  className?: string;
}

/**
 * TrackingStatus - Display current shipment status
 */
export function TrackingStatus({
  status,
  trackingNumber,
  carrier,
  lastUpdate,
  className = "",
}: TrackingStatusProps) {
  const getStatusConfig = (status: ShipmentStatus) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          description: "Your order is being prepared",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
          variant: "warning" as const,
        };
      case "processing":
        return {
          icon: Package,
          label: "Processing",
          description: "Your order is being processed",
          color: "text-blue-600",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          variant: "default" as const,
        };
      case "shipped":
      case "in_transit":
        return {
          icon: Truck,
          label: "In Transit",
          description: "Your package is on its way",
          color: "text-blue-600",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          variant: "default" as const,
        };
      case "out_for_delivery":
        return {
          icon: Truck,
          label: "Out for Delivery",
          description: "Your package will arrive today",
          color: "text-green-600",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          variant: "success" as const,
        };
      case "delivered":
        return {
          icon: CheckCircle,
          label: "Delivered",
          description: "Your package has been delivered",
          color: "text-green-600",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          variant: "success" as const,
        };
      case "failed":
        return {
          icon: AlertCircle,
          label: "Delivery Failed",
          description: "There was an issue with delivery",
          color: "text-red-600",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          variant: "secondary" as const,
        };
      case "returned":
        return {
          icon: Package,
          label: "Returned",
          description: "Package has been returned",
          color: "text-gray-600",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
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
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className={`rounded-full p-3 ${config.bgColor}`}>
          <Icon className={`h-6 w-6 ${config.color}`} />
        </div>

        {/* Status Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-foreground">
              {config.label}
            </h3>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>

          <p className="text-muted-foreground mb-4">{config.description}</p>

          {/* Tracking Information */}
          <div className="space-y-2 text-sm">
            {trackingNumber && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  Tracking Number:
                </span>
                <span className="font-mono text-muted-foreground">
                  {trackingNumber}
                </span>
              </div>
            )}

            {carrier && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Carrier:</span>
                <span className="text-muted-foreground">{carrier}</span>
              </div>
            )}

            {lastUpdate && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  Last Update:
                </span>
                <span className="text-muted-foreground">
                  {formatDate(lastUpdate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export interface CompactTrackingStatusProps {
  status: ShipmentStatus;
  className?: string;
}

/**
 * CompactTrackingStatus - Compact version for lists
 */
export function CompactTrackingStatus({
  status,
  className = "",
}: CompactTrackingStatusProps) {
  const getStatusConfig = (status: ShipmentStatus) => {
    switch (status) {
      case "pending":
      case "processing":
        return { label: "Processing", variant: "warning" as const };
      case "shipped":
      case "in_transit":
        return { label: "In Transit", variant: "default" as const };
      case "out_for_delivery":
        return { label: "Out for Delivery", variant: "success" as const };
      case "delivered":
        return { label: "Delivered", variant: "success" as const };
      case "failed":
        return { label: "Failed", variant: "secondary" as const };
      case "returned":
        return { label: "Returned", variant: "secondary" as const };
      default:
        return { label: "Unknown", variant: "secondary" as const };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
