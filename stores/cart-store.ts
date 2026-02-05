import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartState {
  // State
  cartId: string | null;
  isOpen: boolean;
  isHydrated: boolean;

  // Actions
  setCartId: (cartId: string | null) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cartId: null,
      isOpen: false,
      isHydrated: false,

      setCartId: (cartId: string | null) => {
        set({ cartId });
      },

      clearCart: () => {
        set({ cartId: null, isOpen: false });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },
    }),
    {
      name: 'cart-storage',
      // Persist only cartId — server is the source of truth for items
      partialize: (state) => ({ cartId: state.cartId }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);
