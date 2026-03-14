import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/features/auth/api/auth-api';
import { Input } from '@/shared/ui/input/input';
import { Button } from '@/shared/ui/button/button';
import { ErrorBlock } from '@/shared/ui/error-block/error-block';
import './login-form.scss';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error, isSuccess }] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();
      navigate('/catalog', { replace: true });
    } catch {
      // error from API is in error object
    }
  };

  if (isSuccess) {
    return null;
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="auth-form__title">Вход</h2>
      {error && (
        <ErrorBlock
          message={'data' in error ? String((error as { data?: { error?: string } }).data?.error) : 'Ошибка входа'}
        />
      )}
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  );
}
