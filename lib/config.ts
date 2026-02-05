/**
 * Shop Configuration
 *
 * Centralized configuration for shop settings.
 * Customize these values to match your store's policies.
 */

export const shopConfig = {
  /**
   * Currency settings
   */
  currency: {
    default: 'USD',
    supported: ['USD', 'EUR', 'GBP', 'PLN'],
  },

  /**
   * Shipping policy settings
   */
  shipping: {
    freeShippingThreshold: 50,
    standardDeliveryDays: { min: 3, max: 5 },
    features: [
      'Express shipping available at checkout',
      'International shipping available',
      '30-day return policy',
    ],
  },

  /**
   * Product display settings
   */
  products: {
    gridColumns: 4,
    itemsPerPage: 12,
  },

  /**
   * Cart settings
   */
  cart: {
    maxQuantityPerItem: 99,
  },
} as const;

export type ShopConfig = typeof shopConfig;
