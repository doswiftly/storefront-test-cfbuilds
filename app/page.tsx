import { HeroSection } from "@/components/home/hero-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CategoryGrid } from "@/components/home/category-grid";
import { NewsletterSignup } from "@/components/home/newsletter-signup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | " + (process.env.NEXT_PUBLIC_SITE_NAME || "My Store"),
  description: "Discover our curated collection of quality products at affordable prices.",
};

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      <HeroSection />
      <FeaturedProducts />
      <CategoryGrid />
      <NewsletterSignup />
    </div>
  );
}
