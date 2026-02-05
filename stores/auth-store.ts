import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface AuthStore {
  // State
  customer: Customer | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (customer: Customer, accessToken: string) => void;
  clearAuth: () => void;
  updateCustomer: (customer: Partial<Customer>) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      customer: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (customer, accessToken) =>
        set({
          customer,
          accessToken,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          customer: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      updateCustomer: (updates) =>
        set((state) => ({
          customer: state.customer
            ? { ...state.customer, ...updates }
            : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        customer: state.customer,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
