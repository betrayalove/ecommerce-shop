import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { API_BASE_URL } from '@/shared/config/api';

export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});
