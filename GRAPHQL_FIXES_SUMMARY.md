# GraphQL Naming Fixes - Podsumowanie

## ✅ Naprawione błędy

### 1. Register Form
**Plik:** `components/auth/register-form.tsx`

❌ **Przed:**
```typescript
import { CustomerCreate } from "@/generated/graphql";
client.request(CustomerCreate, { input });
```

✅ **Po:**
```typescript
import { CustomerCreateDocument } from "@/generated/graphql";
client.request(CustomerCreateDocument, { input });
```

---

### 2. Forgot Password Page
**Plik:** `app/auth/forgot-password/page.tsx`

❌ **Przed:**
```typescript
import { CustomerPasswordRecover } from "@/generated/graphql";
client.request(CustomerPasswordRecover, { email });
```

✅ **Po:**
```typescript
import { CustomerPasswordRecoverDocument } from "@/generated/graphql";
client.request(CustomerPasswordRecoverDocument, { email });
```

---

### 3. Categories Page
**Plik:** `lib/graphql/server.ts` + `app/categories/page.tsx`

❌ **Przed:**
```typescript
// CategoriesDocument nie istnieje w Shopify Storefront API
const { CategoriesDocument } = await import('@/generated/graphql');
return client.request(CategoriesDocument);
```

✅ **Po:**
```typescript
// Używamy CollectionsDocument zamiast nieistniejącego CategoriesDocument
const { CollectionsDocument } = await import('@/generated/graphql');
return client.request(CollectionsDocument);
```

---

## ⚠️ Znane problemy do naprawy

### Checkout Page - WYMAGA POPRAWY!
**Plik:** `app/checkout/page.tsx`

❌ **Problem:**
```typescript
const { CheckoutCreateDocument } = await import('@/generated/graphql');
const result = await client.request(CheckoutCreateDocument, { ... });
```

**CheckoutCreateDocument NIE ISTNIEJE w Shopify Storefront API!**

✅ **Rozwiązanie:**
Shopify używa Cart API. Checkout URL jest dostępny w obiekcie Cart:

```typescript
// 1. Utwórz koszyk (jeśli nie istnieje)
const { CartCreateDocument } = await import('@/generated/graphql');
const cartResult = await client.request(CartCreateDocument, {
  input: {
    lines: items.map(item => ({
      merchandiseId: item.variantId,
      quantity: item.quantity,
    })),
  },
});

// 2. Przekieruj na checkout URL
const checkoutUrl = cartResult.cartCreate.cart.checkoutUrl;
window.location.href = checkoutUrl;
```

---

## 📋 Reguła nazewnictwa

**WSZYSTKIE** GraphQL dokumenty w `generated/graphql.ts` mają suffix `Document`:

```typescript
// ✅ ZAWSZE POPRAWNIE
CustomerCreateDocument
CustomerPasswordRecoverDocument
CartCreateDocument
CollectionsDocument

// ❌ ZAWSZE BŁĄD
CustomerCreate
CustomerPasswordRecover
CartCreate
Collections
```

---

## 🔍 Jak sprawdzić dostępne dokumenty?

### PowerShell:
```powershell
Get-Content "storefronts\test-shop\generated\graphql.ts" | Select-String "Document = \{" | ForEach-Object { if ($_ -match 'export const (\w+Document)') { $matches[1] } }
```

### Lub sprawdź plik:
`GRAPHQL_DOCUMENT_NAMES.md` - kompletna lista wszystkich dostępnych dokumentów

---

## 📝 Checklist przed użyciem dokumentu

- [ ] Czy nazwa kończy się na `Document`?
- [ ] Czy dokument istnieje w `generated/graphql.ts`?
- [ ] Czy używam poprawnego API (Cart zamiast Checkout)?
- [ ] Czy sprawdziłem `GRAPHQL_DOCUMENT_NAMES.md`?

---

**Data naprawy:** 2024-12-10
**Status:** ✅ Większość naprawiona, checkout wymaga refactoringu
