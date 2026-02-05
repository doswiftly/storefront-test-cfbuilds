"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

/**
 * Breadcrumbs component for navigation hierarchy
 * 
 * @example
 * // Auto-generate from pathname
 * <Breadcrumbs />
 * 
 * @example
 * // Custom breadcrumb items
 * <Breadcrumbs items={[
 *   { label: "Products", href: "/products" },
 *   { label: "Electronics", href: "/products/electronics" },
 *   { label: "Laptops", href: "/products/electronics/laptops" }
 * ]} />
 */
export function Breadcrumbs({
  items,
  className,
  showHome = true,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname);

  // Don't show breadcrumbs on homepage
  if (pathname === "/" || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-sm", className)}
    >
      <ol className="flex items-center gap-2">
        {showHome && (
          <li>
            <Link
              href="/"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
          </li>
        )}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-2">
              {(showHome || index > 0) && (
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              )}

              {isLast ? (
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumb items from pathname
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    
    // Format label: remove hyphens, capitalize words
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

/**
 * Helper function to create custom breadcrumb items
 */
export function createBreadcrumbs(...items: BreadcrumbItem[]): BreadcrumbItem[] {
  return items;
}
