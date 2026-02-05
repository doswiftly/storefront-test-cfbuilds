/**
 * robots.txt Configuration
 *
 * Controls search engine crawler access to the site.
 *
 * Requirements: 13.5
 */

import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

/**
 * Generate robots.txt rules
 *
 * Allows:
 * - All public pages (products, collections, categories)
 *
 * Disallows:
 * - API routes (/api/*)
 * - Checkout pages (/checkout/*)
 * - Account pages (/account/*)
 * - Admin routes (/admin/*)
 * - Cart page (/cart)
 * - Auth pages (/auth/*)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/checkout/",
          "/account/",
          "/admin/",
          "/cart",
          "/auth/",
          "/_next/",
          "/private/",
        ],
      },
      // Block bad bots explicitly
      {
        userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai"],
        disallow: ["/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
