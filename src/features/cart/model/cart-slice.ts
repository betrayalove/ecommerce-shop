import { createSlice } from '@reduxjs/toolkit';
import type { CartItem } from '@/entities/cart-item/model/types';
import type { Product } from '@/entities/product/model/types';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem('cart');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { product: Product; quantity: number }[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.product && typeof item.product.id === 'string' && typeof item.product.title === 'string' && typeof item.product.image === 'string' && Number.isFinite(item.product.price) && item.product.price >= 0 && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 999).map(({ product, quantity }) => ({ product, quantity }));
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try { localStorage.setItem('cart', JSON.stringify(items)); } catch {
    window.dispatchEvent(new Event('cart-storage-error'));
  }
}

const initialState: CartItem[] = loadCart();

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: { payload: { product: Product; quantity?: number } }) => {
      const { product, quantity = 1 } = action.payload;
      if (!Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(product.price) || product.price < 0) return;
      const existing = state.find((i) => i.product.id === product.id);
      if (existing) {
        existing.quantity = Math.min(999, existing.quantity + quantity);
      } else {
        state.push({ product, quantity: Math.min(999, quantity) });
      }
      saveCart(state);
    },
    removeFromCart: (state, action: { payload: string }) => {
      const next = state.filter((i) => i.product.id !== action.payload);
      saveCart(next);
      return next;
    },
    updateQuantity: (state, action: { payload: { productId: string; quantity: number } }) => {
      if (!Number.isInteger(action.payload.quantity)) return;
      const item = state.find((i) => i.product.id === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          const next = state.filter((i) => i.product.id !== action.payload.productId);
          saveCart(next);
          return next;
        }
        item.quantity = Math.min(999, action.payload.quantity);
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
