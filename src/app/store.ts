import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '@/features/auth/model/auth-slice';
import { cartSlice } from '@/features/cart/model/cart-slice';
import { filtersSlice } from '@/features/filters/model/filters-slice';
import { authApi } from '@/features/auth/api/auth-api';
import { productsApi } from '@/shared/api/products-api';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
    filters: filtersSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, productsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
