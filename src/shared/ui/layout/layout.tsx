import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/features/auth/ui/header/header';
import { useGetMeQuery } from '@/features/auth/api/auth-api';
import './layout.scss';

export function Layout() {
  useGetMeQuery();
  const [storageError, setStorageError] = useState(false);
  useEffect(() => { const onError = () => setStorageError(true); window.addEventListener('cart-storage-error', onError); return () => window.removeEventListener('cart-storage-error', onError); }, []);
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        {storageError && <p role="alert">Корзина хранится только до закрытия страницы: браузер не разрешил сохранить данные.</p>}
        <Outlet />
      </main>
    </div>
  );
}
