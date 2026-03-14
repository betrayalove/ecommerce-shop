import { createSlice } from '@reduxjs/toolkit';

export interface FiltersState {
  category: string;
  priceMin: number | '';
  priceMax: number | '';
  search: string;
}

const initialState: FiltersState = {
  category: '',
  priceMin: '',
  priceMax: '',
  search: '',
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setCategory: (state, action: { payload: string }) => {
      state.category = action.payload;
    },
    setPriceMin: (state, action: { payload: number | '' }) => {
      state.priceMin = action.payload;
    },
    setPriceMax: (state, action: { payload: number | '' }) => {
      state.priceMax = action.payload;
    },
    setSearch: (state, action: { payload: string }) => {
      state.search = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const { setCategory, setPriceMin, setPriceMax, setSearch, resetFilters } =
  filtersSlice.actions;
