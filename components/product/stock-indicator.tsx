import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface StockIndicatorProps {
  available: boolean;
  quantity?: number;
  lowStockThreshold?: number;
  className?: string;
  variant?: "badge" | "text" | "dot";
}

/**
 * StockIndicator - Display stock status (in stock, low stock, out of stock)
 * 
 * @example
 * ```tsx
 * <StockIndicator 
 *   available={variant.available}
 *   quantity={variant.quantityAvailable}
 *   lowStockThreshold={5}
 * />
 * ```
 */
export function StockIndicator({
  available,
  quantity,
  lowStockThreshold = 5,
  className,
  variant = "badge",
}: StockIndicatorProps) {
  const isLowStock = available && quantity !== undefined && quantity <= lowStockThreshold && quantity > 0;
  const isOutOfStock = !available || (quantity !== undefined && quantity === 0);

  const getStatus = () => {
    if (isOutOfStock) {
      return {
        label: "Out of Stock",
        color: "destructive" as const,
        dotColor: "bg-red-500",
      };
    }
    if (isLowStock) {
      return {
        label: `Only ${quantity} left`,
        color: "warning" as const,
        dotColor: "bg-yellow-500",
      };
    }
    return {
      label: "In Stock",
      color: "success" as const,
      dotColor: "bg-green-500",
    };
  };

  const status = getStatus();

  // Badge variant
  if (variant === "badge") {
    return (
      <Badge variant={status.color} className={className}>
        {status.label}
      </Badge>
    );
  }

  // Text variant
  if (variant === "text") {
    return (
      <span
        className={cn(
          "text-sm font-medium",
          isOutOfStock && "text-destructive",
          isLowStock && "text-yellow-600 dark:text-yellow-500",
          !isOutOfStock && !isLowStock && "text-green-600 dark:text-green-500",
          className
        )}
      >
        {status.label}
      </span>
    );
  }

  // Dot variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("h-2 w-2 rounded-full", status.dotColor)} />
      <span className="text-sm text-foreground">{status.label}</span>
    </div>
  );
}
