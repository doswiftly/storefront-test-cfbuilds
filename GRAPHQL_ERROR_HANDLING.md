# GraphQL Error Handling Guide

## ⚠️ WAŻNE: Struktura błędów

**WSZYSTKIE** GraphQL mutations w Shopify Storefront API zwracają błędy w polu `userErrors`, NIE w `customerUserErrors`, `checkoutUserErrors` itp.

---

## 📋 Poprawna struktura odpowiedzi

### Mutations zwracają:
```typescript
{
  data: {
    mutationName: {
      // Dane sukcesu (jeśli operacja się powiodła)
      customer?: Customer,
      cart?: Cart,
      // etc.
      
      // ZAWSZE to samo pole dla błędów!
      userErrors: [
        {
          message: string,
          code: string,
          field: string[]
        }
      ]
    }
  }
}
```

---

## ✅ Poprawna obsługa błędów

### Pattern do kopiowania:

```typescript
try {
  const result = await client.request(SomeMutationDocument, variables);
  
  // 1. ZAWSZE sprawdź userErrors NAJPIERW
  const userErrors = result?.mutationName?.userErrors || [];
  
  if (userErrors.length > 0) {
    setError(userErrors[0].message || "Operation failed");
    return;
  }
  
  // 2. Sprawdź czy operacja się powiodła
  if (result?.mutationName?.successField) {
    // Sukces!
  } else {
    setError("Operation failed. Please try again.");
  }
} catch (err) {
  setError("An error occurred. Please try again.");
}
```

---

## 🎯 Przykłady dla różnych mutations

### CustomerCreate (Rejestracja)
```typescript
const result = await client.request(CustomerCreateDocument, { input });

const userErrors = result?.customerCreate?.userErrors || [];

if (userErrors.length > 0) {
  // Błędy: "Email already registered", "Invalid email", etc.
  setError(userErrors[0].message);
  return;
}

if (result?.customerCreate?.customer) {
  // Sukces - klient utworzony
  
  // BONUS: customerCreate zwraca też customerAccessToken!
  const accessToken = result?.customerCreate?.customerAccessToken?.accessToken;
  if (accessToken) {
    // Możemy od razu zalogować użytkownika
    await fetch("/api/auth/set-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: accessToken }),
    });
  }
}
```

### CustomerLogin (Logowanie)
```typescript
const result = await client.request(CustomerLoginDocument, { input });

const userErrors = result?.customerAccessTokenCreate?.userErrors || [];

if (userErrors.length > 0) {
  // Błędy: "Invalid credentials", etc.
  setError(userErrors[0].message);
  return;
}

if (result?.customerAccessTokenCreate?.customerAccessToken) {
  // Sukces - token otrzymany
}
```

### CartCreate (Koszyk)
```typescript
const result = await client.request(CartCreateDocument, { input });

const userErrors = result?.cartCreate?.userErrors || [];

if (userErrors.length > 0) {
  // Błędy koszyka
  setError(userErrors[0].message);
  return;
}

if (result?.cartCreate?.cart) {
  // Sukces - koszyk utworzony
}
```

### CustomerAddressCreate (Adres)
```typescript
const result = await client.request(CustomerAddressCreateDocument, {
  address,
  customerAccessToken
});

const userErrors = result?.customerAddressCreate?.userErrors || [];

if (userErrors.length > 0) {
  // Błędy walidacji adresu
  setError(userErrors[0].message);
  return;
}

if (result?.customerAddressCreate?.customerAddress) {
  // Sukces - adres utworzony
}
```

---

## ❌ Częste błędy

### Błąd 1: Używanie nieistniejących pól
```typescript
// ❌ BŁĄD - to pole nie istnieje!
if (result?.customerCreate?.customerUserErrors?.length > 0) {
  // ...
}

// ✅ POPRAWNIE
if (result?.customerCreate?.userErrors?.length > 0) {
  // ...
}
```

### Błąd 2: Sprawdzanie sukcesu przed błędami
```typescript
// ❌ BŁĄD - sprawdzamy sukces przed błędami
if (result?.customerCreate?.customer) {
  // sukces
} else if (result?.customerCreate?.userErrors?.length > 0) {
  // błąd
}

// ✅ POPRAWNIE - błędy NAJPIERW
const userErrors = result?.customerCreate?.userErrors || [];
if (userErrors.length > 0) {
  // błąd
  return;
}
if (result?.customerCreate?.customer) {
  // sukces
}
```

### Błąd 3: Brak fallback dla pustych błędów
```typescript
// ❌ BŁĄD - co jeśli nie ma customer ani userErrors?
if (result?.customerCreate?.customer) {
  // sukces
} else if (result?.customerCreate?.userErrors?.length > 0) {
  setError(result.customerCreate.userErrors[0].message);
}
// Brak obsługi przypadku gdy obie wartości są null/undefined

// ✅ POPRAWNIE
const userErrors = result?.customerCreate?.userErrors || [];
if (userErrors.length > 0) {
  setError(userErrors[0].message);
  return;
}
if (result?.customerCreate?.customer) {
  // sukces
} else {
  setError("Operation failed. Please try again.");
}
```

---

## 📝 Typowe kody błędów

### Customer Errors
- `CUSTOMER_CREATE_FAILED` - Rejestracja nie powiodła się
- `INVALID_CREDENTIALS` - Nieprawidłowe dane logowania
- `CUSTOMER_DISABLED` - Konto wyłączone
- `UNIDENTIFIED_CUSTOMER` - Nieznany klient

### Validation Errors
- `INVALID` - Nieprawidłowa wartość pola
- `BLANK` - Wymagane pole jest puste
- `TOO_LONG` - Wartość za długa
- `TOO_SHORT` - Wartość za krótka
- `TAKEN` - Wartość już zajęta (np. email)

### Cart Errors
- `INVALID_MERCHANDISE_LINE` - Nieprawidłowa linia produktu
- `MERCHANDISE_NOT_FOUND` - Produkt nie znaleziony
- `INSUFFICIENT_STOCK` - Niewystarczająca ilość w magazynie

---

## 🔧 Naprawione pliki

### ✅ `components/auth/register-form.tsx`
- Zmieniono `customerUserErrors` → `userErrors`
- Dodano sprawdzanie błędów przed sukcesem
- Dodano fallback dla nieoczekiwanych stanów
- **Naprawiono auto-login:** Używa `customerAccessToken` z odpowiedzi zamiast nieistniejącego `/api/auth/login`

### ✅ `components/auth/login-form.tsx`
- Zmieniono `customerUserErrors` → `userErrors`
- Dodano sprawdzanie błędów przed sukcesem
- Dodano fallback dla nieoczekiwanych stanów

### ⚠️ `app/checkout/page.tsx`
- Wymaga refactoringu (CheckoutCreateDocument nie istnieje)
- Po refactoringu: zmienić `checkoutUserErrors` → `userErrors`

---

## 🎯 Checklist przed użyciem mutation

- [ ] Używam `userErrors` (nie `customerUserErrors`, `checkoutUserErrors`, etc.)
- [ ] Sprawdzam błędy PRZED sprawdzeniem sukcesu
- [ ] Mam fallback dla przypadku gdy nie ma ani błędów ani sukcesu
- [ ] Wyświetlam `userErrors[0].message` użytkownikowi
- [ ] Obsługuję wyjątki w `catch` block

---

**Data aktualizacji:** 2024-12-10
**Status:** ✅ Register i Login naprawione, Checkout wymaga refactoringu
