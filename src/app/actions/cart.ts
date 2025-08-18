'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { CartItem } from '@/types/cartTypes';

export async function addToCart (item: CartItem) {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get('cart');
  let cart: CartItem[] = [];

  if (cartCookie) {
    try {
      cart = JSON.parse(cartCookie.value);
    } catch {
      cart = [];
    }
  }

  const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === item.id);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += item.quantity ?? 1;
  } else {
    cart.push(item);
  }

  cookieStore.set('cart', JSON.stringify(cart));
  revalidatePath('/cart');
}

export async function removeFromCart (itemId: string) {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get('cart');

  if (cartCookie) {
    try {
      const cart: CartItem[] = JSON.parse(cartCookie.value);
      const updatedCart = cart.filter((item) => item.id !== itemId);

      cookieStore.set('cart', JSON.stringify(updatedCart));
      revalidatePath('/cart');
    } catch (_error) {
      // Error removing item from cart
    }
  }
}

export async function updateCartItemQuantity (
  itemId: string,
  quantity: number,
) {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get('cart');

  if (cartCookie) {
    try {
      const cart: CartItem[] = JSON.parse(cartCookie.value);
      const updatedCart = cart.map((item) => item.id === itemId ? { ...item, quantity } : item);

      cookieStore.set('cart', JSON.stringify(updatedCart));
      revalidatePath('/cart');
    } catch (_error) {
      // Error updating cart item quantity
    }
  }
}

export async function clearCart () {
  const cookieStore = await cookies();

  cookieStore.delete('cart');
  revalidatePath('/cart');
}
