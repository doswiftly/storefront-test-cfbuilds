"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface CollectionCardProps {
  id: string;
  title: string;
  handle: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
  isFeatured?: boolean;
  className?: string;
}

/**
 * CollectionCard - Display card for product collection
 */
export function CollectionCard({
  id,
  title,
  handle,
  description,
  imageUrl,
  productCount,
  isFeatured = false,
  className = "",
}: CollectionCardProps) {
  return (
    <Link href={`/collections/${handle}`} className={`block ${className}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        {/* Collection Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-4xl font-bold text-primary/20">
                {title.charAt(0)}
              </span>
            </div>
          )}

          {/* Featured Badge */}
          {isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge variant="default">Featured</Badge>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Collection Info */}
        <div className="p-5">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>

          {description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {productCount !== undefined && (
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              {productCount} {productCount === 1 ? "product" : "products"}
            </p>
          )}

          <div className="mt-4 flex items-center text-sm font-medium text-primary group-hover:underline">
            Shop Collection
            <svg
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export interface CollectionCardGridProps {
  collections: CollectionCardProps[];
  className?: string;
}

/**
 * CollectionCardGrid - Grid layout for collection cards
 */
export function CollectionCardGrid({
  collections,
  className = "",
}: CollectionCardGridProps) {
  if (collections.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
        <p className="text-muted-foreground">No collections available</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {collections.map((collection) => (
        <CollectionCard key={collection.id} {...collection} />
      ))}
    </div>
  );
}

export interface CollectionHeroProps {
  title: string;
  description?: string;
  imageUrl?: string;
  className?: string;
}

/**
 * CollectionHero - Hero section for collection pages
 */
export function CollectionHero({
  title,
  description,
  imageUrl,
  className = "",
}: CollectionHeroProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Background Image */}
      {imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
        </div>
      )}

      {/* Content */}
      <div
        className={`relative z-10 px-8 py-16 md:px-12 md:py-24 ${
          imageUrl ? "text-white" : "bg-gradient-to-r from-primary/10 to-primary/5"
        }`}
      >
        <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">{title}</h1>
        {description && (
          <p
            className={`mt-4 max-w-2xl text-lg md:text-xl ${
              imageUrl ? "text-white/90" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
