import { API_BASE_URL } from '@/shared/config/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Проверяет авторизацию через cookie (httpOnly).
 * Не читает токен из localStorage.
 */
export async function checkAuth(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data as AuthUser;
  } catch {
    return null;
  }
}

/** Сбрасывает auth cookie на сервере (вызывать при выходе). */
export async function logoutApi(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch {}
}
