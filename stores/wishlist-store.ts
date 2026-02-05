/**
 * Wishlist Store
 *
 * Zustand store for managing customer wishlists.
 * Syncs with backend GraphQL API when customer is authenticated.
 *
 * Features:
 * - Optimistic UI updates (local state first)
 * - Backend sync when authenticated
 * - LocalStorage persistence for anonymous users
 * - Multiple wishlist support
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  productTitle: string;
  variantTitle?: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  priceAtAdd: {
    amount: string;
    currencyCode: string;
  };
  image?: {
    url: string;
    altText?: string | null;
  } | null;
  notifyOnSale: boolean;
  notifyOnRestock: boolean;
  addedAt: Date;
}

export interface Wishlist {
  id: string;
  name: string;
  isPublic: boolean;
  shareToken?: string;
  items: WishlistItem[];
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistState {
  // State
  wishlists: Wishlist[];
  activeWishlistId: string | null;
  isHydrated: boolean;
  isSyncing: boolean;

  // Actions
  setWishlists: (wishlists: Wishlist[]) => void;
  setActiveWishlist: (wishlistId: string | null) => void;
  addWishlist: (wishlist: Wishlist) => void;
  removeWishlist: (wishlistId: string) => void;
  addItem: (wishlistId: string, item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeItem: (wishlistId: string, itemId: string) => void;
  updateItem: (wishlistId: string, itemId: string, updates: Partial<WishlistItem>) => void;
  clearWishlist: (wishlistId: string) => void;
  clearAll: () => void;
  setSyncing: (syncing: boolean) => void;

  // Computed
  getActiveWishlist: () => Wishlist | undefined;
  getWishlistById: (wishlistId: string) => Wishlist | undefined;
  isInWishlist: (productId: string, variantId?: string) => boolean;
  getWishlistForProduct: (productId: string, variantId?: string) => Wishlist | undefined;
  getTotalItems: () => number;
}

// Generate a temporary ID for local items before sync
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Default wishlist name
const DEFAULT_WISHLIST_NAME = 'My Wishlist';

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlists: [],
      activeWishlistId: null,
      isHydrated: false,
      isSyncing: false,

      setWishlists: (wishlists: Wishlist[]) => {
        set({ wishlists });
        // Set active wishlist to first one if not set
        if (!get().activeWishlistId && wishlists.length > 0) {
          set({ activeWishlistId: wishlists[0].id });
        }
      },

      setActiveWishlist: (wishlistId: string | null) => {
        set({ activeWishlistId: wishlistId });
      },

      addWishlist: (wishlist: Wishlist) => {
        set((state) => ({
          wishlists: [...state.wishlists, wishlist],
          activeWishlistId: state.activeWishlistId || wishlist.id,
        }));
      },

      removeWishlist: (wishlistId: string) => {
        set((state) => {
          const remaining = state.wishlists.filter((w) => w.id !== wishlistId);
          return {
            wishlists: remaining,
            activeWishlistId:
              state.activeWishlistId === wishlistId
                ? remaining[0]?.id || null
                : state.activeWishlistId,
          };
        });
      },

      addItem: (wishlistId: string, item) => {
        set((state) => {
          // Find or create default wishlist
          let wishlists = [...state.wishlists];
          let targetWishlistId = wishlistId;

          // If no wishlist exists, create a default one
          if (wishlists.length === 0) {
            const newWishlist: Wishlist = {
              id: generateTempId(),
              name: DEFAULT_WISHLIST_NAME,
              isPublic: false,
              items: [],
              itemCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            wishlists = [newWishlist];
            targetWishlistId = newWishlist.id;
          }

          return {
            wishlists: wishlists.map((w) => {
              if (w.id === targetWishlistId) {
                // Check if item already exists
                const existingItem = w.items.find(
                  (i) =>
                    i.productId === item.productId &&
                    (item.variantId ? i.variantId === item.variantId : !i.variantId)
                );

                if (existingItem) {
                  // Update existing item
                  return {
                    ...w,
                    items: w.items.map((i) =>
                      i.id === existingItem.id ? { ...i, ...item } : i
                    ),
                    updatedAt: new Date(),
                  };
                }

                // Add new item
                const newItem: WishlistItem = {
                  ...item,
                  id: generateTempId(),
                  addedAt: new Date(),
                };

                return {
                  ...w,
                  items: [...w.items, newItem],
                  itemCount: w.itemCount + 1,
                  updatedAt: new Date(),
                };
              }
              return w;
            }),
            activeWishlistId: state.activeWishlistId || targetWishlistId,
          };
        });
      },

      removeItem: (wishlistId: string, itemId: string) => {
        set((state) => ({
          wishlists: state.wishlists.map((w) => {
            if (w.id === wishlistId) {
              return {
                ...w,
                items: w.items.filter((i) => i.id !== itemId),
                itemCount: Math.max(0, w.itemCount - 1),
                updatedAt: new Date(),
              };
            }
            return w;
          }),
        }));
      },

      updateItem: (wishlistId: string, itemId: string, updates: Partial<WishlistItem>) => {
        set((state) => ({
          wishlists: state.wishlists.map((w) => {
            if (w.id === wishlistId) {
              return {
                ...w,
                items: w.items.map((i) =>
                  i.id === itemId ? { ...i, ...updates } : i
                ),
                updatedAt: new Date(),
              };
            }
            return w;
          }),
        }));
      },

      clearWishlist: (wishlistId: string) => {
        set((state) => ({
          wishlists: state.wishlists.map((w) => {
            if (w.id === wishlistId) {
              return {
                ...w,
                items: [],
                itemCount: 0,
                updatedAt: new Date(),
              };
            }
            return w;
          }),
        }));
      },

      clearAll: () => {
        set({ wishlists: [], activeWishlistId: null });
      },

      setSyncing: (syncing: boolean) => {
        set({ isSyncing: syncing });
      },

      getActiveWishlist: () => {
        const state = get();
        return state.wishlists.find((w) => w.id === state.activeWishlistId);
      },

      getWishlistById: (wishlistId: string) => {
        return get().wishlists.find((w) => w.id === wishlistId);
      },

      isInWishlist: (productId: string, variantId?: string) => {
        return get().wishlists.some((w) =>
          w.items.some(
            (i) =>
              i.productId === productId &&
              (variantId ? i.variantId === variantId : true)
          )
        );
      },

      getWishlistForProduct: (productId: string, variantId?: string) => {
        return get().wishlists.find((w) =>
          w.items.some(
            (i) =>
              i.productId === productId &&
              (variantId ? i.variantId === variantId : true)
          )
        );
      },

      getTotalItems: () => {
        return get().wishlists.reduce((total, w) => total + w.itemCount, 0);
      },
    }),
    {
      name: 'wishlist-storage',
      // Persist all wishlists
      partialize: (state) => ({
        wishlists: state.wishlists,
        activeWishlistId: state.activeWishlistId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);
