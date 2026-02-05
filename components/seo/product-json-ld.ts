/**
 * Product JSON-LD Builder - Schema.org Product structured data
 *
 * Builds type-safe Product schema for SEO rich results.
 * Requirements: 13.3
 */

import type { Product, WithContext, Offer } from "schema-dts";

/**
 * Product data input interface
 * Matches the ProductFragment from GraphQL
 */
interface ProductData {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  descriptionHtml?: string | null;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  images?: Array<{
    url: string;
    altText?: string | null;
  }> | null;
  variants?: Array<{
    id: string;
    sku?: string | null;
    title?: string | null;
    price: {
      amount: string;
      currencyCode: string;
    };
    compareAtPrice?: {
      amount: string;
      currencyCode: string;
    } | null;
    availableForSale?: boolean;
    quantityAvailable?: number | null;
  }> | null;
  brand?: {
    name: string;
  } | null;
  vendor?: string | null;
  seo?: {
    title?: string | null;
    description?: string | null;
  } | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

interface BuildProductJsonLdOptions {
  /** Base URL for the site (e.g., https://example.com) */
  siteUrl: string;
  /** Organization/shop name */
  organizationName?: string;
}

/**
 * Build JSON-LD Product schema from product data
 *
 * @param product - Product data from GraphQL
 * @param options - Configuration options
 * @returns Schema.org Product with context
 */
export function buildProductJsonLd(
  product: ProductData,
  options: BuildProductJsonLdOptions
): WithContext<Product> {
  const { siteUrl, organizationName } = options;
  const productUrl = `${siteUrl}/products/${product.handle}`;

  // Get the first variant for pricing info
  const firstVariant = product.variants?.[0];

  // Build offer(s) from variants
  const offers: Offer[] = (product.variants || []).slice(0, 10).map((variant) => ({
    "@type": "Offer",
    url: productUrl,
    priceCurrency: variant.price.currencyCode,
    price: variant.price.amount,
    availability: variant.availableForSale
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    ...(variant.sku && { sku: variant.sku }),
    ...(variant.title && variant.title !== "Default Title" && { name: variant.title }),
  }));

  // Build image array
  const images = [
    product.featuredImage?.url,
    ...(product.images?.map((img) => img.url) || []),
  ].filter((url): url is string => Boolean(url));

  // Build the Product schema
  const schema: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    url: productUrl,
    ...(product.description && { description: product.description }),
    ...(images.length > 0 && { image: images }),
    ...(firstVariant?.sku && { sku: firstVariant.sku }),
    ...(product.brand?.name && {
      brand: {
        "@type": "Brand",
        name: product.brand.name,
      },
    }),
    ...(product.vendor && !product.brand?.name && {
      brand: {
        "@type": "Brand",
        name: product.vendor,
      },
    }),
    ...(offers.length > 0 && {
      offers: offers.length === 1 ? offers[0] : offers,
    }),
  };

  return schema;
}

/**
 * Build JSON-LD BreadcrumbList schema
 */
export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
  siteUrl: string
) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}

/**
 * Build JSON-LD Organization schema
 */
export function buildOrganizationJsonLd(options: {
  name: string;
  siteUrl: string;
  logo?: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org" as const,
    "@type": "Organization" as const,
    name: options.name,
    url: options.siteUrl,
    ...(options.logo && { logo: options.logo }),
    ...(options.description && { description: options.description }),
  };
}

export default buildProductJsonLd;
