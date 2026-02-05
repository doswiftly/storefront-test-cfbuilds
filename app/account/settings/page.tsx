"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql/client";
import { useAuthStore } from "@/stores/auth-store";
import { CustomerDocument, CustomerUpdateDocument } from "@/generated/graphql";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const { accessToken } = useAuthStore();
  const client = getGraphQLClient();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);

  // Fetch customer data
  const { data: customerData } = useQuery({
    queryKey: ["customer", accessToken],
    queryFn: async () => {
      if (!accessToken) return null;
      return client.request(CustomerDocument, { customerAccessToken: accessToken });
    },
    enabled: !!accessToken,
  });

  // Initialize form with customer data
  useState(() => {
    if (customerData?.customer) {
      setEmail(customerData.customer.email || "");
      setFirstName(customerData.customer.firstName || "");
      setLastName(customerData.customer.lastName || "");
      setPhone(customerData.customer.phone || "");
      setAcceptsMarketing(customerData.customer.acceptsMarketing || false);
    }
  });

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: async (customer: any) => {
      return client.request(CustomerUpdateDocument, {
        customer,
        customerAccessToken: accessToken!,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });
      alert("Settings saved successfully!");
    },
    onError: () => {
      alert("Failed to save settings");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      firstName,
      lastName,
      email,
      phone,
      acceptsMarketing,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />
      
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Account Settings</h1>
        
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new products and special offers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={acceptsMarketing}
                  onChange={(e) => setAcceptsMarketing(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
