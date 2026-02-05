"use client";

import { MapPin, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface Address {
  id: string;
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
  isDefault: boolean;
}

export interface AddressListProps {
  addresses: Address[];
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  onAdd?: () => void;
  className?: string;
}

/**
 * AddressList - Display list of saved customer addresses
 */
export function AddressList({
  addresses,
  onEdit,
  onDelete,
  onSetDefault,
  onAdd,
  className,
}: AddressListProps) {
  const handleDelete = (id: string, address: Address) => {
    if (
      confirm(
        `Are you sure you want to delete the address at ${address.address1}?`
      )
    ) {
      onDelete?.(id);
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
        <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          No addresses saved
        </h2>
        <p className="text-muted-foreground mb-6">
          Add an address to make checkout faster
        </p>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Address
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id} className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                {address.isDefault && <Badge variant="default">Default</Badge>}
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(address)}
                    aria-label="Edit address"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(address.id, address)}
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">
                {address.firstName} {address.lastName}
              </p>
              {address.company && (
                <p className="text-muted-foreground">{address.company}</p>
              )}
              <p className="text-muted-foreground">{address.address1}</p>
              {address.address2 && (
                <p className="text-muted-foreground">{address.address2}</p>
              )}
              <p className="text-muted-foreground">
                {address.city}, {address.province} {address.zip}
              </p>
              <p className="text-muted-foreground">{address.country}</p>
              {address.phone && (
                <p className="text-muted-foreground">{address.phone}</p>
              )}
            </div>

            {!address.isDefault && onSetDefault && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => onSetDefault(address.id)}
              >
                Set as Default
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
