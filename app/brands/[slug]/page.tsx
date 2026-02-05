"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandLogo } from "@/components/brand/brand-card";

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // TODO: Fetch brand and products from backend using GraphQL
  const brand = {
    id: "1",
    name: "Nike",
    slug: "nike",
    description:
      "Nike, Inc. is an American multinational corporation that is engaged in the design, development, manufacturing, and worldwide marketing and sales of footwear, apparel, equipment, accessories, and services.",
    logoUrl: "https://via.placeholder.com/400x200?text=Nike+Logo",
    website: "https://www.nike.com",
    founded: "1964",
    headquarters: "Beaverton, Oregon, USA",
  };

  // TODO: Fetch products for this brand
  const products = [
    {
      id: "1",
      title: "Air Max 90",
      handle: "air-max-90",
      price: "499.99",
      currency: "PLN",
      imageUrl: "https://via.placeholder.com/300x300?text=Product+1",
    },
    {
      id: "2",
      title: "Air Force 1",
      handle: "air-force-1",
      price: "399.99",
      currency: "PLN",
      imageUrl: "https://via.placeholder.com/300x300?text=Product+2",
    },
    {
      id: "3",
      title: "React Infinity",
      handle: "react-infinity",
      price: "599.99",
      currency: "PLN",
      imageUrl: "https://via.placeholder.com/300x300?text=Product+3",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />

      {/* Brand Header */}
      <div className="mb-12 rounded-lg border border-border bg-background p-8">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <div className="relative h-32 w-64 rounded-lg bg-muted p-4">
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={`${brand.name} logo`}
                  fill
                  className="object-contain"
                  sizes="256px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-4xl font-bold text-muted-foreground">
                    {brand.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Brand Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {brand.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {brand.description}
            </p>

            <div className="grid gap-4 text-sm md:grid-cols-3">
              {brand.founded && (
                <div>
                  <span className="font-medium text-foreground">Founded:</span>
                  <p className="text-muted-foreground">{brand.founded}</p>
                </div>
              )}
              {brand.headquarters && (
                <div>
                  <span className="font-medium text-foreground">
                    Headquarters:
                  </span>
                  <p className="text-muted-foreground">{brand.headquarters}</p>
                </div>
              )}
              {brand.website && (
                <div>
                  <span className="font-medium text-foreground">Website:</span>
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-6">
          Products by {brand.name}
        </h2>

        {products.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
            <p className="text-muted-foreground">
              No products available from this brand
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.handle}`}
                className="group rounded-lg border border-border bg-background overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-lg font-bold text-foreground">
                    {new Intl.NumberFormat("pl-PL", {
                      style: "currency",
                      currency: product.currency,
                    }).format(parseFloat(product.price))}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
