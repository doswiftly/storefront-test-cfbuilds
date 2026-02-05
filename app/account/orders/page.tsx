"use client";

import { useQuery } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql/client";
import { useAuthStore } from "@/stores/auth-store";
import { CustomerDocument } from "@/generated/graphql";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { OrderHistory, type Order } from "@/components/account/order-history";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
  const client = getGraphQLClient();
  const { accessToken, isAuthenticated } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["customer", "orders", accessToken],
    queryFn: async () => {
      if (!accessToken) return null;
      const result = await client.request(CustomerDocument, {
        customerAccessToken: accessToken,
      });
      return result.customer;
    },
    enabled: isAuthenticated && !!accessToken,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-800">Failed to load orders</p>
        </div>
      </div>
    );
  }

  const orders: Order[] =
    data?.orders?.edges.map((edge) => ({
      id: edge.node.id,
      orderNumber: edge.node.orderNumber,
      date: edge.node.createdAt,
      status: (edge.node.fulfillmentStatus || "processing") as Order["status"],
      total: edge.node.totalPrice.amount,
      currency: edge.node.totalPrice.currencyCode,
      itemCount: edge.node.lineItems?.edges.length || 0,
    })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Order History</h1>
        <p className="mt-2 text-muted-foreground">
          View and track your orders
        </p>
      </div>

      <OrderHistory orders={orders} />
    </div>
  );
}
