"use client";

import { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrackingTimeline, type TrackingEvent } from "./tracking-timeline";

/**
 * ShipmentStatus enum matching backend GraphQL type
 */
export type ShipmentStatus =
  | "CREATED"
  | "LABEL_PRINTED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED"
  | "EXCEPTION";

/**
 * Shipment event from GraphQL
 */
export interface ShipmentEventData {
  id: string;
  status: ShipmentStatus;
  description?: string | null;
  location?: string | null;
  occurredAt: string;
  providerEventCode?: string | null;
}

/**
 * Shipment data from GraphQL
 */
export interface ShipmentData {
  id: string;
  orderId: string;
  provider: string;
  serviceCode?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  status: ShipmentStatus;
  estimatedDeliveryDate?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  events?: ShipmentEventData[] | null;
  createdAt: string;
}

export interface ShipmentCardProps {
  shipment: ShipmentData;
  showTimeline?: boolean;
  className?: string;
}

/**
 * Get status configuration for display
 */
function getStatusConfig(status: ShipmentStatus) {
  switch (status) {
    case "CREATED":
      return {
        icon: Package,
        label: "Created",
        description: "Shipment label created",
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        variant: "default" as const,
      };
    case "LABEL_PRINTED":
      return {
        icon: Package,
        label: "Label Printed",
        description: "Shipping label printed, awaiting pickup",
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        variant: "default" as const,
      };
    case "PICKED_UP":
      return {
        icon: Truck,
        label: "Picked Up",
        description: "Package picked up by carrier",
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        variant: "default" as const,
      };
    case "IN_TRANSIT":
      return {
        icon: Truck,
        label: "In Transit",
        description: "Package is on its way",
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        variant: "default" as const,
      };
    case "OUT_FOR_DELIVERY":
      return {
        icon: Truck,
        label: "Out for Delivery",
        description: "Package will arrive today",
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        variant: "success" as const,
      };
    case "DELIVERED":
      return {
        icon: CheckCircle,
        label: "Delivered",
        description: "Package has been delivered",
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        variant: "success" as const,
      };
    case "RETURNED":
      return {
        icon: Package,
        label: "Returned",
        description: "Package has been returned",
        color: "text-gray-600",
        bgColor: "bg-gray-100 dark:bg-gray-900/30",
        variant: "secondary" as const,
      };
    case "CANCELLED":
      return {
        icon: AlertCircle,
        label: "Cancelled",
        description: "Shipment has been cancelled",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        variant: "secondary" as const,
      };
    case "EXCEPTION":
      return {
        icon: AlertCircle,
        label: "Exception",
        description: "There was an issue with delivery",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        variant: "secondary" as const,
      };
    default:
      return {
        icon: Clock,
        label: "Unknown",
        description: "Status unknown",
        color: "text-gray-600",
        bgColor: "bg-gray-100 dark:bg-gray-900/30",
        variant: "secondary" as const,
      };
  }
}

/**
 * Format carrier name for display
 */
function formatCarrierName(provider: string): string {
  const carrierNames: Record<string, string> = {
    INPOST: "InPost",
    DPD: "DPD",
    UPS: "UPS",
    DHL: "DHL",
    FEDEX: "FedEx",
    GLS: "GLS",
    MANUAL: "Manual Shipping",
  };
  return carrierNames[provider.toUpperCase()] || provider;
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
 * Format datetime for display
 */
function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Map GraphQL events to timeline format
 */
function mapEventsToTimeline(events: ShipmentEventData[]): TrackingEvent[] {
  // Sort by date descending (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return sortedEvents.map((event, index) => ({
    id: event.id,
    status: event.status,
    description: event.description || getStatusConfig(event.status).description,
    location: event.location || undefined,
    timestamp: event.occurredAt,
    isCompleted: index > 0 || event.status === "DELIVERED",
  }));
}

/**
 * ShipmentCard - Display shipment information with tracking
 *
 * Shows:
 * - Current shipment status with icon and badge
 * - Tracking number and carrier
 * - Estimated delivery date
 * - External tracking URL
 * - Expandable tracking timeline (events)
 *
 * Requirements: R29.2, R29.3, R29.4, R29.6
 */
export function ShipmentCard({
  shipment,
  showTimeline = true,
  className = "",
}: ShipmentCardProps) {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  const config = getStatusConfig(shipment.status);
  const Icon = config.icon;
  const hasEvents = shipment.events && shipment.events.length > 0;
  const timelineEvents = hasEvents ? mapEventsToTimeline(shipment.events!) : [];

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            <div className={`rounded-full p-2 ${config.bgColor}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>

            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {config.label}
                <Badge variant={config.variant}>{config.label}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            </div>
          </div>

          {/* Carrier Logo/Name */}
          <div className="text-right">
            <p className="font-medium text-foreground">
              {formatCarrierName(shipment.provider)}
            </p>
            {shipment.serviceCode && (
              <p className="text-xs text-muted-foreground">
                {shipment.serviceCode}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tracking Information */}
        <div className="grid gap-3 sm:grid-cols-2">
          {shipment.trackingNumber && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Tracking Number
              </p>
              <p className="font-mono text-sm text-muted-foreground">
                {shipment.trackingNumber}
              </p>
            </div>
          )}

          {shipment.estimatedDeliveryDate && shipment.status !== "DELIVERED" && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Estimated Delivery
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(shipment.estimatedDeliveryDate)}
              </p>
            </div>
          )}

          {shipment.deliveredAt && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Delivered</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(shipment.deliveredAt)}
              </p>
            </div>
          )}

          {shipment.shippedAt && shipment.status !== "DELIVERED" && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Shipped</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(shipment.shippedAt)}
              </p>
            </div>
          )}
        </div>

        {/* External Tracking Link */}
        {shipment.trackingUrl && (
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => window.open(shipment.trackingUrl!, "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Track on {formatCarrierName(shipment.provider)}
          </Button>
        )}

        {/* Tracking Timeline */}
        {showTimeline && hasEvents && (
          <div className="pt-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Tracking History ({timelineEvents.length} events)
              </span>
              {isTimelineExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {isTimelineExpanded && (
              <div className="mt-4">
                <TrackingTimeline events={timelineEvents} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * ShipmentCardSkeleton - Loading state for ShipmentCard
 */
export function ShipmentCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="h-5 w-16 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-36 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
