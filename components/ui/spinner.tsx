import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-2',
      lg: 'h-12 w-12 border-3',
      xl: 'h-16 w-16 border-4',
    };

    const variantClasses = {
      default: 'border-border border-t-foreground',
      primary: 'border-primary/20 border-t-primary',
      secondary: 'border-secondary/20 border-t-secondary',
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn('inline-block', className)}
        {...props}
      >
        <div
          className={cn(
            'animate-spin rounded-full',
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * SpinnerOverlay - Full-screen loading overlay with spinner
 */
export interface SpinnerOverlayProps {
  visible: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({
  visible,
  message,
  size = 'lg',
}) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4 rounded-lg bg-background p-8 shadow-lg">
        <Spinner size={size} variant="primary" />
        {message && (
          <p className="text-sm font-medium text-foreground">{message}</p>
        )}
      </div>
    </div>
  );
};

SpinnerOverlay.displayName = 'SpinnerOverlay';

export { Spinner, SpinnerOverlay };
