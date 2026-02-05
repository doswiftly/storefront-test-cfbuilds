"use client";

import { useState } from "react";
import { ProductImage, type ProductImageData } from "./product-image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export interface ProductGalleryProps {
  images: ProductImageData[];
  productTitle: string;
  className?: string;
}

/**
 * ProductGallery - Image gallery with zoom and navigation
 * 
 * @example
 * ```tsx
 * <ProductGallery 
 *   images={product.images}
 *   productTitle={product.title}
 * />
 * ```
 */
export function ProductGallery({
  images,
  productTitle,
  className,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const selectedImage = images[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <ProductImage
          image={selectedImage}
          alt={`${productTitle} - Image ${selectedIndex + 1}`}
          fill
          priority={selectedIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />

        {/* Zoom button */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute right-4 top-4 rounded-full bg-background/80 p-2 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-background"
          aria-label="Zoom image"
        >
          <ZoomIn className="h-5 w-5" />
        </button>

        {/* Navigation arrows (if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-sm font-medium text-foreground backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                selectedIndex === index
                  ? "border-primary ring-2 ring-ring ring-offset-2"
                  : "border-border hover:border-primary"
              )}
            >
              <ProductImage
                image={image}
                alt={`${productTitle} - Thumbnail ${index + 1}`}
                fill
                sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 12vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom modal */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent
          className="max-w-7xl p-0"
          onClose={() => setIsZoomed(false)}
        >
          <div className="relative aspect-square w-full overflow-hidden">
            <ProductImage
              image={selectedImage}
              alt={`${productTitle} - Zoomed`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
