"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CurrencySelector } from "@/components/commerce/currency-selector";
import { CartIcon } from "@/components/cart/cart-icon";
import { SearchInput } from "@/components/commerce/search-input";
import { Navigation } from "@/components/layout/navigation";
import { AccountMenu } from "@/components/auth/account-menu";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { useAuthStore } from "@/stores/auth-store";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Get authentication state from auth store
  const { isAuthenticated, customer } = useAuthStore();
  const customerName = customer
    ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || customer.email
    : undefined;

  const navigationItems = [
    {
      label: "Products",
      href: "/products",
    },
    {
      label: "Collections",
      href: "/collections",
    },
    {
      label: "Categories",
      href: "/categories",
    },
    {
      label: "About",
      href: "/about",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            {process.env.NEXT_PUBLIC_SITE_NAME || "My Store"}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <Navigation items={navigationItems} />
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden w-64 lg:block">
              <SearchInput placeholder="Search products..." />
            </div>
            
            {/* Currency Selector */}
            <div className="hidden md:block">
              <CurrencySelector variant="compact" />
            </div>
            
            {/* Theme Switcher */}
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>
            
            {/* Account Menu or Login Link */}
            {isAuthenticated ? (
              <AccountMenu customerName={customerName} />
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Sign In
              </Link>
            )}
            
            {/* Cart Icon */}
            <CartIcon />
            
            {/* Mobile Menu Toggle */}
            <button
              className="p-2 text-foreground hover:text-primary md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {/* Mobile Search */}
              <div className="lg:hidden">
                <SearchInput placeholder="Search products..." />
              </div>
              
              {/* Mobile Currency Selector */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Currency</span>
                <CurrencySelector variant="compact" />
              </div>
              
              {/* Mobile Navigation Links */}
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Account Link */}
              {!isAuthenticated && (
                <Link
                  href="/auth/login"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
