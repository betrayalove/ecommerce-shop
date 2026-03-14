import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '@/features/auth/api/auth-api';
import { Input } from '@/shared/ui/input/input';
import { Button } from '@/shared/ui/button/button';
import { ErrorBlock } from '@/shared/ui/error-block/error-block';
import './register-form.scss';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ email, password }).unwrap();
      navigate('/catalog', { replace: true });
    } catch {
      // error from API
    }
  };

  if (isSuccess) {
    return null;
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2 className="auth-form__title">Регистрация</h2>
      {error && (
        <ErrorBlock
          message={'data' in error ? String((error as { data?: { error?: string } }).data?.error) : 'Ошибка регистрации'}
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
        autoComplete="new-password"
      />
      <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
}
