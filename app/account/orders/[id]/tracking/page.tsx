"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import {
  TrackingTimeline,
  MilestoneTimeline,
  type TrackingEvent,
} from "@/components/order/tracking-timeline";
import { TrackingStatus } from "@/components/order/tracking-status";
import {
  DeliveryEstimate,
  DeliveryProgress,
} from "@/components/order/delivery-estimate";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;

  // TODO: Fetch tracking data from backend using GraphQL
  const trackingData = {
    orderId,
    orderNumber: "#12345",
    status: "in_transit" as const,
    trackingNumber: "1Z999AA10123456784",
    carrier: "UPS",
    estimatedDelivery: "2024-01-20",
    earliestDelivery: "2024-01-19",
    latestDelivery: "2024-01-21",
    lastUpdate: "2024-01-18T14:30:00Z",
    deliveryAddress: {
      city: "Warsaw",
      province: "Mazowieckie",
      country: "Poland",
    },
  };

  const milestones = [
    {
      label: "Order Placed",
      status: "completed" as const,
      date: "2024-01-15",
    },
    {
      label: "Processing",
      status: "completed" as const,
      date: "2024-01-16",
    },
    {
      label: "Shipped",
      status: "completed" as const,
      date: "2024-01-17",
    },
    {
      label: "In Transit",
      status: "current" as const,
    },
    {
      label: "Delivered",
      status: "pending" as const,
    },
  ];

  const events: TrackingEvent[] = [
    {
      id: "1",
      status: "In Transit",
      description: "Package is on the way to the destination",
      location: "Warsaw Distribution Center",
      timestamp: "2024-01-18T14:30:00Z",
      isCompleted: true,
    },
    {
      id: "2",
      status: "In Transit",
      description: "Package arrived at sorting facility",
      location: "Krakow Sorting Facility",
      timestamp: "2024-01-18T08:15:00Z",
      isCompleted: true,
    },
    {
      id: "3",
      status: "Shipped",
      description: "Package has been picked up by carrier",
      location: "Origin Facility",
      timestamp: "2024-01-17T16:45:00Z",
      isCompleted: true,
    },
    {
      id: "4",
      status: "Processing",
      description: "Package is being prepared for shipment",
      location: "Warehouse",
      timestamp: "2024-01-16T10:00:00Z",
      isCompleted: true,
    },
    {
      id: "5",
      status: "Order Placed",
      description: "Order has been confirmed",
      timestamp: "2024-01-15T12:30:00Z",
      isCompleted: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />

      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/account/orders/${orderId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Order Details
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Track Order {trackingData.orderNumber}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Follow your package's journey
        </p>
      </div>

      {/* Milestone Progress */}
      <div className="mb-8">
        <MilestoneTimeline milestones={milestones} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status */}
          <TrackingStatus
            status={trackingData.status}
            trackingNumber={trackingData.trackingNumber}
            carrier={trackingData.carrier}
            lastUpdate={trackingData.lastUpdate}
          />

          {/* Delivery Progress */}
          <DeliveryProgress
            currentStep={4}
            totalSteps={5}
            estimatedDate={trackingData.estimatedDelivery}
          />

          {/* Tracking Timeline */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Tracking History
            </h2>
            <TrackingTimeline events={events} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Delivery Estimate */}
          <DeliveryEstimate
            estimatedDate={trackingData.estimatedDelivery}
            earliestDate={trackingData.earliestDelivery}
            latestDate={trackingData.latestDelivery}
            address={trackingData.deliveryAddress}
          />

          {/* Carrier Information */}
          <div className="rounded-lg border border-border bg-background p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Carrier Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-foreground">Carrier:</span>
                <p className="text-muted-foreground">{trackingData.carrier}</p>
              </div>
              <div>
                <span className="font-medium text-foreground">
                  Tracking Number:
                </span>
                <p className="font-mono text-muted-foreground">
                  {trackingData.trackingNumber}
                </p>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <a
                  href={`https://www.ups.com/track?tracknum=${trackingData.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Track on Carrier Website
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
