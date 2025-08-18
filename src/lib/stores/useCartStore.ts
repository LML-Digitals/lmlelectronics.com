import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AvailableItem,
  CartDiscount,
  CartItem,
  ItemType,
} from '@/types/cartTypes';

// Update CartItem interface to include an image field
interface CartState {
  items: (CartItem & { image?: string })[];
  cartId: string | null;
  customerId: string | null;
  bundleDiscount: number | null;
  manualDiscount: number | null;
  automaticDiscount: CartDiscount | null;
  paymentMethod: string | null;
  location: string | null;
  bundleId?: string | null;
  calculatedTax: number;
  calculatedShipping: number;
  addItem: (item: AvailableItem & { image?: string }) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  setCustomerId: (customerId: string) => void;
  setPaymentMethod: (method: string) => void;
  setLocation: (location: string) => void;
  setCartId: (cartId: string) => void;
  setCalculatedTax: (tax: number) => void;
  setCalculatedShipping: (shipping: number) => void;
  applyBundle: (bundleId: string, bundleDiscount: number) => void;
  applyManualDiscount: (manualDiscount: number) => void;
  applyAutomaticDiscount: (discount: CartDiscount) => void;
  removeDiscounts: () => void;
  clearCart: () => void;
}

const mapItemTypeToIdField = (type: ItemType) => {
  switch (type) {
  case 'product':
    return 'productId';
  case 'bundle':
    return 'bundleId';
  default:
    return null;
  }
};

export const useCartStore = create<CartState>()(persist(
  (set, get) => ({
    items: [],
    cartId: null,
    customerId: null,
    bundleDiscount: null,
    manualDiscount: null,
    automaticDiscount: null,
    paymentMethod: null,
    location: null,
    bundleId: null,
    calculatedTax: 0,
    calculatedShipping: 0,
    addItem: (item) => set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id && i.type === item.type);

      // For tickets, ensure price values are present
      const itemPrice = item.price || 0;
      const itemProfit = item.profit || 0;

      // Create a new item with the correct ID field set based on type
      const newItem = {
        ...item,
        quantity: 1,
        total: itemPrice,
        price: itemPrice,
        profit: itemProfit,
        // Set all IDs to null by default
        productId: null,
        specialPartId: null,
        // Include the image if provided
        image: item.image,
        // Set the correct ID based on item type
        [mapItemTypeToIdField(item.type) || 'id']: item.id,
      };

      if (existingItem) {
        return {
          items: state.items.map((i) => i.id === item.id && i.type === item.type
            ? {
              ...i,
              quantity: i.quantity + 1,
              total: (i.quantity + 1) * i.price,
              profit: (i.quantity + 1) * itemProfit,
            }
            : i),
        };
      }

      return {
        items: [...state.items, newItem],
      };
    }),
    updateItemQuantity: (itemId, quantity) => set((state) => ({
      items: state.items.map((item) => item.id === itemId
        ? {
          ...item,
          quantity,
          total: item.price * quantity,
          profit: item.profit * quantity,
        }
        : item),
    })),
    removeItem: (itemId) => set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    })),
    setCustomerId: (customerId) => set({ customerId }),
    setPaymentMethod: (method) => set({ paymentMethod: method }),
    setLocation: (location) => set({ location }),
    setCartId: (cartId) => set({ cartId }),
    setCalculatedTax: (tax) => set({ calculatedTax: tax }),
    setCalculatedShipping: (shipping) => set({ calculatedShipping: shipping }),
    applyBundle: (bundleId, bundleDiscount) => set((state) => {
      if (state.manualDiscount || state.automaticDiscount) {
        return state; // Don't apply if another discount exists
      }

      return {
        bundleId,
        bundleDiscount,
        manualDiscount: null,
        automaticDiscount: null,
      };
    }),

    applyManualDiscount: (manualDiscount) => set((state) => {
      if (state.bundleDiscount || state.automaticDiscount) {
        return state; // Don't apply if another discount exists
      }

      return {
        manualDiscount,
        bundleDiscount: null,
        automaticDiscount: null,
        bundleId: null,
      };
    }),

    applyAutomaticDiscount: (discount) => set((state) => {
      if (state.bundleDiscount || state.manualDiscount) {
        return state; // Don't apply if another discount exists
      }

      return {
        automaticDiscount: discount,
        bundleDiscount: null,
        manualDiscount: null,
        bundleId: null,
      };
    }),

    removeDiscounts: () => set({
      bundleDiscount: null,
      manualDiscount: null,
      automaticDiscount: null,
      bundleId: null,
    }),
    clearCart: () => set({
      items: [],
      cartId: null,
      customerId: null,
      bundleDiscount: null,
      manualDiscount: null,
      automaticDiscount: null,
      paymentMethod: null,
      location: null,
      bundleId: null,
      calculatedTax: 0,
      calculatedShipping: 0,
    }),
  }),
  {
    name: 'lml-cart-storage', // unique name for localStorage
    storage: createJSONStorage(() => localStorage),
    // We need to skip some fields from persisting or handle serialization
    partialize: (state) => ({
      items: state.items,
      cartId: state.cartId,
      customerId: state.customerId,
      bundleDiscount: state.bundleDiscount,
      manualDiscount: state.manualDiscount,
      automaticDiscount: state.automaticDiscount,
      paymentMethod: state.paymentMethod,
      location: state.location,
      bundleId: state.bundleId,
      calculatedTax: state.calculatedTax,
      calculatedShipping: state.calculatedShipping,
    }),
  },
));
