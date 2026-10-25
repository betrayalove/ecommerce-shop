import { createBrowserRouter, Navigate, redirect, RouterProvider } from 'react-router-dom';
import { Layout } from '@/shared/ui/layout/layout';
import { CatalogPage } from '@/pages/catalog';
import { ProductPage } from '@/pages/product';
import { CartPage } from '@/pages/cart';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { AccountPage } from '@/pages/account/account-page';
import { AboutPage } from '@/pages/about';
import { checkAuth } from '@/shared/auth/token';

async function accountLoader() {
  const user = await checkAuth();
  if (!user) return redirect('/login');
  return user;
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
      { index: true, element: <Navigate to="/catalog" replace /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'product/:id', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'about', element: <AboutPage /> },
      {
        path: 'account',
        loader: accountLoader,
        element: <AccountPage />,
      },
      { path: '*', element: <Navigate to="/catalog" replace /> },
    ],
  },
  ],
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
