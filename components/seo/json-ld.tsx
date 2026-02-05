/**
 * JsonLd Component - Type-safe structured data for SEO
 *
 * Renders JSON-LD structured data in a script tag with proper sanitization.
 * Requirements: 13.3
 */

import type { Thing, WithContext } from "schema-dts";

interface JsonLdProps<T extends Thing> {
  /** Schema.org structured data object */
  data: WithContext<T>;
  /** Optional key for multiple JSON-LD blocks */
  id?: string;
}

/**
 * Sanitize JSON-LD content to prevent XSS attacks
 *
 * Replaces < and > characters with their Unicode equivalents
 * to prevent script injection via malicious data.
 */
function sanitizeJsonLd(json: string): string {
  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");
}

/**
 * JsonLd - Render JSON-LD structured data script tag
 *
 * Features:
 * - Type-safe schema data via schema-dts types
 * - XSS sanitization (< and > character escaping)
 * - Multiple schemas per page support
 * - Server-side rendering compatible
 *
 * Usage:
 * ```tsx
 * <JsonLd data={buildProductJsonLd(product)} />
 * ```
 */
export function JsonLd<T extends Thing>({ data, id }: JsonLdProps<T>) {
  const json = JSON.stringify(data);
  const sanitized = sanitizeJsonLd(json);

  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

export default JsonLd;
