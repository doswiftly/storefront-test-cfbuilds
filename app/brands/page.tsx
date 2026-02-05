"use client";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandGrid, type BrandCardProps } from "@/components/brand/brand-grid";

export default function BrandsPage() {
  // TODO: Fetch brands from backend using GraphQL
  const brands: BrandCardProps[] = [
    {
      id: "1",
      name: "Nike",
      slug: "nike",
      description: "Just Do It - Athletic footwear and apparel",
      logoUrl: "https://via.placeholder.com/200x200?text=Nike",
      productCount: 156,
    },
    {
      id: "2",
      name: "Adidas",
      slug: "adidas",
      description: "Impossible is Nothing - Sports equipment and clothing",
      logoUrl: "https://via.placeholder.com/200x200?text=Adidas",
      productCount: 142,
    },
    {
      id: "3",
      name: "Apple",
      slug: "apple",
      description: "Think Different - Consumer electronics and software",
      logoUrl: "https://via.placeholder.com/200x200?text=Apple",
      productCount: 89,
    },
    {
      id: "4",
      name: "Samsung",
      slug: "samsung",
      description: "Inspire the World, Create the Future",
      logoUrl: "https://via.placeholder.com/200x200?text=Samsung",
      productCount: 124,
    },
    {
      id: "5",
      name: "Sony",
      slug: "sony",
      description: "Be Moved - Electronics and entertainment",
      logoUrl: "https://via.placeholder.com/200x200?text=Sony",
      productCount: 98,
    },
    {
      id: "6",
      name: "Microsoft",
      slug: "microsoft",
      description: "Empowering us all - Software and hardware",
      logoUrl: "https://via.placeholder.com/200x200?text=Microsoft",
      productCount: 67,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">All Brands</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Shop by your favorite brands
        </p>
      </div>

      <BrandGrid brands={brands} />
    </div>
  );
}
