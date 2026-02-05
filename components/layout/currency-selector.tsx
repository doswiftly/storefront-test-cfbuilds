'use client';

/**
 * CurrencySelector - Dropdown for selecting preferred currency
 *
 * This component:
 * 1. Displays current currency with dropdown
 * 2. Shows all supported currencies from Shop data
 * 3. Updates currency store on selection
 * 4. Invalidates React Query cache to trigger refetch with new currency
 *
 * The currency change triggers:
 * - Store update (persisted to localStorage)
 * - Cache invalidation (all queries refetch with new currency header)
 * - UI updates (prices re-render in new currency)
 *
 * @module storefront-nextjs/components/layout/currency-selector
 */

import { useState, useRef, useEffect } from 'react';
import { useCurrencyStore } from '@/stores/currency-store';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Check, Globe } from 'lucide-react';

// ============================================================================
// CURRENCY DATA
// ============================================================================

/**
 * Currency symbols for display
 * Maps currency codes to their symbols
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  PLN: 'zł',
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
  CZK: 'Kč',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

/**
 * Currency names for display
 * Maps currency codes to their full names
 */
const CURRENCY_NAMES: Record<string, string> = {
  PLN: 'Polish Złoty',
  EUR: 'Euro',
  USD: 'US Dollar',
  GBP: 'British Pound',
  CHF: 'Swiss Franc',
  CZK: 'Czech Koruna',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
};

// ============================================================================
// TYPES
// ============================================================================

interface CurrencySelectorProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Show currency symbol instead of code
   * @default false
   */
  showSymbol?: boolean;
  
  /**
   * Show globe icon
   * @default true
   */
  showIcon?: boolean;
  
  /**
   * Visual variant
   * @default 'default'
   */
  variant?: 'default' | 'compact' | 'minimal';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CurrencySelector - Dropdown for selecting preferred currency
 *
 * This component allows users to change their preferred currency.
 * When a currency is selected:
 * 1. The currency store is updated (persisted to localStorage)
 * 2. React Query cache is invalidated
 * 3. All queries refetch with new currency header
 * 4. Prices update throughout the application
 *
 * The component handles:
 * - Hydration mismatches (shows skeleton until loaded)
 * - Keyboard navigation (Escape to close)
 * - Click outside to close
 * - Accessibility (ARIA attributes)
 *
 * @example
 * ```tsx
 * // In Header component
 * import { CurrencySelector } from '@/components/layout/currency-selector';
 *
 * export function Header() {
 *   return (
 *     <header>
 *       <nav>
 *         <CurrencySelector />
 *       </nav>
 *     </header>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Compact variant in mobile menu
 * <CurrencySelector variant="compact" showSymbol />
 * ```
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @param props.showSymbol - Show currency symbol instead of code
 * @param props.showIcon - Show globe icon
 * @param props.variant - Visual variant (default, compact, minimal)
 */
export function CurrencySelector({
  className = '',
  showSymbol = false,
  showIcon = true,
  variant = 'default',
}: CurrencySelectorProps) {
  // Currency store state
  const currency = useCurrencyStore((state) => state.currency);
  const supportedCurrencies = useCurrencyStore((state) => state.supportedCurrencies);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const isLoaded = useCurrencyStore((state) => state.isLoaded);
  
  // React Query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Local state for dropdown
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);
  
  /**
   * Handle currency selection
   * 
   * Updates store and invalidates cache to trigger refetch
   * with new currency header.
   * 
   * @param newCurrency - Selected currency code
   */
  const handleChange = (newCurrency: string) => {
    if (newCurrency === currency) {
      setIsOpen(false);
      return;
    }
    
    // Update store (persists to localStorage)
    setCurrency(newCurrency);
    
    // Invalidate all queries to trigger refetch with new currency
    // This ensures all prices update to the new currency
    queryClient.invalidateQueries();
    
    // Close dropdown
    setIsOpen(false);
  };
  
  // Prevent SSR mismatch - show skeleton until hydrated
  if (!isLoaded || !currency) {
    return (
      <div className={`inline-block ${className}`}>
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-16 h-9" />
      </div>
    );
  }
  
  // Display value (symbol or code)
  const displayValue = showSymbol 
    ? (CURRENCY_SYMBOLS[currency] || currency) 
    : currency;
  
  // Variant-specific styles
  const buttonStyles = {
    default: 'px-3 py-2 text-sm',
    compact: 'px-2 py-1.5 text-xs',
    minimal: 'px-2 py-1 text-xs',
  };
  
  const dropdownStyles = {
    default: 'w-48',
    compact: 'w-40',
    minimal: 'w-36',
  };
  
  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center justify-between gap-2
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-lg
          text-gray-700 dark:text-gray-200
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors
          ${buttonStyles[variant]}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select currency"
      >
        {showIcon && variant !== 'minimal' && (
          <Globe className="w-4 h-4 text-gray-400" aria-hidden="true" />
        )}
        <span className="font-medium">{displayValue}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute right-0 mt-2 z-50
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-lg shadow-lg
            overflow-hidden
            ${dropdownStyles[variant]}
          `}
          role="listbox"
          aria-label="Currency options"
        >
          <div className="py-1 max-h-64 overflow-y-auto">
            {supportedCurrencies.map((code) => {
              const isSelected = code === currency;
              const symbol = CURRENCY_SYMBOLS[code] || code;
              const name = CURRENCY_NAMES[code] || code;
              
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleChange(code)}
                  className={`
                    w-full px-3 py-2 text-left
                    flex items-center justify-between gap-2
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    transition-colors
                    ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center text-gray-400 font-mono text-sm">
                      {symbol}
                    </span>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {code}
                      </span>
                      {variant === 'default' && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {name}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-500" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencySelector;
