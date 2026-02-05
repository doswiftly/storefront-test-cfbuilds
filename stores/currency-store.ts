import { create } from 'zustand';
import { getCookieManager } from '@/lib/currency/';

export interface ShopCurrencyData {
  currencyCode: string;
  supportedCurrencies: string[];
  localeToCurrencyMap?: Array<{
    locale: string;
    currency: string;
  }>;
}

interface CurrencyStore {
  // State
  baseCurrency: string | null;
  supportedCurrencies: string[];
  currency: string | null;
  isLoaded: boolean;
  isHydrated: boolean; // Alias for isLoaded (for compatibility)

  // Actions
  initialize: (shopData: ShopCurrencyData) => void;
  setCurrency: (currency: string) => void;
  
  // Internal
  _syncFromCookie: () => void;
}

export const useCurrencyStore = create<CurrencyStore>()((set, get) => ({
  baseCurrency: null,
  supportedCurrencies: [],
  currency: null,
  isLoaded: false,
  isHydrated: false,

  initialize: (shopData: ShopCurrencyData) => {
    const cookieManager = getCookieManager();
    
    // 1. Try to get saved currency from cookie (SSR-safe)
    const saved = cookieManager.getCurrency();
    
    // 2. Try to detect from browser locale (if localeToCurrencyMap is available)
    let detected: { locale: string; currency: string } | undefined;
    if (shopData.localeToCurrencyMap && typeof navigator !== 'undefined') {
      const browserLocale = navigator.language;
      detected = shopData.localeToCurrencyMap.find(
        (m) => m.locale === browserLocale
      );
    }

    // 3. Determine final currency (priority: saved > detected > base)
    const finalCurrency =
      saved && shopData.supportedCurrencies.includes(saved)
        ? saved
        : detected && shopData.supportedCurrencies.includes(detected.currency)
        ? detected.currency
        : shopData.currencyCode;

    set({
      baseCurrency: shopData.currencyCode,
      supportedCurrencies: shopData.supportedCurrencies,
      currency: finalCurrency,
      isLoaded: true,
      isHydrated: true,
    });
    
    // Ensure cookie is set if we determined a currency
    if (finalCurrency && !saved) {
      cookieManager.setCurrency(finalCurrency);
    }
  },

  setCurrency: (currency: string) => {
    const { supportedCurrencies } = get();

    // Validate currency
    if (!supportedCurrencies.includes(currency)) {
      console.warn(`[CurrencyStore] Currency ${currency} not supported`);
      return;
    }

    // Update Zustand state
    set({ currency });
    
    // Persist to cookie (single source of truth)
    const cookieManager = getCookieManager();
    cookieManager.setCurrency(currency);
  },
  
  _syncFromCookie: () => {
    const cookieManager = getCookieManager();
    const cookieCurrency = cookieManager.getCurrency();
    
    if (cookieCurrency) {
      const { supportedCurrencies } = get();
      
      // Only sync if the cookie currency is supported
      if (supportedCurrencies.includes(cookieCurrency)) {
        set({ currency: cookieCurrency });
      }
    }
  },
}));
