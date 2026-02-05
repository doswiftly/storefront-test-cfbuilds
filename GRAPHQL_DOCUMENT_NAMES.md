# GraphQL Document Names Reference

## ⚠️ WAŻNE: Konwencja nazewnictwa

**WSZYSTKIE** GraphQL dokumenty w `generated/graphql.ts` mają suffix `Document`!

```typescript
// ✅ POPRAWNIE
import { CustomerCreateDocument } from "@/generated/graphql";
client.request(CustomerCreateDocument, { input });

// ❌ BŁĄD - nie istnieje!
import { CustomerCreate } from "@/generated/graphql";
```

---

## 📋 Kompletna lista dostępnych dokumentów

### 🔍 Queries (Zapytania)

#### Collections & Categories
- ✅ `GetFeaturedCollectionsDocument` - Featured collections
- ✅ `GetCollectionWithProductsDocument` - Collection z produktami
- ✅ `GetAllCollectionsDocument` - Wszystkie collections
- ✅ `CollectionDocument` - Pojedyncza collection
- ✅ `CollectionsDocument` - Lista collections
- ✅ `CategoryDocument` - Pojedyncza kategoria
- ✅ `CategoriesDocument` - Lista kategorii

#### Products
- ✅ `GetFeaturedProductsDocument` - Featured produkty
- ✅ `GetProductWithReviewsDocument` - Produkt z recenzjami
- ✅ `SearchProductsWithFiltersDocument` - Wyszukiwanie z filtrami
- ✅ `ProductDocument` - Pojedynczy produkt
- ✅ `ProductsDocument` - Lista produktów
- ✅ `ProductSearchDocument` - Wyszukiwanie produktów

#### Cart
- ✅ `CartDocument` - Koszyk

#### Shop
- ✅ `ShopDocument` - Informacje o sklepie

---

### ✏️ Mutations (Mutacje)

#### Customer Authentication
- ✅ `CustomerCreateDocument` - Rejestracja nowego klienta
- ✅ `CustomerLoginDocument` - Logowanie
- ✅ `CustomerLogoutDocument` - Wylogowanie
- ✅ `CustomerTokenRenewDocument` - Odnowienie tokenu

#### Customer Profile
- ✅ `CustomerUpdateDocument` - Aktualizacja profilu

#### Customer Addresses
- ✅ `CustomerAddressCreateDocument` - Dodanie adresu
- ✅ `CustomerAddressUpdateDocument` - Edycja adresu
- ✅ `CustomerAddressDeleteDocument` - Usunięcie adresu
- ✅ `CustomerDefaultAddressUpdateDocument` - Ustawienie domyślnego adresu

#### Customer Password
- ✅ `CustomerPasswordRecoverDocument` - Odzyskiwanie hasła (wysyłka emaila)
- ✅ `CustomerPasswordResetDocument` - Reset hasła (z tokenem)

#### Cart Operations
- ✅ `CartCreateDocument` - Utworzenie koszyka
- ✅ `CartLinesAddDocument` - Dodanie produktów do koszyka
- ✅ `CartLinesUpdateDocument` - Aktualizacja ilości w koszyku
- ✅ `CartLinesRemoveDocument` - Usunięcie produktów z koszyka
- ✅ `CartDiscountCodesUpdateDocument` - Dodanie kodu rabatowego
- ✅ `CartBuyerIdentityUpdateDocument` - Aktualizacja danych kupującego
- ✅ `CartNoteUpdateDocument` - Dodanie notatki do zamówienia

---

## 🎯 Przykłady użycia

### Client-side (React Query)

```typescript
import { useMutation, useQuery } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql/client";
import { 
  CustomerCreateDocument,
  CustomerLoginDocument,
  CartCreateDocument 
} from "@/generated/graphql";

const client = getGraphQLClient();

// Mutation
const registerMutation = useMutation({
  mutationFn: async (input) => {
    return client.request(CustomerCreateDocument, { input });
  },
});

// Query
const { data } = useQuery({
  queryKey: ["cart", cartId],
  queryFn: () => client.request(CartDocument, { id: cartId }),
});
```

### Server-side (Next.js Server Components)

```typescript
import { getClient } from "@/lib/graphql/server";
import { ProductDocument, CollectionsDocument } from "@/generated/graphql";

export async function getProduct(handle: string) {
  const client = await getClient();
  return client.request(ProductDocument, { handle });
}

export async function getCollections() {
  const client = await getClient();
  return client.request(CollectionsDocument, { first: 10 });
}
```

---

## 🔧 Najczęstsze błędy

### ❌ Błąd 1: Brak suffixu "Document"
```typescript
// BŁĄD
import { CustomerCreate } from "@/generated/graphql";

// POPRAWNIE
import { CustomerCreateDocument } from "@/generated/graphql";
```

### ❌ Błąd 2: Niepoprawna nazwa dokumentu
```typescript
// BŁĄD
import { CustomerRecoverDocument } from "@/generated/graphql";

// POPRAWNIE
import { CustomerPasswordRecoverDocument } from "@/generated/graphql";
```

### ❌ Błąd 3: Używanie nieistniejących dokumentów
```typescript
// BŁĄD - CheckoutCreate nie istnieje w Storefront API
import { CheckoutCreateDocument } from "@/generated/graphql";

// POPRAWNIE - Używaj Cart API
import { CartCreateDocument } from "@/generated/graphql";
```

---

## 📝 Notatki

1. **Shopify Storefront API** nie ma:
   - ❌ `CheckoutCreateDocument` - **NIE ISTNIEJE!** Używaj `CartCreateDocument` + `cart.checkoutUrl`
   - ❌ Bezpośredniego API dla zamówień - używaj Customer API
   - ❌ `CheckoutDocument` - używaj `CartDocument` który zawiera `checkoutUrl`

2. **Categories vs Collections**:
   - `CategoriesDocument` - custom kategorie (jeśli zaimplementowane)
   - `CollectionsDocument` - natywne Shopify collections (zalecane)

3. **Password Recovery**:
   - `CustomerPasswordRecoverDocument` - wysyła email z linkiem
   - `CustomerPasswordResetDocument` - resetuje hasło z tokenem z emaila

4. **Cart vs Checkout**:
   - Shopify Storefront API v2024+ używa Cart API zamiast Checkout API
   - `CartDocument` zawiera `checkoutUrl` do przekierowania na checkout

---

## 🔄 Aktualizacja dokumentów

Jeśli dodajesz nowe GraphQL queries/mutations:

1. Dodaj je do `graphql/` folder
2. Uruchom codegen: `npm run graphql:codegen`
3. Sprawdź wygenerowane nazwy w `generated/graphql.ts`
4. Zaktualizuj tę dokumentację

---

**Ostatnia aktualizacja:** 2024-12-10
