"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, MapPin, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AccountPage() {
  const router = useRouter();

  const handleLogout = async () => {
    // Clear token via API route
    await fetch("/api/auth/clear-token", { method: "POST" });
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Account</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account settings and orders
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Profile</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              View and edit your profile information
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/account/settings">Edit Profile</Link>
            </Button>
          </Card>

          {/* Orders Card */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Orders</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              View your order history and track shipments
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/account/orders">View Orders</Link>
            </Button>
          </Card>

          {/* Addresses Card */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Addresses
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your shipping and billing addresses
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/account/addresses">Manage Addresses</Link>
            </Button>
          </Card>

          {/* Settings Card */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Settings
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Update your account preferences
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/account/settings">Account Settings</Link>
            </Button>
          </Card>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <Button variant="destructive" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
