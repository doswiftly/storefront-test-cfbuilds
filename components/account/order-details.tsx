"use client";

import { Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface OrderItem {
  id: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: string;
  currency: string;
  imageUrl?: string;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface OrderDetailsData {
  id: string;
  orderNumber: string;
  date: string;
  status: "delivered" | "shipped" | "processing" | "cancelled";
  items: OrderItem[];
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  currency: string;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface OrderDetailsProps {
  order: OrderDetailsData;
  className?: string;
}

/**
 * OrderDetails - Display detailed information about a single order
 */
export function OrderDetails({ order, className }: OrderDetailsProps) {
  const getStatusIcon = (status: OrderDetailsData["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "processing":
        return <Package className="h-5 w-5 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: OrderDetailsData["status"]) => {
    const variants: Record<
      OrderDetailsData["status"],
      "default" | "secondary" | "success" | "warning"
    > = {
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

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency,
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (address: OrderAddress) => {
    return (
      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">
          {address.firstName} {address.lastName}
        </p>
        {address.company && (
          <p className="text-muted-foreground">{address.company}</p>
        )}
        <p className="text-muted-foreground">{address.address1}</p>
        {address.address2 && (
          <p className="text-muted-foreground">{address.address2}</p>
        )}
        <p className="text-muted-foreground">
          {address.city}, {address.province} {address.zip}
        </p>
        <p className="text-muted-foreground">{address.country}</p>
        {address.phone && (
          <p className="text-muted-foreground">{address.phone}</p>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Order Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Order {order.orderNumber}
            </h2>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            {getStatusBadge(order.status)}
          </div>
        </div>

        {order.trackingNumber && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-1">
              Tracking Number
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              {order.trackingNumber}
            </p>
          </div>
        )}

        {order.estimatedDelivery && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-1">
              Estimated Delivery
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.estimatedDelivery)}
            </p>
          </div>
        )}
      </Card>

      {/* Order Items */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Order Items
        </h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              {item.imageUrl && (
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{item.title}</h4>
                {item.variantTitle && (
                  <p className="text-sm text-muted-foreground">
                    {item.variantTitle}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">
                  {formatPrice(item.price, item.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">
              {formatPrice(order.subtotal, order.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-foreground">
              {formatPrice(order.shipping, order.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="text-foreground">
              {formatPrice(order.tax, order.currency)}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">
              {formatPrice(order.total, order.currency)}
            </span>
          </div>
        </div>
      </Card>

      {/* Addresses */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Shipping Address
          </h3>
          {formatAddress(order.shippingAddress)}
        </Card>

        {order.billingAddress && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Billing Address
            </h3>
            {formatAddress(order.billingAddress)}
          </Card>
        )}
      </div>
    </div>
  );
}
