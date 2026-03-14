import { LoginForm } from '@/features/auth/ui/login-form/login-form';
import { Card } from '@/shared/ui/card/card';
import './login-page.scss';

export function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-page__container">
        <Card padding="lg" className="login-page__card">
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}
