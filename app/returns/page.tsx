import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RotateCcw, CheckCircle, XCircle } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />
      
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold text-foreground">Returns & Refunds</h1>
        
        <div className="space-y-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <RotateCcw className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Return Policy</h2>
            </div>
            <p className="text-muted-foreground">
              We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within 30 days of delivery for a full refund.
            </p>
          </div>
          
          <div>
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-semibold text-foreground">Eligible Returns</h2>
            </div>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>Items must be unused and in original condition</li>
              <li>Items must be in original packaging</li>
              <li>Return within 30 days of delivery</li>
              <li>Include proof of purchase</li>
            </ul>
          </div>
          
          <div>
            <div className="mb-4 flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-semibold text-foreground">Non-Returnable Items</h2>
            </div>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>Personalized or custom-made items</li>
              <li>Perishable goods</li>
              <li>Intimate or sanitary goods</li>
              <li>Sale or clearance items</li>
            </ul>
          </div>
          
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">How to Return</h2>
            <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
              <li>Contact our customer service team to initiate a return</li>
              <li>Pack the item securely in its original packaging</li>
              <li>Include your order number and reason for return</li>
              <li>Ship the package to the address provided</li>
              <li>Refund will be processed within 5-7 business days after we receive your return</li>
            </ol>
          </div>
          
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Refund Policy</h2>
            <p className="text-muted-foreground">
              Once we receive and inspect your return, we'll send you an email notification. If approved, your refund will be processed and automatically applied to your original payment method within 5-7 business days.
            </p>
          </div>
          
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Exchanges</h2>
            <p className="text-muted-foreground">
              We only replace items if they are defective or damaged. If you need to exchange an item, contact our customer service team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
