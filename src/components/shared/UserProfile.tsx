import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { useGetUserByIdQuery } from '../../features/user/slices/userApiSlice';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: profile, isLoading: loading, error } = useGetUserByIdQuery(id!, { skip: !id });

  if (loading) return <div className="p-8 text-center">טוען פרופיל...</div>;
  if (error) return <div className="p-8 text-center text-red-500">שגיאה בטעינת פרופיל</div>;
  if (!profile) return <div className="p-8 text-center text-red-500">לא נמצא פרופיל למשתמש {id}</div>;

  // Navigate by role
  if (profile.role === 'manufacturer') {
    navigate(`/manufacturer/${profile.manufacturerId || id}`);
    return null;
  }
  if (profile.role === 'creator') {
    navigate(`/creator/${profile.creatorId || id}`);
    return null;
  }

  // Default profile UI
  return (
    <div className="p-4 flex justify-center">
      <Card title="פרופיל משתמש" className="w-full max-w-xl">
        <div className="flex flex-col items-center gap-3">
          <Avatar
            image={profile.avatarUrl}
            label={(!profile.avatarUrl && (profile.name?.[0] || profile.email?.[0] || '?').toUpperCase()) || undefined}
            size="xlarge"
            shape="circle"
            className="mb-3"
          />
          <div className="font-semibold text-lg">{profile.name || profile.email || profile.id}</div>
          <div className="text-gray-500">{profile.email}</div>
          {profile.role && (
            <Badge value={profile.role} className="bg-blue-100 text-blue-800" style={{ direction: 'rtl' }}></Badge>
          )}
          {/* You can add more fields here if they exist in User */}
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;