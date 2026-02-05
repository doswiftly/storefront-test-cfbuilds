"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ProductQuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * ProductQuantitySelector - Quantity input with +/- buttons
 * 
 * @example
 * ```tsx
 * const [quantity, setQuantity] = useState(1);
 * 
 * <ProductQuantitySelector
 *   value={quantity}
 *   onChange={setQuantity}
 *   min={1}
 *   max={10}
 * />
 * ```
 */
export function ProductQuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
}: ProductQuantitySelectorProps) {
  const [inputValue, setInputValue] = useState((value ?? 1).toString());

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Parse and validate
    const parsed = parseInt(newValue, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  const handleInputBlur = () => {
    // Ensure input shows valid value on blur
    setInputValue(value.toString());
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="h-10 w-10 p-0"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        min={min}
        max={max}
        className="h-10 w-16 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Quantity"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="h-10 w-10 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
