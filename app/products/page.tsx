import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Spinner } from "@/components/ui/spinner";
import { ProductsClient } from "./products-client";

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-6" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">All Products</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our complete collection of products
        </p>
      </div>

      <Suspense fallback={<Spinner />}>
        <ProductsClient />
      </Suspense>
    </div>
  );
}
