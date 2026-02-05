"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

export interface BrandCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  productCount?: number;
  className?: string;
}

/**
 * BrandCard - Display card for brand with logo
 */
export function BrandCard({
  id,
  name,
  slug,
  description,
  logoUrl,
  productCount,
  className = "",
}: BrandCardProps) {
  return (
    <Link href={`/brands/${slug}`} className={`block ${className}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        {/* Brand Logo */}
        <div className="relative aspect-square flex items-center justify-center bg-muted p-8">
          {logoUrl ? (
            <div className="relative h-full w-full">
              <Image
                src={logoUrl}
                alt={`${name} logo`}
                fill
                className="object-contain transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-4xl font-bold text-muted-foreground/30">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Brand Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>

          {description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {productCount !== undefined && (
            <p className="mt-2 text-xs text-muted-foreground">
              {productCount} {productCount === 1 ? "product" : "products"}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

export interface BrandLogoProps {
  name: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * BrandLogo - Display brand logo only (for product cards, etc.)
 */
export function BrandLogo({
  name,
  logoUrl,
  size = "md",
  className = "",
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-16",
    md: "h-8 w-24",
    lg: "h-12 w-32",
  };

  if (!logoUrl) {
    return (
      <span
        className={`text-xs font-medium text-muted-foreground ${className}`}
      >
        {name}
      </span>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        fill
        className="object-contain"
        sizes="200px"
      />
    </div>
  );
}
