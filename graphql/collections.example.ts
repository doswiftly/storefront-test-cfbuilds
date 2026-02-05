import { gql } from 'graphql-tag';

/**
 * Example: Custom GraphQL query for collections
 * 
 * This file demonstrates how to write custom GraphQL queries for collections
 * that will be picked up by codegen and generate TypeScript types.
 * 
 * To use this example:
 * 1. Rename this file from collections.example.ts to collections.ts
 * 2. Run `pnpm run codegen` to generate types
 * 3. Import the generated query in your components
 */

// Example 1: Get featured collections
export const GET_FEATURED_COLLECTIONS = gql`
  query GetFeaturedCollections($first: Int = 6) {
    collections(first: $first, query: "featured:true") {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
            width
            height
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

// Example 2: Get collection with products
export const GET_COLLECTION_WITH_PRODUCTS = gql`
  query GetCollectionWithProducts(
    $handle: String!
    $first: Int = 20
    $after: String
  ) {
    collection(handle: $handle) {
      id
      title
      description
      descriptionHtml
      image {
        url
        altText
      }
      seo {
        title
        description
      }
      products(
        first: $first
        after: $after
      ) {
        edges {
          node {
            id
            handle
            title
            description
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
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            vendor
            productType
            tags
            totalInventory
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
  }
`;

// Example 3: Get all collections with product counts
export const GET_ALL_COLLECTIONS = gql`
  query GetAllCollections(
    $first: Int = 50
    $after: String
    $sortKey: CollectionSortKeys = TITLE
  ) {
    collections(first: $first, after: $after, sortKey: $sortKey) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
          }
          products(first: 1) {
            totalCount
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
 * import { GetFeaturedCollectionsDocument } from '@/generated/graphql';
 * 
 * const client = getClient();
 * const { collections } = await client.request(GetFeaturedCollectionsDocument);
 * 
 * // Client Component
 * import { useQuery } from '@tanstack/react-query';
 * import { getGraphQLClient } from '@/lib/graphql/client';
 * import { GetCollectionWithProductsDocument } from '@/generated/graphql';
 * 
 * const client = getGraphQLClient();
 * const { data } = useQuery({
 *   queryKey: ['Collection', handle],
 *   queryFn: () => client.request(GetCollectionWithProductsDocument, { 
 *     handle,
 *     first: 20
 *   }),
 * });
 */
