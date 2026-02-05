import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  className?: string;
}

const AccordionContext = React.createContext<{
  value: string | string[];
  onValueChange: (value: string) => void;
  type: 'single' | 'multiple';
} | null>(null);

const Accordion: React.FC<AccordionProps> = ({
  type = 'single',
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}) => {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    defaultValue || (type === 'multiple' ? [] : '')
  );
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (itemValue: string) => {
    let newValue: string | string[];

    if (type === 'multiple') {
      const currentArray = Array.isArray(value) ? value : [];
      newValue = currentArray.includes(itemValue)
        ? currentArray.filter((v) => v !== itemValue)
        : [...currentArray, itemValue];
    } else {
      newValue = value === itemValue ? '' : itemValue;
    }

    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <AccordionContext.Provider value={{ value, onValueChange: handleValueChange, type }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
};

Accordion.displayName = 'Accordion';

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, ...props }, ref) => (
    <div
      ref={ref}
      data-value={value}
      className={cn('border-b border-border', className)}
      {...props}
    />
  )
);

AccordionItem.displayName = 'AccordionItem';

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    if (!context) throw new Error('AccordionTrigger must be used within Accordion');

    const isOpen = Array.isArray(context.value)
      ? context.value.includes(value)
      : context.value === value;

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => context.onValueChange(value)}
        aria-expanded={isOpen}
        className={cn(
          'flex w-full items-center justify-between py-4 font-medium transition-all',
          'hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className
        )}
        {...props}
      >
        {children}
        <svg
          className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    );
  }
);

AccordionTrigger.displayName = 'AccordionTrigger';

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    if (!context) throw new Error('AccordionContent must be used within Accordion');

    const isOpen = Array.isArray(context.value)
      ? context.value.includes(value)
      : context.value === value;

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        role="region"
        className={cn('overflow-hidden text-sm transition-all', className)}
        {...props}
      >
        <div className="pb-4 pt-0">{children}</div>
      </div>
    );
  }
);

AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
