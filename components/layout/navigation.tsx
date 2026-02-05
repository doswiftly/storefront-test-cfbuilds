"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

export interface NavigationProps {
  items?: NavigationItem[];
  className?: string;
}

const defaultItems: NavigationItem[] = [
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

export function Navigation({ items = defaultItems, className }: NavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn("flex items-center gap-6", className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {items.map((item) => (
        <div key={item.href} className="relative group">
          <Link
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive(item.href)
                ? "text-primary"
                : "text-muted-foreground"
            )}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>

          {/* Dropdown for nested items */}
          {item.children && item.children.length > 0 && (
            <div className="absolute left-0 top-full hidden pt-2 group-hover:block">
              <div className="rounded-md border border-border bg-background p-2 shadow-lg">
                <div className="flex flex-col gap-0">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive(child.href)
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
