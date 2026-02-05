import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Truck, Package, Clock } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />
      
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold text-foreground">Shipping Information</h1>
        
        <div className="space-y-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Truck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Shipping Methods</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold text-foreground">Standard Shipping</h3>
                <p className="mt-1 text-sm">Delivery in 3-5 business days</p>
                <p className="mt-1 text-sm font-medium">Free on orders over $50</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold text-foreground">Express Shipping</h3>
                <p className="mt-1 text-sm">Delivery in 1-2 business days</p>
                <p className="mt-1 text-sm font-medium">$15.00</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Order Processing</h2>
            </div>
            <p className="text-muted-foreground">
              Orders are processed within 1-2 business days. You will receive a confirmation email with tracking information once your order ships.
            </p>
          </div>
          
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Delivery Times</h2>
            </div>
            <p className="text-muted-foreground">
              Delivery times are estimates and may vary based on your location and shipping method selected. International orders may take longer and are subject to customs processing.
            </p>
          </div>
          
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">International Shipping</h2>
            <p className="text-muted-foreground">
              We ship to most countries worldwide. International shipping rates and delivery times vary by destination. Customs duties and taxes may apply and are the responsibility of the customer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
