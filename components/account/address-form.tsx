"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export interface AddressFormData {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface AddressFormProps {
  address?: AddressFormData;
  onSubmit: (data: AddressFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * AddressForm - Form for adding or editing customer addresses
 */
export function AddressForm({
  address,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>(
    address || {
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      address2: "",
      city: "",
      province: "",
      zip: "",
      country: "Poland",
      phone: "",
      isDefault: false,
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.address1.trim()) {
      newErrors.address1 = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.province.trim()) {
      newErrors.province = "Province/State is required";
    }
    if (!formData.zip.trim()) {
      newErrors.zip = "Postal code is required";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <Card className={`p-6 ${className || ""}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-foreground mb-1"
            >
              First Name *
            </label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              disabled={isLoading}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Last Name *
            </label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              disabled={isLoading}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Company */}
        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Company (optional)
          </label>
          <Input
            id="company"
            type="text"
            value={formData.company || ""}
            onChange={(e) => handleChange("company", e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Address 1 */}
        <div>
          <label
            htmlFor="address1"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Address *
          </label>
          <Input
            id="address1"
            type="text"
            value={formData.address1}
            onChange={(e) => handleChange("address1", e.target.value)}
            disabled={isLoading}
            className={errors.address1 ? "border-red-500" : ""}
          />
          {errors.address1 && (
            <p className="mt-1 text-sm text-red-600">{errors.address1}</p>
          )}
        </div>

        {/* Address 2 */}
        <div>
          <label
            htmlFor="address2"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Apartment, suite, etc. (optional)
          </label>
          <Input
            id="address2"
            type="text"
            value={formData.address2 || ""}
            onChange={(e) => handleChange("address2", e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-foreground mb-1"
            >
              City *
            </label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              disabled={isLoading}
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          {/* Province */}
          <div>
            <label
              htmlFor="province"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Province/State *
            </label>
            <Input
              id="province"
              type="text"
              value={formData.province}
              onChange={(e) => handleChange("province", e.target.value)}
              disabled={isLoading}
              className={errors.province ? "border-red-500" : ""}
            />
            {errors.province && (
              <p className="mt-1 text-sm text-red-600">{errors.province}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label
              htmlFor="zip"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Postal Code *
            </label>
            <Input
              id="zip"
              type="text"
              value={formData.zip}
              onChange={(e) => handleChange("zip", e.target.value)}
              disabled={isLoading}
              className={errors.zip ? "border-red-500" : ""}
            />
            {errors.zip && (
              <p className="mt-1 text-sm text-red-600">{errors.zip}</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Country *
          </label>
          <Input
            id="country"
            type="text"
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            disabled={isLoading}
            className={errors.country ? "border-red-500" : ""}
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Phone (optional)
          </label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Default Address Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="isDefault"
            type="checkbox"
            checked={formData.isDefault || false}
            onChange={(e) => handleChange("isDefault", e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <label
            htmlFor="isDefault"
            className="text-sm font-medium text-foreground"
          >
            Set as default address
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Saving..." : address ? "Update Address" : "Add Address"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
