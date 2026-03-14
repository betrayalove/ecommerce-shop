import { createSlice } from '@reduxjs/toolkit';
import type { CartItem } from '@/entities/cart-item/model/types';
import type { Product } from '@/entities/product/model/types';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem('cart');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { product: Product; quantity: number }[];
    return parsed.map(({ product, quantity }) => ({ product, quantity }));
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem('cart', JSON.stringify(items));
}

const initialState: CartItem[] = loadCart();

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: { payload: { product: Product; quantity?: number } }) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.find((i) => i.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.push({ product, quantity });
      }
      saveCart(state);
    },
    removeFromCart: (state, action: { payload: string }) => {
      const next = state.filter((i) => i.product.id !== action.payload);
      saveCart(next);
      return next;
    },
    updateQuantity: (state, action: { payload: { productId: string; quantity: number } }) => {
      const item = state.find((i) => i.product.id === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          const next = state.filter((i) => i.product.id !== action.payload.productId);
          saveCart(next);
          return next;
        }
        item.quantity = action.payload.quantity;
        saveCart(state);
      }
    },
    clearCart: () => {
      saveCart([]);
      return [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
