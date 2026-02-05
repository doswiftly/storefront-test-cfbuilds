import { CodegenConfig } from '@graphql-codegen/cli';
import { loadEnvConfig } from '@next/env';

// Load environment variables from .env.local
loadEnvConfig(process.cwd());

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const shopSlug = process.env.NEXT_PUBLIC_SHOP_SLUG || 'test-shop';

const config: CodegenConfig = {
  // Schema from live API (introspection)
  schema: [
    {
      [`${apiUrl}/storefront/graphql`]: {
        headers: {
          'X-Shop-Slug': shopSlug,
        },
      },
    },
  ],

  // Operations: Backend SSOT + Developer Custom Queries
  documents: [
    'node_modules/@doswiftly/storefront-operations/**/*.graphql', // Backend operations
    'graphql/**/*.{ts,tsx}',                                       // Custom queries in code
  ],

  // Output configuration
  generates: {
    'generated/graphql.ts': {
      plugins: [
        'typescript',                    // Generate TS types
        'typescript-operations',         // Generate operation types
        'typed-document-node',           // Generate TypedDocumentNode
      ],
      config: {
        skipTypename: false,
        enumsAsTypes: true,
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, any>',
        },
      },
    },
  },

  // Watch mode for development
  watch: process.env.NODE_ENV === 'development',
};

export default config;
