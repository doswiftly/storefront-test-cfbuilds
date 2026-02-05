# Cart Integration with GraphQL

This storefront template includes full GraphQL integration for cart operations. The cart system uses a hybrid approach:

- **Local Store (Zustand)**: For immediate UI updates and optimistic rendering
- **GraphQL API**: For persistence and server-side cart management

## Quick Start

### Using AddToCartButton

The simplest way to add products to cart is using the `AddToCartButton` component:

```tsx
import { AddToCartButton } from "@/components/product/add-to-cart-button";

<AddToCartButton
  variantId={variant.id}
  productId={product.id}
  productHandle={product.handle}
  productTitle={product.title}
  variantTitle={variant.title}
  price={variant.price}
  image={variant.image}
  available={variant.available}
  quantity={1}
/>
```

The button automatically:
- Creates a cart if one doesn't exist
- Adds the item to GraphQL cart
- Updates local store for immediate UI feedback
- Shows loading and success states
- Displays error toasts if something fails

### Using useCartActions Hook

For more control, use the `useCartActions` hook directly:

```tsx
'use client';

import { useCartActions } from "@/hooks/use-cart-actions";

export function MyComponent() {
  const { addToCart, updateQuantity, removeFromCart, isLoading } = useCartActions();
  
  const handleAdd = async () => {
    await addToCart({
      variantId: 'variant-123',
      productId: 'product-456',
      productTitle: 'T-Shirt',
      variantTitle: 'Large / Blue',
      price: { amount: '29.99', currencyCode: 'USD' },
      quantity: 1
    });
  };
  
  return (
    <button onClick={handleAdd} disabled={isLoading}>
      Add to Cart
    </button>
  );
}
```

## Cart Store

The local cart store (`useCartStore`) provides immediate UI updates:

```tsx
import { useCartStore } from "@/stores/cart-store";

const { items, getTotalItems, getTotalPrice, isOpen, openCart } = useCartStore();
```

**Note**: The store is automatically synced with GraphQL operations by `useCartActions`.

## Cart Drawer

The cart drawer shows the current cart state:

```tsx
import { CartDrawer } from "@/components/cart/cart-drawer";

// In your layout or header
<CartDrawer />
```

The drawer:
- Opens automatically when items are added
- Shows all cart items with images and prices
- Allows quantity updates and item removal
- Displays cart summary with totals
- Provides checkout button

## Cart Icon

Add a cart icon to your header:

```tsx
import { CartIcon } from "@/components/cart/cart-icon";

<CartIcon />
```

Shows item count badge and toggles the cart drawer.

## GraphQL Operations

The following GraphQL mutations are available:

### Create Cart

```graphql
mutation CartCreate($input: CartCreateInput) {
  cartCreate(input: $input) {
    cart {
      id
      # ... cart fields
    }
    userErrors {
      message
      code
    }
  }
}
```

### Add Lines

```graphql
mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      id
      # ... cart fields
    }
    userErrors {
      message
      code
    }
  }
}
```

### Update Lines

```graphql
mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart {
      id
      # ... cart fields
    }
    userErrors {
      message
      code
    }
  }
}
```

### Remove Lines

```graphql
mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart {
      id
      # ... cart fields
    }
    userErrors {
      message
      code
    }
  }
}
```

## Cart Persistence

- Cart ID is stored in `localStorage` as `cartId`
- Cart data is persisted on the server via GraphQL
- Local store items are synced with server on page load
- Cart survives page refreshes and browser restarts

## Error Handling

All cart operations include error handling:

- Network errors show toast notifications
- GraphQL `userErrors` are displayed to users
- Failed operations revert local store changes
- Retry logic for transient failures

## Currency Support

Cart prices automatically use the user's selected currency:

- Currency is included in GraphQL request headers
- Prices are converted server-side
- Exchange rates are locked for 24 hours
- Currency changes trigger cart refetch

## Testing

To test cart functionality:

1. Add items to cart
2. Check browser DevTools → Application → Local Storage for `cartId`
3. Check Network tab for GraphQL mutations
4. Verify cart persists after page refresh
5. Test currency switching

## Troubleshooting

### Cart not persisting

- Check if `cartId` exists in localStorage
- Verify GraphQL API is accessible
- Check browser console for errors

### Items not showing in cart

- Ensure `CartDrawer` is included in layout
- Check if cart store is initialized
- Verify GraphQL mutations are successful

### Currency not updating

- Check if `CurrencyProvider` is in layout
- Verify currency store is initialized
- Check GraphQL headers include `X-Preferred-Currency`

## Advanced Usage

### Custom Cart Logic

You can extend the cart system by:

1. Adding custom fields to cart items
2. Implementing discount code validation
3. Adding shipping cost calculation
4. Integrating with checkout flow

### Server-Side Cart

For server-side cart operations (e.g., in API routes):

```typescript
import { getClient } from "@/lib/graphql/server";
import { CartDocument } from "@/generated/graphql";

export async function GET(request: Request) {
  const cartId = request.headers.get('x-cart-id');
  const client = getClient();
  
  const { cart } = await client.request(CartDocument, { id: cartId });
  
  return Response.json({ cart });
}
```

## Migration from Local-Only Cart

If you have an existing local-only cart implementation:

1. Replace `addItem` calls with `useCartActions().addToCart`
2. Update `AddToCartButton` props to include all required fields
3. Add `Toaster` to your layout for error notifications
4. Test cart persistence across page refreshes

## API Reference

See the following files for detailed API documentation:

- `hooks/use-cart-actions.ts` - Cart operations hook
- `stores/cart-store.ts` - Local cart store
- `lib/graphql/hooks.ts` - GraphQL cart hooks
- `components/cart/` - Cart UI components
