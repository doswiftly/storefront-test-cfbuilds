"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface DeliveryEstimateProps {
  estimatedDate: string;
  earliestDate?: string;
  latestDate?: string;
  address?: {
    city: string;
    province: string;
    country: string;
  };
  className?: string;
}

/**
 * DeliveryEstimate - Display estimated delivery date
 */
export function DeliveryEstimate({
  estimatedDate,
  earliestDate,
  latestDate,
  address,
  className = "",
}: DeliveryEstimateProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const target = new Date(dateString);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntil(estimatedDate);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start gap-4">
        {/* Calendar Icon */}
        <div className="rounded-full bg-primary/10 p-3">
          <Calendar className="h-6 w-6 text-primary" />
        </div>

        {/* Delivery Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Estimated Delivery
          </h3>

          {/* Primary Estimate */}
          <div className="mb-4">
            <p className="text-2xl font-bold text-foreground">
              {formatDate(estimatedDate)}
            </p>
            {daysUntil >= 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {daysUntil === 0
                  ? "Arriving today"
                  : daysUntil === 1
                  ? "Arriving tomorrow"
                  : `Arriving in ${daysUntil} days`}
              </p>
            )}
          </div>

          {/* Date Range */}
          {earliestDate && latestDate && (
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Expected between {formatShortDate(earliestDate)} and{" "}
                {formatShortDate(latestDate)}
              </span>
            </div>
          )}

          {/* Delivery Address */}
          {address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Delivering to {address.city}, {address.province},{" "}
                {address.country}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export interface DeliveryWindowProps {
  date: string;
  startTime?: string;
  endTime?: string;
  className?: string;
}

/**
 * DeliveryWindow - Display specific delivery time window
 */
export function DeliveryWindow({
  date,
  startTime,
  endTime,
  className = "",
}: DeliveryWindowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className={`rounded-lg border border-border bg-muted/50 p-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-primary" />
        <div>
          <p className="font-medium text-foreground">{formatDate(date)}</p>
          {startTime && endTime && (
            <p className="text-sm text-muted-foreground">
              Between {startTime} and {endTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export interface DeliveryProgressProps {
  currentStep: number;
  totalSteps: number;
  estimatedDate: string;
  className?: string;
}

/**
 * DeliveryProgress - Visual progress indicator for delivery
 */
export function DeliveryProgress({
  currentStep,
  totalSteps,
  estimatedDate,
  className = "",
}: DeliveryProgressProps) {
  const progress = (currentStep / totalSteps) * 100;
  const daysUntil = Math.ceil(
    (new Date(estimatedDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-muted-foreground">
          {daysUntil > 0 ? `${daysUntil} days remaining` : "Arriving today"}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
