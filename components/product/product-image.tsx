"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ProductImageData {
  url: string;
  altText?: string | null;
  width?: number;
  height?: number;
}

export interface ProductImageProps {
  image?: ProductImageData | null;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  objectFit?: "contain" | "cover";
}

/**
 * ProductImage - Optimized product image with Next.js Image
 * 
 * Handles missing images with placeholder
 * Optimizes loading with priority and sizes props
 * 
 * @example
 * ```tsx
 * // Fill container (for cards)
 * <ProductImage 
 *   image={product.featuredImage}
 *   alt={product.title}
 *   fill
 *   priority={index < 4}
 *   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
 * />
 * 
 * // Fixed size (for thumbnails)
 * <ProductImage 
 *   image={variant.image}
 *   alt={variant.title}
 *   width={80}
 *   height={80}
 * />
 * ```
 */
// Placeholder component for missing/failed images
function ImagePlaceholder({
  fill,
  width,
  height,
  className,
}: {
  fill: boolean;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        fill ? "absolute inset-0" : "",
        className
      )}
      style={!fill && width && height ? { width, height } : undefined}
    >
      <svg
        className="h-12 w-12"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
}

export function ProductImage({
  image,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  className,
  objectFit = "cover",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  // Placeholder for missing images or failed loads
  if (!image?.url || hasError) {
    return (
      <ImagePlaceholder
        fill={fill}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  const imageAlt = alt || image.altText || "Product image";

  // Common image props
  const commonProps = {
    src: image.url,
    alt: imageAlt,
    priority,
    className: cn(
      objectFit === "cover" ? "object-cover" : "object-contain",
      className
    ),
    onError: () => setHasError(true),
  };

  if (fill) {
    return (
      <Image
        {...commonProps}
        fill
        sizes={
          sizes ||
          "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
      />
    );
  }

  // Use provided dimensions or image dimensions or defaults
  const imgWidth = width || image.width || 800;
  const imgHeight = height || image.height || 800;

  return (
    <Image
      {...commonProps}
      width={imgWidth}
      height={imgHeight}
      sizes={sizes}
    />
  );
}
