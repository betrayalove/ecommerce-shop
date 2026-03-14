import { act } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/shared/lib/test-utils';
import { CatalogPage } from '../catalog-page';
import { useGetProductsQuery } from '@/shared/api/products-api';

const mockProducts = [
  {
    id: '1',
    title: 'Смартфон X1',
    price: 29990,
    category: 'electronics',
    description: 'Описание',
    image: 'https://example.com/1.jpg',
  },
  {
    id: '2',
    title: 'Футболка Classic',
    price: 1290,
    category: 'clothing',
    description: 'Описание',
    image: 'https://example.com/2.jpg',
  },
];

jest.mock('@/shared/api/products-api', () => ({
  ...jest.requireActual('@/shared/api/products-api'),
  useGetProductsQuery: jest.fn(),
}));

const mockUseGetProductsQuery = useGetProductsQuery as jest.MockedFunction<
  typeof useGetProductsQuery
>;

describe('CatalogPage', () => {
  beforeEach(() => {
    mockUseGetProductsQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      isFetching: false,
      isSuccess: true,
      isError: false,
      currentData: mockProducts,
      isUninitialized: false,
    } as any);
  });

  it('рендерит карточки товаров из каталога', async () => {
    renderWithProviders(<CatalogPage />);
    await waitFor(() => {
      expect(screen.getByText('Смартфон X1')).toBeInTheDocument();
    });
    expect(screen.getByText('Футболка Classic')).toBeInTheDocument();
    expect(screen.getByText(/29\s*990/)).toBeInTheDocument();
    expect(screen.getByText(/1\s*290/)).toBeInTheDocument();
  });

  it('фильтр по категории меняет отображаемый список', async () => {
    renderWithProviders(<CatalogPage />);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    const categorySelect = screen.getByRole('combobox');
    await act(async () => {
      await userEvent.selectOptions(categorySelect, 'electronics');
    });
    await waitFor(() => {
      expect(screen.getByText('Смартфон X1')).toBeInTheDocument();
      expect(screen.queryByText('Футболка Classic')).not.toBeInTheDocument();
    });
  });
});
