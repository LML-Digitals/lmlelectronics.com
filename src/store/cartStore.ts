import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/product";

export interface CartItem {
  id: string;
  product: Product;
  variationId?: string;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
}

interface CartStore {
  cart: Cart;
  addItem: (product: Product, variationId?: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
      },
      addItem: (product: Product, variationId?: string, quantity = 1) => {
        const state = get();
        const variation =
          product.variations?.find((v) => v.id === variationId) ||
          product.variations?.[0];
        const price = variation?.price || product.price;

        const itemId = `${product.id}-${variationId || "default"}`;
        const existingItem = state.cart.items.find(
          (item) => item.id === itemId
        );

        if (existingItem) {
          // Update quantity if item already exists
          set({
            cart: {
              items: state.cart.items.map((item) =>
                item.id === itemId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            },
          });
        } else {
          // Add new item
          const newItem: CartItem = {
            id: itemId,
            product,
            variationId,
            quantity,
            price,
          };

          set({
            cart: {
              items: [...state.cart.items, newItem],
            },
          });
        }
      },
      removeItem: (itemId: string) => {
        const state = get();
        set({
          cart: {
            items: state.cart.items.filter((item) => item.id !== itemId),
          },
        });
      },
      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const state = get();
        set({
          cart: {
            items: state.cart.items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          },
        });
      },
      clearCart: () => {
        set({
          cart: {
            items: [],
          },
        });
      },
      getTotalPrice: () => {
        const state = get();
        return state.cart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getTotalItems: () => {
        const state = get();
        return state.cart.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

// Helper hooks for additional cart calculations
export const useCartShippingCost = () => {
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  // Free shipping over $50, otherwise $5.99
  return totalPrice >= 50 ? 0 : 5.99;
};

export const useCartDiscountAmount = () => {
  // This could be expanded to handle discount codes, promotions, etc.
  // For now, return 0
  return 0;
};
