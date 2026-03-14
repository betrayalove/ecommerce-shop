import { RegisterForm } from '@/features/auth/ui/register-form/register-form';
import { Card } from '@/shared/ui/card/card';
import './register-page.scss';

export function RegisterPage() {
  return (
    <div className="register-page">
      <div className="register-page__container">
        <Card padding="lg" className="register-page__card">
          <RegisterForm />
        </Card>
      </div>
    </div>
  );
}
