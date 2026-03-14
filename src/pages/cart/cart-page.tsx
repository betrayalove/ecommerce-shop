import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { removeFromCart, updateQuantity } from '@/features/cart/model/cart-slice';
import { Button } from '@/shared/ui/button/button';
import { EmptyState } from '@/shared/ui/empty-state/empty-state';
import './cart-page.scss';

export function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-page__container">
          <h1 className="cart-page__title">Корзина</h1>
          <EmptyState
            title="Корзина пуста"
            description="Добавьте товары из каталога."
          />
          <Link to="/catalog">
            <Button variant="primary">В каталог</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-page__container">
        <h1 className="cart-page__title">Корзина</h1>
        <ul className="cart-page__list">
          {items.map((item) => (
            <li key={item.product.id} className="cart-page__item">
              <img
                src={item.product.image}
                alt={item.product.title}
                className="cart-page__item-image"
              />
              <div className="cart-page__item-info">
                <h3 className="cart-page__item-title">{item.product.title}</h3>
                <p className="cart-page__item-price">
                  {item.product.price.toLocaleString('ru-RU')} ₽
                </p>
                <div className="cart-page__item-actions">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      dispatch(
                        updateQuantity({
                          productId: item.product.id,
                          quantity: isNaN(v) ? 1 : Math.max(1, v),
                        })
                      );
                    }}
                    className="cart-page__quantity-input"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(removeFromCart(item.product.id))}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
              <p className="cart-page__item-subtotal">
                {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
              </p>
            </li>
          ))}
        </ul>
        <div className="cart-page__footer">
          <p className="cart-page__total">
            Итого: <strong>{total.toLocaleString('ru-RU')} ₽</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
