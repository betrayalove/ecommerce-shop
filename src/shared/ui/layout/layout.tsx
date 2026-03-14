import { Outlet } from 'react-router-dom';
import { Header } from '@/features/auth/ui/header/header';
import { useGetMeQuery } from '@/features/auth/api/auth-api';
import './layout.scss';

export function Layout() {
  useGetMeQuery();
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}
