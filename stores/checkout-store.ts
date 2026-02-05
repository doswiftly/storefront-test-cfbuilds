import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Address form state
 */
export interface AddressForm {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone: string;
  company: string;
}

/**
 * Checkout state interface
 * Requirements: 22.4
 */
export interface CheckoutState {
  // Checkout ID from backend
  checkoutId: string | null;

  // Contact info
  email: string;
  phone: string;

  // Addresses
  shippingAddress: AddressForm;
  billingAddress: AddressForm;
  sameAsBilling: boolean;

  // Shipping method
  selectedShippingRateHandle: string | null;

  // Payment method
  selectedPaymentMethodId: string | null;

  // Discount
  discountCode: string;
  appliedDiscountCodes: string[];

  // Consents
  acceptTerms: boolean;
  acceptMarketing: boolean;

  // Hydration state
  isHydrated: boolean;

  // Actions
  setCheckoutId: (id: string | null) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setShippingAddress: (address: Partial<AddressForm>) => void;
  setBillingAddress: (address: Partial<AddressForm>) => void;
  setSameAsBilling: (same: boolean) => void;
  setSelectedShippingRateHandle: (handle: string | null) => void;
  setSelectedPaymentMethodId: (id: string | null) => void;
  setDiscountCode: (code: string) => void;
  addAppliedDiscountCode: (code: string) => void;
  removeAppliedDiscountCode: (code: string) => void;
  setAcceptTerms: (accept: boolean) => void;
  setAcceptMarketing: (accept: boolean) => void;
  resetCheckout: () => void;
}

const emptyAddress: AddressForm = {
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  province: '',
  zip: '',
  country: 'PL',
  phone: '',
  company: '',
};

const initialState = {
  checkoutId: null,
  email: '',
  phone: '',
  shippingAddress: { ...emptyAddress },
  billingAddress: { ...emptyAddress },
  sameAsBilling: true,
  selectedShippingRateHandle: null,
  selectedPaymentMethodId: null,
  discountCode: '',
  appliedDiscountCodes: [],
  acceptTerms: false,
  acceptMarketing: false,
  isHydrated: false,
};

/**
 * Checkout Store
 *
 * Manages checkout flow state with persistence.
 * Persists payment method selection in localStorage.
 *
 * Requirements: 22.4
 */
export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...initialState,

      setCheckoutId: (id) => set({ checkoutId: id }),

      setEmail: (email) => set({ email }),

      setPhone: (phone) => set({ phone }),

      setShippingAddress: (address) =>
        set((state) => ({
          shippingAddress: { ...state.shippingAddress, ...address },
        })),

      setBillingAddress: (address) =>
        set((state) => ({
          billingAddress: { ...state.billingAddress, ...address },
        })),

      setSameAsBilling: (same) => set({ sameAsBilling: same }),

      setSelectedShippingRateHandle: (handle) =>
        set({ selectedShippingRateHandle: handle }),

      setSelectedPaymentMethodId: (id) =>
        set({ selectedPaymentMethodId: id }),

      setDiscountCode: (code) => set({ discountCode: code }),

      addAppliedDiscountCode: (code) =>
        set((state) => ({
          appliedDiscountCodes: [...state.appliedDiscountCodes, code],
          discountCode: '',
        })),

      removeAppliedDiscountCode: (code) =>
        set((state) => ({
          appliedDiscountCodes: state.appliedDiscountCodes.filter(
            (c) => c !== code
          ),
        })),

      setAcceptTerms: (accept) => set({ acceptTerms: accept }),

      setAcceptMarketing: (accept) => set({ acceptMarketing: accept }),

      resetCheckout: () =>
        set({
          ...initialState,
          isHydrated: true, // Keep hydrated flag
        }),
    }),
    {
      name: 'checkout-storage',
      // Persist only essential checkout state
      partialize: (state) => ({
        checkoutId: state.checkoutId,
        email: state.email,
        phone: state.phone,
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        sameAsBilling: state.sameAsBilling,
        selectedShippingRateHandle: state.selectedShippingRateHandle,
        selectedPaymentMethodId: state.selectedPaymentMethodId,
        appliedDiscountCodes: state.appliedDiscountCodes,
        acceptMarketing: state.acceptMarketing,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);
