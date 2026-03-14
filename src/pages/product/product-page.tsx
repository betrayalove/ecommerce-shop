import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetProductByIdQuery } from '@/shared/api/products-api';
import { useAddToCart } from '@/features/add-to-cart';
import { Button } from '@/shared/ui/button/button';
import { Loader } from '@/shared/ui/loader/loader';
import { ErrorBlock } from '@/shared/ui/error-block/error-block';
import './product-page.scss';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading, error } = useGetProductByIdQuery(id!, {
    skip: !id,
  });
  const addToCart = useAddToCart();

  if (!id) {
    return (
      <div className="product-page__container">
        <ErrorBlock message="Не указан ID товара" />
      </div>
    );
  }

  if (isLoading) return <Loader />;
  if (error || !product) {
    return (
      <div className="product-page__container">
        <ErrorBlock
          message={'data' in (error || {}) ? String((error as { data?: { error?: string } })?.data?.error ?? 'Товар не найден') : 'Товар не найден'}
        />
        <Link to="/catalog">Вернуться в каталог</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="product-page">
      <div className="product-page__container">
        <div className="product-page__content">
          <div className="product-page__image-wrap">
            <img
              src={product.image}
              alt={product.title}
              className="product-page__image"
            />
          </div>
          <div className="product-page__info">
            <h1 className="product-page__title">{product.title}</h1>
            <p className="product-page__price">
              {product.price.toLocaleString('ru-RU')} ₽
            </p>
            <p className="product-page__description">{product.description}</p>
            <div className="product-page__actions">
              <label className="product-page__quantity-label">
                Количество:
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="product-page__quantity-input"
                />
              </label>
              <Button variant="primary" size="lg" onClick={handleAddToCart}>
                В корзину
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
