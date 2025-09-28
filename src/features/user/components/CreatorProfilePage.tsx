import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useGetProductsQuery } from '../../marketplace/slices/productApiSlice';
import SearchBar from '../../marketplace/components/SearchBar';
import SortOptions from '../../marketplace/components/SortOptions';
import ProductCard from '../../marketplace/components/ProductCard';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Avatar } from 'primereact/avatar';
import { Card } from 'primereact/card';
import RatingComponent from '../../../components/shared/RatingComponent';
import { useGetCreatorProfileQuery } from '../slices/creatorApiSlice';
import type { User } from '../../../types';
import { Paginator } from 'primereact/paginator';

interface LocationState {
  user?: User;
}

const CreatorProfilePage: React.FC = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const location = useLocation();
  const { data: creatorProfileData, isLoading: loading, error, isFetching: fetching } = useGetCreatorProfileQuery(
    creatorId!,
  );
  const creatorProfile = creatorProfileData?.data;
  const locationState = location.state as LocationState | null;
  const [user, _setUser] = useState<User | undefined>(locationState?.user);
  const [queryParams, setQueryParams] = useState<{ q: string, page: number, sortBy: string }>({ q: '', page: 1, sortBy: '' });
  const params = new URLSearchParams(location.search);
  const initialPage = Number(params.get('page')) || 1;
  const [page, setPage] = useState(initialPage);
  const limit = Number(import.meta.env.VITE_MARKETPLACE_PAGE_LIMIT) || 12;
  // Parse URL parameters
  useEffect(() => {
    const currentPage = parseInt(params.get('page') || '1', 10);
    setPage(currentPage);
    const currentSortBy = params.get('sortBy') || '';
    const currentQ = params.get('q') || '';

    setQueryParams(prev => ({ ...prev, page: currentPage, sortBy: currentSortBy, q: currentQ }));
  }, [location.search]);

  // Fetch products based on URL parameters
  const { data, isLoading: productsLoading, isFetching } = useGetProductsQuery({
    ...queryParams,
    creator: creatorId,
    isMarketplace: false,
  });

  // No need for manual dispatch, handled by RTK Query hook


  const onPageChange = (event: any) => {
    const newPage = event.page + 1; // PrimeReact Paginator is zero-based
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    window.history.pushState({}, '', `${location.pathname}?${params.toString()}`);
  };

  if (loading || fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="var(--surface-ground)" animationDuration="1s" />
      </div>
    );
  }

  if (error) {
    let errorMsg = 'Unknown error';
    if (typeof error === 'string') errorMsg = error;
    else if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') errorMsg = error.message;
      else if ('data' in error && typeof error.data === 'string') errorMsg = error.data;
      else if ('status' in error) errorMsg = `Status ${error.status}`;
    }
    return <div className="text-center text-red-500">{errorMsg}</div>;
  }

  if (!creatorProfile) {
    return <div className="text-center text-gray-500">No creator profile found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header Section */}
      <Card className="shadow-md border border-gray-200 mb-4">
        <div
          className="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-center md:gap-4 p-2"
        >
          {/* Avatar + Name */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex flex-col items-center justify-center w-full">
              <Avatar
                image={user?.avatarUrl || undefined}
                icon={!user?.avatarUrl ? <i className="pi pi-user" style={{ fontSize: '2.5rem', lineHeight: 1 }} /> : undefined}
                shape="circle"
                size="large"
                style={{
                  backgroundColor: !user?.avatarUrl ? '#e5e7eb' : undefined,
                  color: !user?.avatarUrl ? '#2563eb' : undefined,
                  fontWeight: 'bold'
                }}
                className='w-24 h-24 [&>img]:w-full [&>img]:h-full [&>img]:object-cover shadow-lg transition-transform duration-300 hover:scale-105'
              />
              <h1
                className={`text-3xl font-extrabold text-center drop-shadow-md transition-all duration-300 hover:scale-105 mt-2 ${!user?.avatarUrl ? 'text-[#2563eb]' : 'text-gray-900'}`}
              >
                {creatorProfile.name}
              </h1>
            </div>
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold shadow-sm">Creator</span>
          </div>
          {/* Details (all in one card) */}
          <div className="flex flex-col justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 min-h-[100px] w-full md:max-w-[320px] md:self-center md:mr-8">
            <div className="flex items-center mb-2">
              <i className="pi pi-calendar mr-2 text-blue-500"></i>
              <span className="font-semibold text-gray-900 mr-2">Store Opened:</span>
              <span className="text-gray-700 font-medium">{creatorProfile.createdAt ? new Date(creatorProfile.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center mb-2">
              <i className="pi pi-map-marker mr-2 text-red-500"></i>
              <span className="font-semibold text-gray-900 mr-2">Location:</span>
              <span className="text-gray-700 font-medium">{creatorProfile.location}</span>
            </div>
            <div className="flex items-center">
              <i className="pi pi-phone mr-2 text-green-500"></i>
              <span className="font-semibold text-gray-900 mr-2">Phone:</span>
              <span className="text-gray-700 font-medium">{creatorProfile.phone}</span>
            </div>
          </div>
          {/* Rating */}
          <div className="flex flex-col items-center justify-center">
            <RatingComponent
              itemId={creatorProfile._id || ''}
              itemType="creator"
              ownerId={user?.id ? user.id : undefined}
            />
          </div>
        </div>
      </Card>

      {/* Body Section */}
      <main>
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:flex-1">
              <SearchBar />
            </div>
            <div className="w-full sm:w-auto">
              <SortOptions />
            </div>
          </div>
        </section>

        <section>
          {productsLoading || isFetching ? (
            <div className="flex justify-center items-center h-64">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="var(--surface-ground)" animationDuration="1s" />
            </div>
          ) : (
            <>
              {(!data?.data || data?.data.length === 0) ? (
                <div className="text-center text-gray-500 py-8">No products found</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data?.data.map((product: any, index: number) => (
                    <ProductCard key={index} product={product} />
                  ))}
                </div>
              )}
              {data?.totalPages && data?.totalPages > 1 && (
                <Paginator
                  first={((page - 1) * limit)}
                  rows={limit}
                  totalRecords={data?.totalPages ? data.totalPages * limit : 0}
                  onPageChange={onPageChange}
                  className="mt-4"
                />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default CreatorProfilePage;
