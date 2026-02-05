import { gql } from 'graphql-tag';

/**
 * Example: Custom GraphQL query for featured products
 * 
 * This file demonstrates how to write custom GraphQL queries
 * that will be picked up by codegen and generate TypeScript types.
 * 
 * To use this example:
 * 1. Rename this file from products.example.ts to products.ts
 * 2. Run `pnpm run codegen` to generate types
 * 3. Import the generated query in your components
 */

// Example 1: Get featured products with specific fields
export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts($first: Int = 6) {
    products(first: $first, query: "tag:featured") {
      edges {
        node {
          id
          handle
          title
          description
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Example 2: Get product with reviews
export const GET_PRODUCT_WITH_REVIEWS = gql`
  query GetProductWithReviews($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      descriptionHtml
      averageRating
      reviewCount
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
          baseAmount
          baseCurrencyCode
          isConverted
        }
      }
      variants(first: 10) {
        id
        title
        price {
          amount
          currencyCode
        }
        available
        quantityAvailable
      }
    }
  }
`;

// Example 3: Search products with filters
export const SEARCH_PRODUCTS_WITH_FILTERS = gql`
  query SearchProductsWithFilters(
    $query: String!
    $first: Int = 20
    $after: String
    $filters: ProductFilterInput
  ) {
    products(
      query: $query
      first: $first
      after: $after
      filters: $filters
    ) {
      edges {
        node {
          id
          handle
          title
          vendor
          productType
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

/**
 * Usage in components:
 * 
 * // Server Component
 * import { getClient } from '@/lib/graphql/server';
 * import { GetFeaturedProductsDocument } from '@/generated/graphql';
 * 
 * const client = getClient();
 * const { products } = await client.request(GetFeaturedProductsDocument, { first: 6 });
 * 
 * // Client Component
 * import { useQuery } from '@tanstack/react-query';
 * import { getGraphQLClient } from '@/lib/graphql/client';
 * import { GetFeaturedProductsDocument } from '@/generated/graphql';
 * 
 * const client = getGraphQLClient();
 * const { data } = useQuery({
 *   queryKey: ['FeaturedProducts'],
 *   queryFn: () => client.request(GetFeaturedProductsDocument, { first: 6 }),
 * });
 */
