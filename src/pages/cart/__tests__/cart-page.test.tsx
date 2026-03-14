import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/shared/lib/test-utils';
import { CartPage } from '../cart-page';
import { store } from '@/app/store';
import { addToCart, clearCart } from '@/features/cart/model/cart-slice';

const mockProduct = {
  id: '1',
  title: 'Товар в корзине',
  price: 3000,
  category: 'electronics',
  description: 'Описание',
  image: 'https://example.com/1.jpg',
};

describe('CartPage', () => {
  beforeEach(() => {
    store.dispatch(clearCart());
  });

  it('отображает пустое состояние, когда корзина пуста', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText('Корзина пуста')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /в каталог/i })).toBeInTheDocument();
  });

  it('отображает добавленные позиции и итоговую сумму', () => {
    store.dispatch(addToCart({ product: mockProduct, quantity: 2 }));
    renderWithProviders(<CartPage />);

    expect(screen.getByText('Товар в корзине')).toBeInTheDocument();
    expect(screen.getByText(/3\s*000/)).toBeInTheDocument();
    expect(screen.getByText(/Итого:/)).toBeInTheDocument();
    const totalBlock = screen.getByText(/Итого:/);
    expect(totalBlock).toHaveTextContent(/6\s*000/);
  });
});
