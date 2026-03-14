import { act } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/shared/lib/test-utils';
import { LoginForm } from '../login-form';
import { useLoginMutation } from '@/features/auth/api/auth-api';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('@/features/auth/api/auth-api', () => ({
  ...jest.requireActual('@/features/auth/api/auth-api'),
  useLoginMutation: jest.fn(),
}));

const mockUseLoginMutation = useLoginMutation as jest.MockedFunction<typeof useLoginMutation>;

describe('LoginForm', () => {
  it('при ошибке от API показывает сообщение об ошибке', () => {
    const mockLogin = jest.fn();
    mockUseLoginMutation.mockReturnValue([
      mockLogin,
      {
        isLoading: false,
        error: { data: { error: 'Неверный email или пароль' } },
        isSuccess: false,
      },
    ] as any);

    renderWithProviders(<LoginForm />);
    expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument();
  });

  it('при отправке вызывает login с введёнными email и паролем', async () => {
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    mockUseLoginMutation.mockReturnValue([
      mockLogin,
      { isLoading: false, error: null, isSuccess: false },
    ] as any);

    renderWithProviders(<LoginForm />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
      await userEvent.type(screen.getByLabelText(/пароль/i), '123456');
      await userEvent.click(screen.getByRole('button', { name: /войти/i }));
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'admin@test.com',
      password: '123456',
    });
  });
});
