import { useLoaderData } from 'react-router-dom';
import type { AuthUser } from '@/shared/auth/token';

export function AccountPage() {
  const user = useLoaderData() as AuthUser;
  return <section className="about-page__container">
    <h1>Мой аккаунт</h1>
    <dl><dt>Имя</dt><dd>{user.name}</dd><dt>Email</dt><dd>{user.email}</dd></dl>
  </section>;
}
