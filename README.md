# DoSwiftly Storefront - shadcn/ui Template

This is a Next.js 15+ storefront template with shadcn/ui components, optimized for DoSwiftly Commerce.

## Features

- ✅ **Next.js 15+** with App Router
- ✅ **shadcn/ui** components pre-configured
- ✅ **Tailwind CSS v4** for styling
- ✅ **TypeScript** for type safety
- ✅ **GraphQL Codegen** for type-safe API calls
- ✅ **React Query** for data fetching
- ✅ **Zustand** for state management
- ✅ **Currency conversion** with client-side switching

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and update:

```env
NEXT_PUBLIC_SHOP_SLUG=your-shop-slug
NEXT_PUBLIC_API_URL=https://api.doswiftly.pl
```

### 3. Run GraphQL Codegen

Generate TypeScript types from your GraphQL schema:

```bash
pnpm run codegen
```

### 4. Start Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Adding shadcn/ui Components

This template is pre-configured with shadcn/ui. Add components using the shadcn CLI:

```bash
# Add a button component
npx shadcn@latest add button

# Add a dialog component
npx shadcn@latest add dialog

# Add a dropdown menu
npx shadcn@latest add dropdown-menu

# See all available components
npx shadcn@latest add
```

Components will be added to `components/ui/` directory.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Homepage
├── components/
│   ├── ui/                # shadcn/ui components (auto-generated)
│   ├── layout/            # Layout components (Header, Footer)
│   └── providers/         # React providers (Query, Currency)
├── lib/
│   ├── graphql/
│   │   ├── server.ts      # Server-side GraphQL client
│   │   ├── client.ts      # Client-side GraphQL client
│   │   └── hooks.ts       # React Query hooks
│   └── utils.ts           # Utility functions (cn helper)
├── stores/
│   └── currency-store.ts  # Zustand currency store
├── generated/
│   └── graphql.ts         # Auto-generated GraphQL types
├── doswiftly.config.ts    # DoSwiftly configuration
├── components.json        # shadcn/ui configuration
└── codegen.ts             # GraphQL Codegen configuration
```

## GraphQL Codegen

This template uses GraphQL Codegen to generate TypeScript types from your GraphQL schema.

### Configuration

See `codegen.ts` for configuration. It reads:
- **Schema**: From your DoSwiftly API
- **Operations**: From `@doswiftly/storefront-operations` package
- **Custom queries**: From `src/graphql/**/*.{ts,tsx}`

### Running Codegen

```bash
# Generate types
pnpm run codegen

# Watch mode (auto-regenerate on changes)
pnpm run codegen:watch
```

## Currency Management

This template includes built-in currency conversion:

1. **Server Components**: Render prices in base currency (SSG-compatible)
2. **Client Components**: Switch to user's preferred currency dynamically
3. **Currency Store**: Persists user preference in localStorage

### Usage

```tsx
// Server Component
import { fetchProduct } from '@/lib/graphql/server';

export default async function ProductPage({ params }) {
  const { product } = await fetchProduct(params.handle);
  // Prices in base currency
  return <div>{product.priceRange.minVariantPrice.amount}</div>;
}

// Client Component
'use client';
import { useProduct } from '@/lib/graphql/hooks';
import { useCurrencyStore } from '@/stores/currency-store';

export function ProductPrice({ handle }) {
  const currency = useCurrencyStore((s) => s.currency);
  const { data } = useProduct(handle);
  // Prices in user's preferred currency
  return <div>{data.product.priceRange.minVariantPrice.amount} {currency}</div>;
}
```

## Styling

This template uses Tailwind CSS v4 with shadcn/ui.

### Customizing Theme

Edit `app/globals.css` to customize colors:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... more variables */
  }
}
```

### Using cn() Helper

The `cn()` helper combines Tailwind classes with proper precedence:

```tsx
import { cn } from '@/lib/utils';

<div className={cn('text-base', isActive && 'text-primary')} />
```

## Building for Production

```bash
# Build
pnpm run build

# Start production server
pnpm run start
```

## Learn More

- [DoSwiftly Documentation](https://docs.doswiftly.pl)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

UNLICENSED - Internal DoSwiftly template
