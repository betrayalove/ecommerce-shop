import { useSelector } from 'react-redux';
import { useGetProductsQuery } from '@/shared/api/products-api';
import type { RootState } from '@/app/store';
import { ProductCard } from '@/entities/product/ui/product-card/product-card';
import { FiltersBar } from '@/features/filters/ui/filters-bar/filters-bar';
import { Loader } from '@/shared/ui/loader/loader';
import { ErrorBlock } from '@/shared/ui/error-block/error-block';
import { EmptyState } from '@/shared/ui/empty-state/empty-state';
import { useAddToCart } from '@/features/add-to-cart';
import './catalog-page.scss';

export function CatalogPage() {
  const { data: products = [], isLoading, error } = useGetProductsQuery();
  const filters = useSelector((state: RootState) => state.filters);

  const addToCartFn = useAddToCart();

  const filteredProducts = products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.priceMin !== '' && p.price < filters.priceMin) return false;
    if (filters.priceMax !== '' && p.price > filters.priceMax) return false;
    if (
      filters.search &&
      !p.title.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  if (isLoading) return <Loader />;
  if (error) {
    return (
      <ErrorBlock
        message={'data' in error ? String((error as { data?: { error?: string } }).data?.error ?? 'Ошибка загрузки') : 'Ошибка загрузки каталога'}
      />
    );
  }

  return (
    <div className="catalog-page">
      <div className="catalog-page__container">
        <h1 className="catalog-page__title">Каталог</h1>
        <FiltersBar />
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="Нет товаров"
            description="Попробуйте изменить фильтры или позже вернуться в каталог."
          />
        ) : (
          <div className="catalog-page__grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCartFn}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
