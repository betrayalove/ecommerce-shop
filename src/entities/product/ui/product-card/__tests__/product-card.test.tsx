import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/shared/lib/test-utils';
import { ProductCard } from '../product-card';

const mockProduct = {
  id: '1',
  title: 'Тестовый товар',
  price: 5000,
  category: 'electronics',
  description: 'Описание',
  image: 'https://example.com/img.jpg',
};

describe('ProductCard', () => {
  it('кнопка «В корзину» вызывает onAddToCart с товаром и количеством 1', async () => {
    const onAddToCart = jest.fn();
    renderWithProviders(
      <ProductCard product={mockProduct} onAddToCart={onAddToCart} />
    );

    await userEvent.click(screen.getByRole('button', { name: /в корзину/i }));

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct, 1);
  });

  it('отображает название и цену товара', () => {
    const onAddToCart = jest.fn();
    renderWithProviders(
      <ProductCard product={mockProduct} onAddToCart={onAddToCart} />
    );
    expect(screen.getByText('Тестовый товар')).toBeInTheDocument();
    expect(screen.getByText(/5\s*000/)).toBeInTheDocument();
  });
});
