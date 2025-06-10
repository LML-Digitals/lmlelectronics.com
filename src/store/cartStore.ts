import React from "react";
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

// Helper hooks for additional cart calculations with Square integration
export const useCartShippingCost = (
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  },
  method: "STANDARD" | "EXPRESS" | "OVERNIGHT" = "STANDARD"
) => {
  const cartItems = useCartStore((state) => state.cart.items);
  const [shippingCost, setShippingCost] = React.useState<number>(5.99);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!shippingAddress || cartItems.length === 0) {
      // Fallback to simple calculation
      const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setShippingCost(totalPrice >= 50 ? 0 : 5.99);
      return;
    }

    const calculateShipping = async () => {
      setLoading(true);
      try {
        const items = cartItems.map((item) => ({
          id: item.id,
          name: item.product.name,
          price: item.price / 100, // Convert from cents to dollars
          quantity: item.quantity,
        }));

        const response = await fetch("/api/calculate/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, shippingAddress, method }),
        });

        const result = await response.json();
        if (result.success) {
          setShippingCost(result.data.cost);
        }
      } catch (error) {
        console.error("Failed to calculate shipping:", error);
        // Fallback to simple calculation
        const totalPrice = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        setShippingCost(totalPrice >= 50 ? 0 : 5.99);
      } finally {
        setLoading(false);
      }
    };

    calculateShipping();
  }, [cartItems, shippingAddress, method]);

  return { cost: shippingCost, loading };
};

export const useCartTaxAmount = (shippingAddress?: {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}) => {
  const cartItems = useCartStore((state) => state.cart.items);
  const [taxAmount, setTaxAmount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!shippingAddress || cartItems.length === 0) {
      setTaxAmount(0);
      return;
    }

    const calculateTax = async () => {
      setLoading(true);
      try {
        const items = cartItems.map((item) => ({
          id: item.id,
          name: item.product.name,
          price: item.price / 100, // Convert from cents to dollars
          quantity: item.quantity,
          catalogObjectId: item.variationId,
        }));

        const response = await fetch("/api/calculate/tax", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, shippingAddress }),
        });

        const result = await response.json();
        if (result.success) {
          setTaxAmount(result.data.totalTax);
        }
      } catch (error) {
        console.error("Failed to calculate tax:", error);
        setTaxAmount(0);
      } finally {
        setLoading(false);
      }
    };

    calculateTax();
  }, [cartItems, shippingAddress]);

  return { amount: taxAmount, loading };
};

export const useCartDiscountAmount = () => {
  // This could be expanded to handle discount codes, promotions, etc.
  // For now, return 0
  return 0;
};
