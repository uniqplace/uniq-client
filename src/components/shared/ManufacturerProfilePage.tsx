import React from 'react';
import { useParams } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Card } from 'primereact/card';
import { useLocation } from 'react-router-dom';
import { useGetManufacturerProfileByUserIdQuery } from '../../features/user/slices/manufacturerApiSlice';
import type { User } from '../../types';
import RatingComponent from './RatingComponent';
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
        <div className="flex flex-col md:flex-row items-center justify-between md:items-start gap-4 p-4">
          <div className="flex flex-col items-center md:items-start gap-3">
            <Avatar
              image={user?.avatarUrl || undefined}
              icon={!user?.avatarUrl ? 'pi pi-user' : undefined}
              shape="circle"
              size="large"
              style={{
                backgroundColor: !user?.avatarUrl ? '#e5e7eb' : undefined,
                color: !user?.avatarUrl ? '#2563eb' : undefined,
                fontSize: 20,
                fontWeight: 'bold'
              }}
              className='w-12 h-12 [&>img]:w-full [&>img]:h-full [&>img]:object-cover'
            />
            <h1 className="text-xl font-bold text-gray-900 text-center md:text-left">{manufacturer.name}</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <i className="pi pi-calendar mr-2 text-blue-500"></i>
                Store Opened
              </h4>
              <p className="text-gray-700 font-medium">{manufacturer.createdAt ? new Date(manufacturer.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <i className="pi pi-map-marker mr-2 text-red-500"></i>
                Location
              </h4>
              <p className="text-gray-700 font-medium">{manufacturer.location}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <i className="pi pi-phone mr-2 text-green-500"></i>
                Phone
              </h4>
              <p className="text-gray-700 font-medium">{manufacturer.phone}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <i className="pi pi-list mr-2 text-purple-500"></i>
                Categories
              </h4>
              <p className="text-gray-700 font-medium">
                {Array.isArray(manufacturer.categories) && manufacturer.categories.length > 0
                  ? manufacturer.categories
                      .map(cat => typeof cat === 'string' ? cat : cat.name)
                      .join(', ')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <RatingComponent itemId={manufacturer._id || ''} itemType="manufacturer" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ManufacturerProfilePage;
