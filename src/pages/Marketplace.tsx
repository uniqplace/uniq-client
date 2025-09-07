import React, { useEffect, useState } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../features/marketplace/components/ProductCard';
import { useGetProductsQuery } from '../features/marketplace/slices/productApiSlice';
import FiltersBar from '../features/marketplace/components/FiltersBar'; import { Paginator } from 'primereact/paginator';
import SearchBar from '../features/marketplace/components/SearchBar';
import { useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';

// Helper to parse subCategories from URLSearchParams
function parseSubCategoriesFromParams(params: URLSearchParams): string[] | undefined {
  const subCategoriesParam = params.get('subCategories');
  if (subCategoriesParam) {
    try {
      const parsed = JSON.parse(subCategoriesParam);
      if (Array.isArray(parsed)) {
        return parsed.filter((v): v is string => typeof v === 'string' && v !== '' && v !== 'null' && v !== 'undefined');
      } else if (parsed && typeof parsed === 'object') {
        return Object.values(parsed).flat().filter((v): v is string => typeof v === 'string' && v !== '' && v !== 'null' && v !== 'undefined');
      }
    } catch {
      return undefined;
    }
  }
  return undefined;
}

const Marketplace: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialPage = Number(params.get('page')) || 1;
  const [page, setPage] = useState(initialPage);
  const limit = Number(import.meta.env.VITE_MARKETPLACE_PAGE_LIMIT) || 12;
  const loading = useSelector((state: any) => state.marketplace.loading);
  const toast = React.useRef<Toast>(null);

  useEffect(() => {
    const pageParam = Number(params.get('page')) || 1;
    setPage(pageParam);
  }, [location.search, params]);

  // Build filters for RTK Query
  const mainCategory = params.get('category') || undefined;
  const subCategoriesArr = parseSubCategoriesFromParams(params);
const queryFilters = React.useMemo(() => ({
    category: mainCategory,
    subCategories: subCategoriesArr,
    creator: params.get('creator') || '',
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    q: params.get('q') || '',
    page,
}), [mainCategory, subCategoriesArr, params, page]);
  const { data: productsData, error: productsError, isLoading, isFetching } = useGetProductsQuery(queryFilters);

  React.useEffect(() => {
    if (!isFetching && !isLoading && productsData && productsData.message && productsData.success === false) {
      toast.current?.show({
        severity: 'info',
        summary: 'Note!',
        detail: productsData.message,
        life: 3000,
      });
    }
  }, [isFetching, isLoading, productsData]);

  // Use products from RTK Query
  const products = isLoading ? [] : productsData?.data || [];
  const totalPages = productsData?.totalPages || 1;
  const error = productsError;

  const onPageChange = (event: { page: number }) => {
    const newPage = event.page + 1;
    setPage(newPage);
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
    // refetch will be triggered automatically by page state change
  };

  if (error) {
    let errorMsg = 'Unknown error';
    if (typeof error === 'string') errorMsg = error;
    else if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') errorMsg = error.message;
      else if ('status' in error && 'data' in error) errorMsg = `Status ${error.status}`;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-600">Error loading marketplace: {errorMsg}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="var(--surface-ground)" animationDuration="1s" />
        <span className="text-gray-600 mt-4 block">Loading marketplace...</span>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
        <div className="mb-6">
          <SearchBar />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <FiltersBar productsData={productsData} />
          </div>
          <div className="flex-1">
            <section className="bg-gray-50 rounded-lg p-4 mb-8">
              <h2 className="text-xl font-semibold mb-4">Products</h2>
              {isLoading || isFetching || loading ? (
                <div className="flex flex-col justify-center items-center py-12">
                  <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="var(--surface-ground)" animationDuration="1s" />
                  <span className="text-gray-600 mt-4 block">Loading products...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No products found</div>
                  ) : (
                    products.map(product => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        isHorizontal={true}
                      />
                    ))
                  )}
                </div>
              )}
            </section>
            <div className="flex justify-center mt-8">
              <div className="flex justify-center mt-8">
                <Paginator
                  first={((page - 1) * limit)}
                  rows={limit}
                  totalRecords={totalPages ? totalPages * limit : 0}
                  onPageChange={onPageChange}
                  template="PrevPageLink PageLinks NextPageLink"
                  className="!bg-transparent !shadow-none !border-0 !p-0"
                  pt={{
                    pageButton: (options) => {
                      const isActive = options?.context?.active ?? false;
                      return {
                        className: `!rounded-full !mx-1 !w-9 !h-9 !text-base font-semibold transition-all duration-200 border-2
                            ${isActive
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg border-blue-500 ring-2 ring-purple-400'
                            : 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800 dark:hover:to-purple-800 hover:text-blue-700'
                          }`
                      };
                    },
                    prevPageButton: { className: '!rounded-full !w-9 !h-9 !mx-1 border-2 border-blue-200 dark:border-blue-700' },
                    nextPageButton: { className: '!rounded-full !w-9 !h-9 !mx-1 border-2 border-blue-200 dark:border-blue-700' },
                    root: { className: '!border-0 !bg-transparent !shadow-none !p-0' },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Marketplace;