import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types/product";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: (productId: string, variationId?: string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem: CartItem) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.variationId === newItem.variationId &&
            JSON.stringify(item.options) === JSON.stringify(newItem.options)
        );

        if (existingItemIndex >= 0) {
          // Update quantity of existing item
          const updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
          set({ items: updatedItems });
        } else {
          // Add new item to cart
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (itemId: string) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const updatedItems = get().items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: (productId: string, variationId?: string) => {
        const items = get().items;
        const item = items.find(
          (item) =>
            item.productId === productId && item.variationId === variationId
        );
        return item ? item.quantity : 0;
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist the items, not the UI state
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

// Selector hooks for performance optimization
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartTotal = () =>
  useCartStore((state) => state.getTotalPrice());
export const useCartItemCount = () =>
  useCartStore((state) => state.getTotalItems());
export const useCartOpen = () => useCartStore((state) => state.isOpen);

// Action hooks
export const useCartActions = () =>
  useCartStore((state) => ({
    addItem: state.addItem,
    removeItem: state.removeItem,
    updateQuantity: state.updateQuantity,
    clearCart: state.clearCart,
    openCart: state.openCart,
    closeCart: state.closeCart,
    toggleCart: state.toggleCart,
  }));
