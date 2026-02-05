import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-4 py-12 text-center',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground max-w-md">{description}</p>
          )}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

/**
 * EmptyCart - Pre-configured empty state for cart
 */
export const EmptyCart: React.FC<{ onContinueShopping?: () => void }> = ({
  onContinueShopping,
}) => {
  return (
    <EmptyState
      icon={
        <svg
          className="h-8 w-8"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      }
      title="Your cart is empty"
      description="Add some products to your cart to get started."
      action={
        onContinueShopping && (
          <button
            onClick={onContinueShopping}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Continue Shopping
          </button>
        )
      }
    />
  );
};

EmptyCart.displayName = 'EmptyCart';

/**
 * EmptyProducts - Pre-configured empty state for product listings
 */
export const EmptyProducts: React.FC<{ onReset?: () => void }> = ({ onReset }) => {
  return (
    <EmptyState
      icon={
        <svg
          className="h-8 w-8"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No products found"
      description="Try adjusting your search or filter criteria to find what you're looking for."
      action={
        onReset && (
          <button
            onClick={onReset}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Clear Filters
          </button>
        )
      }
    />
  );
};

EmptyProducts.displayName = 'EmptyProducts';

/**
 * EmptyOrders - Pre-configured empty state for order history
 */
export const EmptyOrders: React.FC<{ onStartShopping?: () => void }> = ({
  onStartShopping,
}) => {
  return (
    <EmptyState
      icon={
        <svg
          className="h-8 w-8"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      }
      title="No orders yet"
      description="You haven't placed any orders yet. Start shopping to see your order history here."
      action={
        onStartShopping && (
          <button
            onClick={onStartShopping}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Start Shopping
          </button>
        )
      }
    />
  );
};

EmptyOrders.displayName = 'EmptyOrders';

/**
 * EmptyWishlist - Pre-configured empty state for wishlist
 */
export const EmptyWishlist: React.FC<{ onBrowseProducts?: () => void }> = ({
  onBrowseProducts,
}) => {
  return (
    <EmptyState
      icon={
        <svg
          className="h-8 w-8"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      }
      title="Your wishlist is empty"
      description="Save your favorite products to your wishlist for easy access later."
      action={
        onBrowseProducts && (
          <button
            onClick={onBrowseProducts}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Browse Products
          </button>
        )
      }
    />
  );
};

EmptyWishlist.displayName = 'EmptyWishlist';

export { EmptyState };
