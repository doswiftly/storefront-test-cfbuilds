"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileMenuItem {
  label: string;
  href: string;
  children?: MobileMenuItem[];
}

export interface MobileMenuProps {
  items?: MobileMenuItem[];
  className?: string;
}

const defaultItems: MobileMenuItem[] = [
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

export function MobileMenu({ items = defaultItems, className }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleExpanded = (href: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const renderMenuItem = (item: MobileMenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.href);
    const active = isActive(item.href);

    return (
      <div key={item.href}>
        <div
          className={cn(
            "flex items-center justify-between",
            level > 0 && "ml-4"
          )}
        >
          <Link
            href={item.href}
            className={cn(
              "flex-1 py-3 text-base font-medium transition-colors",
              active
                ? "text-primary"
                : "text-foreground hover:text-primary"
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>

          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleExpanded(item.href);
              }}
              className="p-3 text-muted-foreground hover:text-foreground"
              aria-label={`Toggle ${item.label} submenu`}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l-2 border-border pl-2">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-center rounded-md p-2",
          "text-foreground hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div
            id="mobile-menu"
            className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-background shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label="Close mobile menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {items.map((item) => renderMenuItem(item))}
                </div>
              </nav>

              {/* Footer */}
              <div className="border-t border-border p-4">
                <div className="flex flex-col gap-2">
                  <Link
                    href="/account"
                    className="rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/cart"
                    className="rounded-md border border-border px-4 py-2 text-center text-sm font-medium hover:bg-accent"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
