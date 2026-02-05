"use client";

import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/format";

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "delivered" | "shipped" | "processing" | "cancelled";
  total: string;
  currency: string;
  itemCount: number;
}

export interface OrderHistoryProps {
  orders: Order[];
  className?: string;
}

/**
 * OrderHistory - Display list of customer orders
 */
export function OrderHistory({ orders, className }: OrderHistoryProps) {
  const getStatusBadge = (status: Order["status"]) => {
    const variants: Record<Order["status"], "default" | "secondary" | "success" | "warning"> = {
      delivered: "success",
      shipped: "default",
      processing: "warning",
      cancelled: "secondary",
    };

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          No orders yet
        </h2>
        <p className="text-muted-foreground mb-6">
          Start shopping to see your orders here
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="block rounded-lg border border-border bg-background p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Order {order.orderNumber}
                  </h3>
                  {getStatusBadge(order.status)}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Placed on {formatDate(order.date)}</p>
                  <p>
                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatAmount(order.total, order.currency)}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
