"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql/client";
import { useAuthStore } from "@/stores/auth-store";
import { CustomerDocument } from "@/generated/graphql";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import {
  OrderDetails,
  type OrderDetailsData,
} from "@/components/account/order-details";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { accessToken } = useAuthStore();
  const client = getGraphQLClient();

  // Fetch customer orders
  const { data: customerData, isLoading } = useQuery({
    queryKey: ["customer", "orders", accessToken],
    queryFn: async () => {
      if (!accessToken) return null;
      return client.request(CustomerDocument, { customerAccessToken: accessToken });
    },
    enabled: !!accessToken,
  });

  // Find specific order
  const order = customerData?.customer?.orders?.edges?.find(
    (edge) => edge.node.id === orderId
  )?.node;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <Link href="/account/orders">
            <Button className="mt-4">Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Transform order data to match OrderDetailsData interface
  const orderDetails: OrderDetailsData = {
    id: order.id,
    orderNumber: order.orderNumber?.toString() || order.id,
    date: new Date(order.processedAt).toLocaleDateString(),
    status: order.fulfillmentStatus?.toLowerCase() || "pending",
    items: order.lineItems.edges.map((edge) => ({
      id: edge.node.variant?.id || edge.node.title,
      title: edge.node.title,
      variantTitle: edge.node.variant?.title || "",
      quantity: edge.node.quantity,
      price: edge.node.originalTotalPrice.amount,
      currency: edge.node.originalTotalPrice.currencyCode,
      imageUrl: edge.node.variant?.image?.url || "",
    })),
    subtotal: order.subtotalPrice?.amount || "0",
    shipping: order.totalShippingPrice?.amount || "0",
    tax: order.totalTax?.amount || "0",
    total: order.totalPrice.amount,
    currency: order.totalPrice.currencyCode,
    shippingAddress: order.shippingAddress
      ? {
          firstName: order.shippingAddress.firstName || "",
          lastName: order.shippingAddress.lastName || "",
          address1: order.shippingAddress.address1 || "",
          address2: order.shippingAddress.address2 || "",
          city: order.shippingAddress.city || "",
          province: order.shippingAddress.province || "",
          zip: order.shippingAddress.zip || "",
          country: order.shippingAddress.country || "",
          phone: order.shippingAddress.phone || "",
        }
      : undefined,
    billingAddress: order.billingAddress
      ? {
          firstName: order.billingAddress.firstName || "",
          lastName: order.billingAddress.lastName || "",
          address1: order.billingAddress.address1 || "",
          address2: order.billingAddress.address2 || "",
          city: order.billingAddress.city || "",
          province: order.billingAddress.province || "",
          zip: order.billingAddress.zip || "",
          country: order.billingAddress.country || "",
          phone: order.billingAddress.phone || "",
        }
      : undefined,
    trackingNumber: order.successfulFulfillments?.[0]?.trackingInfo?.[0]?.number,
    estimatedDelivery: order.successfulFulfillments?.[0]?.estimatedDeliveryAt,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />

      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/account/orders">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <OrderDetails order={orderDetails} />
    </div>
  );
}
