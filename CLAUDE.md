# Storefront Template - Development Guide

Ten plik jest synchronizowany do `storefronts/test-shop/` przez `pnpm sync:storefront:watch`.

## Architektura

```
app/                    # Next.js 15 App Router
├── layout.tsx          # Root layout z providers
├── page.tsx            # Homepage
├── products/           # Strony produktow
├── collections/        # Strony kolekcji
├── cart/               # Koszyk
├── checkout/           # Checkout
├── account/            # Panel klienta
└── auth/               # Login/Register

components/
├── product/            # ProductCard, ProductGrid, AddToCartButton
├── cart/               # CartDrawer, CartItem, CartSummary
├── auth/               # LoginForm, RegisterForm
├── layout/             # Header, Footer, Navigation
├── ui/                 # shadcn/ui components
└── providers/          # QueryProvider, CurrencyProvider, ThemeProvider

lib/
├── graphql/
│   ├── server.ts       # SSR helpers z React cache()
│   ├── client.ts       # Client-side GraphQL client
│   └── hooks.ts        # React Query hooks
└── currency/           # Currency management

stores/                 # Zustand stores
├── cart-store.ts       # Koszyk (persist localStorage)
├── currency-store.ts   # Waluta (persist cookies)
└── auth-store.ts       # Autentykacja

generated/
└── graphql.ts          # Auto-generowane typy
```

## Data Fetching

### Server Components (lib/graphql/server.ts):
```typescript
import { fetchProducts, fetchProduct } from '@/lib/graphql/server';

// W async Server Component
const { products, pageInfo } = await fetchProducts({ first: 20 });
const { product } = await fetchProduct(handle);
```

### Client Components (lib/graphql/hooks.ts):
```typescript
'use client';
import { useProducts, useCart, useCartLinesAdd } from '@/lib/graphql/hooks';

const { data, isLoading } = useProducts({ first: 20 });
const addLines = useCartLinesAdd();
```

## Zustand Stores

### Cart Store:
```typescript
import { useCartStore } from '@/stores/cart-store';

const { items, addItem, removeItem, getTotalItems, getTotalPrice } = useCartStore();
```

### Currency Store:
```typescript
import { useCurrencyStore } from '@/stores/currency-store';

const { currency, setCurrency, supportedCurrencies } = useCurrencyStore();
```

## Konwencje

1. **Client vs Server**: Dodaj `"use client"` tylko gdy potrzebne (hooks, interaktywnosc)
2. **Typy**: Zawsze definiuj interfejsy dla props
3. **Styling**: Uzywaj `cn()` dla laczenia klas Tailwind
4. **Obrazki**: next/image z alt i priority dla LCP
5. **Formularze**: Zod dla walidacji

## GraphQL Operations

Operacje sa zdefiniowane w:
```
packages/backend/src/commerce/storefront-graphql/operations/
├── queries.graphql
├── mutations.graphql
└── fragments.graphql
```

Aby poznac dostepne operacje, przeczytaj te pliki.
