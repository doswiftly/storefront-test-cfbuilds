import { useState, useEffect } from "react";

/**
 * useDebouncedValue - Debounce a value
 *
 * @param value - Value to debounce
 * @param delay - Delay in ms (default: 300)
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebouncedValue(query, 300);
 *
 * // debouncedQuery updates 300ms after query stops changing
 * ```
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
