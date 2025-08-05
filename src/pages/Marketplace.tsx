import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Paginator } from 'primereact/paginator';
import { Button } from '../components/shared';
import ProductCard from '../features/marketplace/components/ProductCard';
import FiltersBar from '../features/marketplace/components/FiltersBar';
import { useGetProductsQuery } from '../features/marketplace/slices/productApiSlice';
import type { RootState, AppDispatch } from '../store';

const Marketplace: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data: productsData, isLoading } = useGetProductsQuery({ page });
  const products = productsData?.data || [];
  const totalProducts = productsData?.totalPages ? productsData.totalPages * pageSize : 0;

  const onPageChange = (event: { first: number; rows: number }) => {
    const newPage = Math.floor(event.first / event.rows) + 1;
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container-responsive">
          <div className="text-center">
            <h1 className="hero-title">
              Discover Premium Products
            </h1>
            <p className="hero-subtitle">
              Explore our curated marketplace of premium products from talented creators and manufacturers
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="search-bar flex items-center p-4">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="flex-1 px-4 py-3 border-0 focus:outline-none focus:ring-0 text-neutral-900 placeholder-neutral-500"
                />
                <button className="search-button px-6 py-3 ml-2">
                  <i className="pi pi-search text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-responsive section-padding">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="filter-card">
                <h3 className="filter-title">Filters</h3>
                <p className="text-neutral-300 text-sm mb-6">Refine your search</p>
                <FiltersBar />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="luxury-card mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900">
                    Products
                  </h2>
                  <p className="text-neutral-600">
                    Showing {products.length} of {totalProducts} products
                  </p>
                </div>
                
                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-600">Sort by:</span>
                  <select className="form-input py-2 px-3 text-sm">
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="luxury-card text-center py-16">
                <i className="pi pi-spinner pi-spin text-4xl text-primary-500 mb-4"></i>
                <p className="text-neutral-600 font-medium">Loading products...</p>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                {products.length === 0 ? (
                  <div className="luxury-card text-center py-16">
                    <i className="pi pi-box text-4xl text-neutral-400 mb-4"></i>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      No Products Found
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      Try adjusting your filters or search terms
                    </p>
                    <Button variant="primary" onClick={() => window.location.reload()}>
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {products.map(product => (
                      <div key={product._id} className="animate-fade-in">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {products.length > 0 && (
                  <div className="flex justify-center">
                    <div className="luxury-card">
                      <Paginator
                        first={(page - 1) * pageSize}
                        rows={pageSize}
                        totalRecords={totalProducts}
                        onPageChange={onPageChange}
                        className="border-0"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace; 