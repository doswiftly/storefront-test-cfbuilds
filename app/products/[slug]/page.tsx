import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductClient } from "./product-client";
import { fetchProduct, fetchProducts } from "@/lib/graphql/server";

// ============================================================================
// METADATA GENERATION
// ============================================================================

/**
 * Generate metadata for product pages
 * 
 * Includes:
 * - Title and description for SEO
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - Canonical URL
 * 
 * Requirements: 13.1, 13.3
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    
    if (!resolvedParams?.slug) {
      return {
        title: "Product",
        description: "View product details",
      };
    }
    
    const data = await fetchProduct(resolvedParams.slug);
    const product = data?.product;

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The product you're looking for doesn't exist.",
      };
    }

    // Get first image for Open Graph
    const firstImage = product.images?.[0];
    const price = product.priceRange?.minVariantPrice;

    // Build title with vendor if available
    const title = product.vendor
      ? `${product.title} - ${product.vendor}`
      : product.title;

    // Truncate description for meta tags (155 chars recommended)
    const description =
      product.description?.substring(0, 155) ||
      `Shop ${product.title} at the best price.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: firstImage
          ? [
              {
                url: firstImage.url,
                alt: firstImage.altText || product.title,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: firstImage ? [firstImage.url] : [],
      },
      // Canonical URL (will be completed by Next.js with domain)
      alternates: {
        canonical: `/products/${resolvedParams.slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product",
      description: "View product details",
    };
  }
}

// ============================================================================
// STATIC PARAMS GENERATION
// ============================================================================

/**
 * Generate static params for top products
 * 
 * Pre-renders product pages at build time for better performance.
 * Generates pages for the first 100 products (configurable).
 * 
 * Requirements: 2.2, 6.4
 */
export async function generateStaticParams() {
  try {
    // Fetch top 100 products for static generation
    // Adjust this number based on your catalog size and build time constraints
    const { products } = await fetchProducts({
      first: 100,
      sortKey: "BEST_SELLING",
    });

    return products.map((product: any) => ({
      slug: product.handle,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    // Return empty array to allow dynamic rendering
    return [];
  }
}

// ============================================================================
// PAGE COMPONENT (SERVER COMPONENT)
// ============================================================================

/**
 * Product detail page - Server Component
 * 
 * Fetches product data on the server using base currency for SSG/ISR.
 * Passes initial data to Client Component for hydration and currency switching.
 * 
 * Requirements: 2.2, 3.2, 6.4
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const resolvedParams = await params;
    
    if (!resolvedParams?.slug) {
      notFound();
    }
    
    // Fetch product data on server (base currency)
    const data = await fetchProduct(resolvedParams.slug);
    const product = data?.product;

    if (!product) {
      notFound();
    }

    // Generate JSON-LD structured data for SEO
    const jsonLd = generateProductJsonLd(product);

    return (
      <>
        {/* Structured Data (JSON-LD) - Requirement 13.3 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs className="mb-6" />

          {/* Client component handles interactive features and currency switching */}
          <ProductClient product={product} />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading product:", error);
    notFound();
  }
}

// ============================================================================
// STRUCTURED DATA (JSON-LD)
// ============================================================================

/**
 * Generate Product schema structured data
 * 
 * Helps search engines understand product information:
 * - Product name, description, image
 * - Price and currency
 * - Availability
 * - Brand/vendor
 * 
 * Requirements: 13.3
 * 
 * @see https://schema.org/Product
 */
function generateProductJsonLd(product: any) {
  const firstImage = product.images?.[0];
  const price = product.priceRange?.minVariantPrice;
  const firstVariant = product.variants?.[0];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.title,
    image: firstImage?.url || "",
    brand: product.vendor
      ? {
          "@type": "Brand",
          name: product.vendor,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      price: price?.amount || "0",
      priceCurrency: price?.currencyCode || "USD",
      availability: firstVariant?.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url:
        typeof window !== "undefined"
          ? window.location.href
          : `/products/${product.handle}`,
    },
    sku: product.id,
    productID: product.id,
  };
}

// ============================================================================
// ISR CONFIGURATION
// ============================================================================

/**
 * Enable Incremental Static Regeneration
 * 
 * Revalidate product pages every 60 seconds to keep data fresh
 * while maintaining static generation benefits.
 */
export const revalidate = 60;
