"use client";

import { useState, useEffect } from "react";
import { Clock, Flame } from "lucide-react";

export interface SaleCountdownProps {
  endDate: string;
  onExpire?: () => void;
  showIcon?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * SaleCountdown - Countdown timer for sales and limited offers
 */
export function SaleCountdown({
  endDate,
  onExpire,
  showIcon = true,
  compact = false,
  className = "",
}: SaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        onExpire?.();
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  if (isExpired) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground ${className}`}
      >
        <Clock className="h-4 w-4" />
        <span>Sale Ended</span>
      </div>
    );
  }

  if (!timeLeft) {
    return null;
  }

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-md bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-sm font-semibold text-red-600 ${className}`}
      >
        {showIcon && <Flame className="h-4 w-4" />}
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, "0")}:
          {String(timeLeft.minutes).padStart(2, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4 ${className}`}
    >
      <div className="mb-3 flex items-center gap-2 text-red-600">
        {showIcon && <Flame className="h-5 w-5" />}
        <span className="font-semibold">Sale Ends In:</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        <TimeUnit value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
}

interface TimeUnitProps {
  value: number;
  label: string;
}

function TimeUnit({ value, label }: TimeUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-12 w-full items-center justify-center rounded-md bg-white dark:bg-gray-800 text-2xl font-bold text-foreground">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1 text-xs font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export interface FlashSaleBannerProps {
  endDate: string;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * FlashSaleBanner - Prominent banner for flash sales
 */
export function FlashSaleBanner({
  endDate,
  title = "Flash Sale",
  description = "Limited time offer - Don't miss out!",
  className = "",
}: FlashSaleBannerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
      </div>

      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>

        <p className="mb-6 text-white/90">{description}</p>

        <SaleCountdown endDate={endDate} showIcon={false} />
      </div>
    </div>
  );
}
