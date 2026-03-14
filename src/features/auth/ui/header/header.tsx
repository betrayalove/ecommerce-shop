import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/features/auth/model/auth-slice';
import { logoutApi } from '@/shared/auth/token';
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
  const { theme, toggleTheme } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = async () => {
    await logoutApi();
    dispatch(logout());
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
            title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
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
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Регистрация
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
