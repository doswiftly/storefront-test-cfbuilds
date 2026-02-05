"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Package, MapPin, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AccountMenuProps {
  customerName?: string;
  className?: string;
}

/**
 * AccountMenu - User account dropdown menu
 * 
 * Shows user profile and quick links to account pages
 */
export function AccountMenu({ customerName, className }: AccountMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await fetch("/api/auth/clear-token", { method: "POST" });
    router.push("/");
    setIsOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    {
      label: "My Account",
      href: "/account",
      icon: User,
    },
    {
      label: "Orders",
      href: "/account/orders",
      icon: Package,
    },
    {
      label: "Addresses",
      href: "/account/addresses",
      icon: MapPin,
    },
    {
      label: "Settings",
      href: "/account/settings",
      icon: Settings,
    },
  ];

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        aria-label="Account menu"
        aria-expanded={isOpen}
      >
        <User className="h-5 w-5" />
        {customerName && (
          <span className="hidden md:inline text-sm">{customerName}</span>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-background shadow-lg z-50">
          {/* User Info */}
          {customerName && (
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                {customerName}
              </p>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="border-t border-border py-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
