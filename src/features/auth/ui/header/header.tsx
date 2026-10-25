import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authApi, useLogoutMutation } from '@/features/auth/api/auth-api';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/app/store';
import { Button } from '@/shared/ui/button/button';
import { useTheme } from '@/app/theme-context';
import './header.scss';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout, { isLoading: loggingOut, error: logoutError }] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(authApi.util.resetApiState());
      navigate('/catalog');
    } catch { /* Keep the active session visible so the user can retry. */ }
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/catalog" className="header__logo">
          Интернет-магазин
        </Link>
        <nav className="header__nav">
          <button
            type="button"
            className="header__theme-toggle"
            onClick={toggleTheme}
            title={theme === 'light' ? '☀️' : '🌙'}
            aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <Link to="/catalog" className="header__link">
            Каталог
          </Link>
          <Link to="/cart" className="header__link header__link--cart">
            Корзина
            {cartCount > 0 && (
              <span className="header__cart-count">{cartCount}</span>
            )}
          </Link>
          <Link to="/about" className="header__link">
            О нас
          </Link>
          {user ? (
            <>
              <span className="header__user">
                {user.name || user.email}
              </span>
              <Link to="/account" className="header__link">Мой аккаунт</Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="button button--ghost button--sm">Войти</Link>
              <Link to="/register" className="button button--primary button--sm">Регистрация</Link>
            </>
          )}
        </nav>
        {logoutError && <p role="alert">Не удалось выйти. Попробуйте ещё раз.</p>}
      </div>
    </header>
  );
}
