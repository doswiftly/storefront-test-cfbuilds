# Integration Checklist

This document lists all TODO comments and missing GraphQL implementations that need to be completed for production readiness.

## 🔴 Critical - Authentication & User Management

### Header Component
**File**: `components/layout/header.tsx`
- [ ] **Line 16**: Get authentication state from context/hook
  - Replace `isAuthenticated = false` with actual auth check
  - Replace `customerName = undefined` with actual customer data
  - **GraphQL Needed**: Customer query or auth context

### Register Form
**File**: `components/auth/register-form.tsx`
- [ ] **Line 61**: Add CustomerRegisterDocument to generated types
  - Implement customer registration mutation
  - **GraphQL Needed**: `customerRegister` mutation

### Forgot Password
**File**: `app/auth/forgot-password/page.tsx`
- [ ] **Line 19**: Implement password reset
  - **GraphQL Needed**: `customerRecover` mutation

## 🔴 Critical - E-commerce Core

### Checkout Page
**File**: `app/checkout/page.tsx`
- [ ] **Line 28**: Implement checkout API
  - Complete checkout flow with payment integration
  - **GraphQL Needed**: `checkoutCreate`, `checkoutComplete` mutations

### Cart Page
**File**: `app/cart/page.tsx`
- [ ] **Line 31**: Implement promo code API
  - **GraphQL Needed**: `cartDiscountCodesUpdate` mutation

## 🟡 High Priority - Product & Catalog

### Collections Page
**File**: `app/collections/page.tsx`
- [ ] **Line 10**: Fetch collections from GraphQL API
  - Replace mock data with real GraphQL query
  - **GraphQL Needed**: `collections` query
- [ ] **Line 54**: Replace placeholder images with actual collection images

### Categories Page
**File**: `app/categories/page.tsx`
- [ ] **Line 10**: Fetch categories from GraphQL API
  - Replace mock data with real GraphQL query
  - **GraphQL Needed**: `categories` query (if supported by backend)

### Brands Pages
**File**: `app/brands/page.tsx`
- [ ] **Line 7**: Fetch brands from backend using GraphQL
  - **GraphQL Needed**: `brands` query

**File**: `app/brands/[slug]/page.tsx`
- [ ] **Line 12**: Fetch brand details from backend
  - **GraphQL Needed**: `brand(slug)` query
- [ ] **Line 25**: Fetch products for specific brand
  - **GraphQL Needed**: `products(brandId)` query with filter

### Featured Products
**File**: `components/home/featured-products.tsx`
- [ ] **Line 12**: Add featured filter when backend supports it
  - **GraphQL Needed**: Add `featured: true` filter to products query

## 🟡 High Priority - Account Management

### Orders Page
**File**: `app/account/orders/page.tsx`
- [ ] **Line 7**: Fetch orders from backend using GraphQL
  - **GraphQL Needed**: `customer { orders }` query

### Order Details Page
**File**: `app/account/orders/[id]/page.tsx`
- [ ] **Line 17**: Fetch order details from backend
  - **GraphQL Needed**: `order(id)` query

### Order Tracking Page
**File**: `app/account/orders/[id]/tracking/page.tsx`
- [ ] **Line 23**: Fetch tracking data from backend
  - **GraphQL Needed**: `order(id) { shipment { tracking } }` query

### Addresses Page
**File**: `app/account/addresses/page.tsx`
- [ ] **Line 23**: Fetch addresses from backend using GraphQL
  - **GraphQL Needed**: `customer { addresses }` query
- [ ] **Line 69**: Implement delete address mutation
  - **GraphQL Needed**: `customerAddressDelete` mutation
- [ ] **Line 74**: Implement set default address mutation
  - **GraphQL Needed**: `customerDefaultAddressUpdate` mutation
- [ ] **Line 84**: Implement create/update address mutation
  - **GraphQL Needed**: `customerAddressCreate`, `customerAddressUpdate` mutations

### Account Settings
**File**: `app/account/settings/page.tsx`
- [ ] **Line 17**: Implement save settings
  - **GraphQL Needed**: `customerUpdate` mutation

## 🟢 Medium Priority - Search & Discovery

### Search Bar
**File**: `components/search/search-bar.tsx`
- [ ] **Line 35**: Fetch suggestions from API
  - **GraphQL Needed**: `productSuggestions(query)` or search query

## 🟢 Medium Priority - Marketing

### Newsletter Signup
**File**: `components/home/newsletter-signup.tsx`
- [ ] **Line 31**: Implement newsletter subscription API call
  - **GraphQL Needed**: `newsletterSubscribe` mutation or external service integration

## GraphQL Operations Summary

### Required Queries
1. ✅ `shop` - Already implemented
2. ✅ `products` - Already implemented
3. ✅ `product(handle)` - Already implemented
4. ✅ `cart` - Already implemented
5. [ ] `collections` - **MISSING**
6. [ ] `collection(handle)` - **MISSING**
7. [ ] `categories` - **MISSING** (if backend supports)
8. [ ] `brands` - **MISSING**
9. [ ] `brand(slug)` - **MISSING**
10. [ ] `customer` - **MISSING**
11. [ ] `order(id)` - **MISSING**
12. [ ] `productSuggestions(query)` - **MISSING**

### Required Mutations
1. ✅ `cartCreate` - Already implemented
2. ✅ `cartLinesAdd` - Already implemented
3. ✅ `cartLinesUpdate` - Already implemented
4. ✅ `cartLinesRemove` - Already implemented
5. [ ] `customerRegister` - **MISSING**
6. [ ] `customerLogin` - **MISSING** (or use existing auth)
7. [ ] `customerRecover` - **MISSING**
8. [ ] `customerUpdate` - **MISSING**
9. [ ] `customerAddressCreate` - **MISSING**
10. [ ] `customerAddressUpdate` - **MISSING**
11. [ ] `customerAddressDelete` - **MISSING**
12. [ ] `customerDefaultAddressUpdate` - **MISSING**
13. [ ] `checkoutCreate` - **MISSING**
14. [ ] `checkoutComplete` - **MISSING**
15. [ ] `cartDiscountCodesUpdate` - **MISSING**
16. [ ] `newsletterSubscribe` - **MISSING** (optional)

## Implementation Priority

### Phase 1: Critical (Must Have for MVP)
1. Authentication (login, register, password reset)
2. Checkout flow (create, complete)
3. Customer queries (profile, orders)
4. Order details and tracking

### Phase 2: High Priority (Important for UX)
1. Collections and categories
2. Brands
3. Address management (CRUD operations)
4. Promo codes

### Phase 3: Medium Priority (Nice to Have)
1. Search suggestions
2. Newsletter subscription
3. Featured products filter
4. Account settings

## Backend Requirements

The following GraphQL operations need to be added to the backend:

### In `packages/backend/src/commerce/storefront-graphql/operations/`

**queries.graphql**:
```graphql
# Collections
query Collections($first: Int, $after: String) {
  collections(first: $first, after: $after) {
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
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

query Collection($handle: String!) {
  collection(handle: $handle) {
    id
    handle
    title
    description
    image {
      url
      altText
    }
    products(first: 20) {
      edges {
        node {
          id
          title
          handle
          # ... product fields
        }
      }
    }
  }
}

# Brands (if supported)
query Brands($first: Int) {
  brands(first: $first) {
    edges {
      node {
        id
        slug
        name
        description
        logoUrl
      }
    }
  }
}

# Customer
query Customer {
  customer {
    id
    email
    firstName
    lastName
    phone
    addresses {
      id
      firstName
      lastName
      company
      address1
      address2
      city
      province
      zip
      country
      phone
      isDefault
    }
    orders(first: 20) {
      edges {
        node {
          id
          orderNumber
          createdAt
          totalPrice {
            amount
            currencyCode
          }
          # ... order fields
        }
      }
    }
  }
}

# Order
query Order($id: ID!) {
  order(id: $id) {
    id
    orderNumber
    createdAt
    totalPrice {
      amount
      currencyCode
    }
    lineItems {
      edges {
        node {
          id
          title
          quantity
          # ... line item fields
        }
      }
    }
    shippingAddress {
      # ... address fields
    }
    # ... other order fields
  }
}
```

**mutations.graphql**:
```graphql
# Customer Registration
mutation CustomerRegister($input: CustomerRegisterInput!) {
  customerRegister(input: $input) {
    customer {
      id
      email
      firstName
      lastName
    }
    customerAccessToken {
      accessToken
      expiresAt
    }
    userErrors {
      field
      message
    }
  }
}

# Customer Address Management
mutation CustomerAddressCreate($input: CustomerAddressInput!) {
  customerAddressCreate(input: $input) {
    customerAddress {
      id
      # ... address fields
    }
    userErrors {
      field
      message
    }
  }
}

mutation CustomerAddressUpdate($id: ID!, $input: CustomerAddressInput!) {
  customerAddressUpdate(id: $id, input: $input) {
    customerAddress {
      id
      # ... address fields
    }
    userErrors {
      field
      message
    }
  }
}

mutation CustomerAddressDelete($id: ID!) {
  customerAddressDelete(id: $id) {
    deletedAddressId
    userErrors {
      field
      message
    }
  }
}

# Checkout
mutation CheckoutCreate($input: CheckoutCreateInput!) {
  checkoutCreate(input: $input) {
    checkout {
      id
      webUrl
      # ... checkout fields
    }
    userErrors {
      field
      message
    }
  }
}

mutation CheckoutComplete($checkoutId: ID!) {
  checkoutComplete(checkoutId: $checkoutId) {
    order {
      id
      orderNumber
    }
    userErrors {
      field
      message
    }
  }
}

# Discount Codes
mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
  cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
    cart {
      id
      # ... cart fields
    }
    userErrors {
      field
      message
    }
  }
}
```

## Testing Checklist

After implementing GraphQL operations:

- [ ] Test authentication flow (register, login, logout)
- [ ] Test checkout flow end-to-end
- [ ] Test address management (create, update, delete, set default)
- [ ] Test order history and details
- [ ] Test collections and categories browsing
- [ ] Test brands browsing
- [ ] Test promo code application
- [ ] Test search suggestions
- [ ] Verify all error handling works correctly
- [ ] Verify loading states display properly
- [ ] Test with real backend data

## Notes

- All mock data should be replaced with real GraphQL queries
- Error handling should be implemented for all API calls
- Loading states should be shown during data fetching
- Empty states should be handled gracefully
- Authentication state should be managed globally (context or store)
- Consider implementing optimistic updates for better UX

## Progress Tracking

**Total TODO Items**: 24
**Completed**: 1 (Authentication)
**In Progress**: 0
**Remaining**: 23

**Documentation Created**:
- ✅ QUICK_START_INTEGRATION.md - Quick start guide with examples
- ✅ GRAPHQL_INTEGRATION_GUIDE.md - Detailed integration patterns
- ✅ IMPLEMENTATION_STATUS.md - Backend operations status
- ✅ README_INTEGRATION.md - Complete integration overview
- ✅ Auth Store - Zustand store for authentication state
- ✅ Enhanced use-auth hook - Complete authentication system

Last Updated: 2024-12-10
