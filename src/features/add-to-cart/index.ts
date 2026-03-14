import { useDispatch } from 'react-redux';
import { addToCart } from '@/features/cart/model/cart-slice';
import type { Product } from '@/entities/product/model/types';

export type AddToCartFn = (product: Product, quantity?: number) => void;

export function useAddToCart(): AddToCartFn {
  const dispatch = useDispatch();
  return (product: Product, quantity = 1) => {
    dispatch(addToCart({ product, quantity }));
  };
}
