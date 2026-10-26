import { useLoaderData } from 'react-router-dom';
import './account-page.scss';
import type { AuthUser } from '@/shared/auth/token';

export function AccountPage() {
  const user = useLoaderData() as AuthUser;
  return <section className="account-page">
    <h1>Мой аккаунт</h1>
    <dl><dt>Имя</dt><dd>{user.name}</dd><dt>Email</dt><dd>{user.email}</dd></dl>
  </section>;
}
