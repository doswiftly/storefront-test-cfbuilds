"use client";

import { useState } from "react";
import { Truck, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

export interface ShippingEstimatorProps {
  onEstimate: (
    country: string,
    postalCode: string
  ) => Promise<ShippingOption[]>;
  onSelect?: (option: ShippingOption) => void;
  selectedOption?: ShippingOption;
  className?: string;
}

/**
 * ShippingEstimator - Calculate shipping costs
 */
export function ShippingEstimator({
  onEstimate,
  onSelect,
  selectedOption,
  className,
}: ShippingEstimatorProps) {
  const [country, setCountry] = useState("PL");
  const [postalCode, setPostalCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const countries = [
    { value: "PL", label: "Poland" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "GB", label: "United Kingdom" },
    { value: "US", label: "United States" },
  ];

  const handleEstimate = async () => {
    if (!postalCode.trim()) {
      setError("Please enter a postal code");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOptions([]);

    try {
      const result = await onEstimate(country, postalCode.trim());
      setOptions(result);
      
      if (result.length === 0) {
        setError("No shipping options available for this location");
      }
    } catch (err) {
      setError("Failed to calculate shipping");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">
          Estimate Shipping
        </h3>
      </div>

      {/* Form */}
      <div className="space-y-3">
        <Select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          label="Country"
          options={countries}
        />

        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEstimate()}
              disabled={isLoading}
              className="pl-9"
            />
          </div>
          <Button
            onClick={handleEstimate}
            disabled={!postalCode.trim() || isLoading}
          >
            {isLoading ? "Calculating..." : "Calculate"}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Shipping options */}
      {options.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Available shipping options:
          </p>
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => onSelect?.(option)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  selectedOption?.id === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {option.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Estimated delivery: {option.estimatedDays}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {option.price === 0 ? "FREE" : formatPrice(option.price)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
