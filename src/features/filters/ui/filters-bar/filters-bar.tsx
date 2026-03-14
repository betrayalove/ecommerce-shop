import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import {
  setCategory,
  setPriceMin,
  setPriceMax,
  setSearch,
  resetFilters,
} from '@/features/filters/model/filters-slice';
import { Button } from '@/shared/ui/button/button';
import './filters-bar.scss';

const CATEGORIES = [
  { value: '', label: 'Все категории' },
  { value: 'electronics', label: 'Электроника' },
  { value: 'clothing', label: 'Одежда' },
  { value: 'books', label: 'Книги' },
  { value: 'accessories', label: 'Аксессуары' },
];

export function FiltersBar() {
  const dispatch = useDispatch();
  const { category, priceMin, priceMax, search } = useSelector(
    (state: RootState) => state.filters
  );

  return (
    <div className="filters-bar">
      <div className="filters-bar__group">
        <label className="filters-bar__label">Поиск</label>
        <input
          type="text"
          className="filters-bar__input"
          placeholder="Название товара"
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
        />
      </div>
      <div className="filters-bar__group">
        <label className="filters-bar__label">Категория</label>
        <select
          className="filters-bar__select"
          value={category}
          onChange={(e) => dispatch(setCategory(e.target.value))}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="filters-bar__group">
        <label className="filters-bar__label">Цена от</label>
        <input
          type="number"
          className="filters-bar__input"
          placeholder="0"
          min={0}
          value={priceMin === '' ? '' : priceMin}
          onChange={(e) =>
            dispatch(setPriceMin(e.target.value === '' ? '' : Number(e.target.value)))
          }
        />
      </div>
      <div className="filters-bar__group">
        <label className="filters-bar__label">Цена до</label>
        <input
          type="number"
          className="filters-bar__input"
          placeholder="—"
          min={0}
          value={priceMax === '' ? '' : priceMax}
          onChange={(e) =>
            dispatch(setPriceMax(e.target.value === '' ? '' : Number(e.target.value)))
          }
        />
      </div>
      <Button variant="ghost" size="sm" onClick={() => dispatch(resetFilters())}>
        Сбросить
      </Button>
    </div>
  );
}
