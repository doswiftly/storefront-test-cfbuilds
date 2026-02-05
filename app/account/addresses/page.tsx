"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  CustomerDocument,
  CustomerAddressCreateDocument,
  CustomerAddressUpdateDocument,
  CustomerAddressDeleteDocument,
  CustomerDefaultAddressUpdateDocument,
} from "@/generated/graphql";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import {
  AddressList,
  type Address,
} from "@/components/account/address-list";
import {
  AddressForm,
  type AddressFormData,
} from "@/components/account/address-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AddressesPage() {
  const client = getGraphQLClient();
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  // Fetch customer with addresses
  const { data: customerData, isLoading } = useQuery({
    queryKey: ["customer", "addresses", accessToken],
    queryFn: async () => {
      if (!accessToken) return null;
      const result = await client.request(CustomerDocument, {
        customerAccessToken: accessToken,
      });
      return result.customer;
    },
    enabled: !!accessToken,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>();

  // Delete address mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return client.request(CustomerAddressDeleteDocument, {
        id,
        customerAccessToken: accessToken!,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
    },
  });

  // Set default address mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (addressId: string) => {
      return client.request(CustomerDefaultAddressUpdateDocument, {
        addressId,
        customerAccessToken: accessToken!,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
    },
  });

  // Create/Update address mutation
  const saveMutation = useMutation({
    mutationFn: async ({
      id,
      address,
    }: {
      id?: string;
      address: any;
    }) => {
      if (id) {
        return client.request(CustomerAddressUpdateDocument, {
          id,
          address,
          customerAccessToken: accessToken!,
        });
      } else {
        return client.request(CustomerAddressCreateDocument, {
          address,
          customerAccessToken: accessToken!,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
      setIsFormOpen(false);
    },
  });

  const addresses = customerData?.addresses?.edges?.map((edge) => ({
    id: edge.node.id,
    firstName: edge.node.firstName || "",
    lastName: edge.node.lastName || "",
    company: edge.node.company || "",
    address1: edge.node.address1 || "",
    address2: edge.node.address2 || "",
    city: edge.node.city || "",
    province: edge.node.province || "",
    zip: edge.node.zip || "",
    country: edge.node.country || "",
    phone: edge.node.phone || "",
    isDefault: edge.node.id === customerData?.defaultAddress?.id,
  })) || [];

  const handleAdd = () => {
    setEditingAddress(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const handleSubmit = async (data: AddressFormData) => {
    const address = {
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company || null,
      address1: data.address1,
      address2: data.address2 || null,
      city: data.city,
      province: data.province,
      zip: data.zip,
      country: data.country,
      phone: data.phone || null,
    };

    await saveMutation.mutateAsync({
      id: editingAddress?.id,
      address,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Addresses</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your shipping and billing addresses
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      <AddressList
        addresses={addresses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSetDefault={handleSetDefault}
        onAdd={handleAdd}
      />

      {/* Address Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            address={editingAddress}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
