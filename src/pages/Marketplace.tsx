
import React, { useEffect, useState } from 'react';
// Use VITE_MARKETPLACE_PAGE_LIMIT from .env, fallback to 12 if not set
import { useSelector, useDispatch } from 'react-redux';
import ProductCard from '../features/marketplace/components/ProductCard';
import type { RootState } from '../store';
import type { AppDispatch } from '../store';
import { fetchProducts } from '../features/marketplace/thunks';
import MarketplaceFilters from '../features/marketplace/components/MarketplaceFilters';
import { Paginator } from 'primereact/paginator';
import { fetchCreatorsAndManufacturers } from '../features/marketplace/thunks/marketplaceThunks';



const Marketplace: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  // Fetch creators and manufacturers on mount
  useEffect(() => {
    dispatch(fetchCreatorsAndManufacturers());
  }, []);
  // Fetch first page of products on mount
  React.useEffect(() => {
    dispatch(fetchProducts({
      page: 1,
    }));
  }, []);
  const { products, loading, error, totalPages } = useSelector((state: RootState) => state.marketplace);

  const [page, setPage] = useState(1);
  const limit = Number(import.meta.env.VITE_MARKETPLACE_PAGE_LIMIT) || 12;

  const onPageChange = (event: { page: number }) => {
    setPage(event.page + 1); // PrimeReact starts with 0
    dispatch(fetchProducts({
      page: event.page + 1,
    }));
  };


  return (
    <>
    {loading && <div>Loading...</div>}
    {error && <div>Error: {error}</div>}
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
      {/* Search/Filter Form */}
      <MarketplaceFilters />

      {/* Products Grid */}
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
      {/* Pagination */}
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
    </>
  );
};

export default Marketplace; 