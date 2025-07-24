
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../features/marketplace/components/ProductCard';
import type { RootState } from '../store';
import type { AppDispatch } from '../store';
import { fetchProducts } from '../features/marketplace/thunks';
import FiltersBar from '../features/marketplace/components/FiltersBar';import { Paginator } from 'primereact/paginator';
import { fetchCreatorsAndManufacturers } from '../features/marketplace/thunks/marketplaceThunks';
import SearchBar from '../features/marketplace/components/SearchBar';


const Marketplace: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialPage = Number(params.get('page')) || 1;
  const [page, setPage] = useState(initialPage);
  const limit = Number(import.meta.env.VITE_MARKETPLACE_PAGE_LIMIT) || 12;

  useEffect(() => {
    dispatch(fetchCreatorsAndManufacturers());

    const params = new URLSearchParams(location.search);
    const pageParam = Number(params.get('page')) || 1;
    setPage(pageParam);
    // Read main category and subCategories from URL
    const mainCategory = params.get('category') || undefined;
    let subCategoriesArr: string[] | undefined = undefined;
    const subCategoriesParam = params.get('subCategories');
    if (subCategoriesParam) {
      try {
        const parsed = JSON.parse(subCategoriesParam);
        if (Array.isArray(parsed)) {
          subCategoriesArr = parsed.filter((v): v is string => typeof v === 'string' && v !== '' && v !== 'null' && v !== 'undefined');
        } else if (parsed && typeof parsed === 'object') {
          subCategoriesArr = Object.values(parsed).flat().filter((v): v is string => typeof v === 'string' && v !== '' && v !== 'null' && v !== 'undefined');
        }
      } catch {
        subCategoriesArr = undefined;
      }
    }
    dispatch(fetchProducts({
      category: mainCategory,
      subCategories: subCategoriesArr,
      creator: params.get('creator') || '',
      minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      q: params.get('q') || '',
      page: pageParam,
    }));
  }, [location.search]);

  const { products, loading, error, totalPages } = useSelector((state: RootState) => state.marketplace);

  const onPageChange = (event: { page: number }) => {
    const newPage = event.page + 1;
    setPage(newPage);

    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });

    // Read category and subCategories from URL
    const mainCategory = params.get('category') || undefined;
    let subCategoriesArr: string[] | undefined = undefined;
    const subCategoriesParam = params.get('subCategories');
    if (subCategoriesParam) {
      try {
        const parsed = JSON.parse(subCategoriesParam);
        if (Array.isArray(parsed)) {
          subCategoriesArr = parsed.filter((v): v is string => typeof v === 'string' && v !== '' && v !== 'null' && v !== 'undefined');
        } else if (parsed && typeof parsed === 'object') {
          subCategoriesArr = Object.values(parsed).flat().filter((v): v is string => typeof v === 'string' && v !== '' && v !== 'null' && v !== 'undefined');
        }
      } catch {
        subCategoriesArr = undefined;
      }
    }
    dispatch(fetchProducts({
      category: mainCategory,
      subCategories: subCategoriesArr,
      creator: params.get('creator') || '',
      minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      q: params.get('q') || '',
      page: newPage,
    }));
  };

  if(loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-spinner pi-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if(error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-600">Error loading marketplace: {error}</p>
        </div>
      </div>
    );
  }

  // Import SearchBar here to use it above the grid
  // eslint-disable-next-line @typescript-eslint/no-var-requires

  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
        <div className="mb-6">
          <SearchBar />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <FiltersBar />
          </div>
          <div className="flex-1">
            <section className="bg-gray-50 rounded-lg p-4 mb-8">
              <h2 className="text-xl font-semibold mb-4">Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-3 text-center text-gray-500 py-8">Products not found</div>
                ) : (
                  products.map(product => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  ))
                )}
              </div>
            </section>
            <div className="flex justify-center mt-8">
              <Paginator
                first={((page - 1) * limit)}
                rows={limit}
                totalRecords={totalPages ? totalPages * limit : 0}
                onPageChange={onPageChange}
                template="PrevPageLink PageLinks NextPageLink"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Marketplace; 