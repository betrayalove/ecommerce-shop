import { Link } from 'react-router-dom';
import type { Product } from '@/entities/product/model/types';
import { Button } from '@/shared/ui/button/button';
import { Card } from '@/shared/ui/card/card';
import type { AddToCartFn } from '@/features/add-to-cart';
import './product-card.scss';

export interface ProductCardProps {
  product: Product;
  onAddToCart: AddToCartFn;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card padding="sm" className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__link">
        <div className="product-card__image-wrap">
          <img
            src={product.image}
            alt={product.title}
            className="product-card__image"
          />
        </div>
        <h3 className="product-card__title">{product.title}</h3>
      </Link>
      <p className="product-card__price">
        {product.price.toLocaleString('ru-RU')} ₽
      </p>
      <Button
        variant="primary"
        size="md"
        fullWidth
        onClick={() => onAddToCart(product, 1)}
      >
        В корзину
      </Button>
    </Card>
  );
}
