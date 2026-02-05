/**
 * Dynamic Sitemap Generator
 *
 * Generates a sitemap.xml with all products and collections for SEO.
 * Uses ISR to regenerate hourly.
 *
 * Requirements: 13.4
 */

import type { MetadataRoute } from "next";

// ISR revalidation - regenerate sitemap every hour
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

/**
 * Generate sitemap entries for the site
 *
 * Includes:
 * - Homepage (priority 1.0)
 * - Product pages (priority 0.8, daily changes)
 * - Collection pages (priority 0.7, weekly changes)
 * - Category pages (priority 0.6, weekly changes)
 * - Static pages (priority 0.5, monthly changes)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  entries.push({
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  });

  // Static pages
  const staticPages = [
    "/products",
    "/collections",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${SITE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  // Fetch products for sitemap
  try {
    const products = await fetchProductsForSitemap();
    for (const product of products) {
      entries.push({
        url: `${SITE_URL}/products/${product.handle}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error);
  }

  // Fetch collections for sitemap
  try {
    const collections = await fetchCollectionsForSitemap();
    for (const collection of collections) {
      entries.push({
        url: `${SITE_URL}/collections/${collection.handle}`,
        lastModified: collection.updatedAt ? new Date(collection.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Failed to fetch collections for sitemap:", error);
  }

  // Fetch categories for sitemap
  try {
    const categories = await fetchCategoriesForSitemap();
    for (const category of categories) {
      entries.push({
        url: `${SITE_URL}/categories/${category.handle}`,
        lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch (error) {
    console.error("Failed to fetch categories for sitemap:", error);
  }

  return entries;
}

/**
 * Fetch all products with pagination
 * Limits to 10000 products to avoid timeout
 */
async function fetchProductsForSitemap(): Promise<Array<{ handle: string; updatedAt?: string }>> {
  // TODO: Replace with actual GraphQL fetch using server client
  // This is a placeholder that should be connected to the actual GraphQL API
  //
  // Example implementation:
  // const { products } = await fetchProducts({ first: 250 });
  // return products.map(p => ({ handle: p.handle, updatedAt: p.updatedAt }));

  return [];
}

/**
 * Fetch all collections
 */
async function fetchCollectionsForSitemap(): Promise<Array<{ handle: string; updatedAt?: string }>> {
  // TODO: Replace with actual GraphQL fetch using server client
  //
  // Example implementation:
  // const { collections } = await fetchCollections({ first: 100 });
  // return collections.map(c => ({ handle: c.handle, updatedAt: c.updatedAt }));

  return [];
}

/**
 * Fetch all categories
 */
async function fetchCategoriesForSitemap(): Promise<Array<{ handle: string; updatedAt?: string }>> {
  // TODO: Replace with actual GraphQL fetch using server client
  //
  // Example implementation:
  // const { categories } = await fetchCategories({ first: 100 });
  // return categories.map(c => ({ handle: c.handle, updatedAt: c.updatedAt }));

  return [];
}
