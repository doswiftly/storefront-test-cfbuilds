"use client";

import { CheckCircle, Circle, Package, Truck, Home } from "lucide-react";

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location?: string;
  timestamp: string;
  isCompleted: boolean;
}

export interface TrackingTimelineProps {
  events: TrackingEvent[];
  className?: string;
}

/**
 * TrackingTimeline - Display shipment tracking timeline
 */
export function TrackingTimeline({
  events,
  className = "",
}: TrackingTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    const iconClass = isCompleted
      ? "text-green-600"
      : "text-muted-foreground";

    switch (status.toLowerCase()) {
      case "ordered":
      case "processing":
        return <Package className={`h-5 w-5 ${iconClass}`} />;
      case "shipped":
      case "in_transit":
        return <Truck className={`h-5 w-5 ${iconClass}`} />;
      case "delivered":
        return <Home className={`h-5 w-5 ${iconClass}`} />;
      default:
        return isCompleted ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        );
    }
  };

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
        <p className="text-muted-foreground">No tracking information available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-4">
          {/* Timeline Line */}
          {index < events.length - 1 && (
            <div
              className={`absolute left-[10px] top-8 h-full w-0.5 ${
                event.isCompleted ? "bg-green-600" : "bg-border"
              }`}
            />
          )}

          {/* Status Icon */}
          <div
            className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
              event.isCompleted
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-muted"
            }`}
          >
            {getStatusIcon(event.status, event.isCompleted)}
          </div>

          {/* Event Details */}
          <div className="flex-1 pb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  className={`font-semibold ${
                    event.isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {event.status}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    event.isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground/70"
                  }`}
                >
                  {event.description}
                </p>
                {event.location && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    📍 {event.location}
                  </p>
                )}
              </div>
              <time
                className={`text-sm ${
                  event.isCompleted
                    ? "text-muted-foreground"
                    : "text-muted-foreground/70"
                }`}
              >
                {formatDate(event.timestamp)}
              </time>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export interface MilestoneTimelineProps {
  milestones: {
    label: string;
    status: "completed" | "current" | "pending";
    date?: string;
  }[];
  className?: string;
}

/**
 * MilestoneTimeline - Simplified milestone-based tracking
 */
export function MilestoneTimeline({
  milestones,
  className = "",
}: MilestoneTimelineProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {milestones.map((milestone, index) => (
        <div key={index} className="flex flex-1 items-center">
          <div className="flex flex-col items-center">
            {/* Milestone Icon */}
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                milestone.status === "completed"
                  ? "bg-green-600 text-white"
                  : milestone.status === "current"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {milestone.status === "completed" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>

            {/* Milestone Label */}
            <p
              className={`mt-2 text-center text-sm font-medium ${
                milestone.status === "pending"
                  ? "text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {milestone.label}
            </p>

            {/* Milestone Date */}
            {milestone.date && (
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(milestone.date).toLocaleDateString("pl-PL")}
              </p>
            )}
          </div>

          {/* Connecting Line */}
          {index < milestones.length - 1 && (
            <div
              className={`mx-2 h-0.5 flex-1 ${
                milestone.status === "completed" ? "bg-green-600" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
