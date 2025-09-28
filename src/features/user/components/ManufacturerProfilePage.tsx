import React from 'react';
import { useParams } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Card } from 'primereact/card';
import { useLocation } from 'react-router-dom';
import { useGetManufacturerProfileByUserIdQuery } from '../slices/manufacturerApiSlice';
import type { User } from '../../../types';
import RatingComponent from '../../../components/shared/RatingComponent';
import { ProgressSpinner } from 'primereact/progressspinner';

const ManufacturerProfilePage: React.FC = () => {
  const { manufacturerId } = useParams<{ manufacturerId: string }>();
  const location = useLocation();
  const { data, isLoading, error, isFetching } = useGetManufacturerProfileByUserIdQuery(manufacturerId!);
  const manufacturer = data;
  const locationState = location.state as { user?: User } | null;
  const user = locationState?.user;

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="var(--surface-ground)" animationDuration="1s" />
      </div>
    );
  }

  if (error) {
  return <div className="text-center text-red-500">Error loading manufacturer data</div>;
  }

  if (!manufacturer) {
  return <div className="text-center text-gray-500">No manufacturer data found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
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
                {manufacturer.name}
              </h1>
            </div>
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold shadow-sm">Manufacturer</span>
          </div>
          {/* Details (all in one card) */}
          <div className="flex flex-col justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 min-h-[100px] w-full md:max-w-[320px] md:self-center md:mr-8">
            <div className="flex items-center mb-2">
              <i className="pi pi-calendar mr-2 text-blue-500"></i>
              <span className="font-semibold text-gray-900 mr-2">Store Opened:</span>
              <span className="text-gray-700 font-medium">{manufacturer.createdAt ? new Date(manufacturer.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center mb-2">
              <i className="pi pi-map-marker mr-2 text-red-500"></i>
              <span className="font-semibold text-gray-900 mr-2">Location:</span>
              <span className="text-gray-700 font-medium">{manufacturer.location}</span>
            </div>
            <div className="flex items-center mb-2">
              <i className="pi pi-phone mr-2 text-green-500"></i>
              <span className="font-semibold text-gray-900 mr-2">Phone:</span>
              <span className="text-gray-700 font-medium">{manufacturer.phone || '-'}</span>
            </div>
            <div className="flex items-center">
              <i className="pi pi-list mr-2 text-purple-500"></i>
              <span className="font-semibold text-gray-900 mr-2">Categories:</span>
              <span className="text-gray-700 font-medium">
                {Array.isArray(manufacturer.categories) && manufacturer.categories.length > 0
                  ? manufacturer.categories
                      .map(cat => typeof cat === 'string' ? cat : cat.name)
                      .join(', ')
                  : 'N/A'}
              </span>
            </div>
          </div>
          {/* Rating */}
          <div className="flex flex-col items-center justify-center">
            <RatingComponent 
            itemId={manufacturer._id || ''} 
            itemType="manufacturer"
            ownerId={user?.id ? user.id : undefined}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ManufacturerProfilePage;
