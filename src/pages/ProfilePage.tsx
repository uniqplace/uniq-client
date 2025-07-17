import { useEffect, useState } from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { updateUserProfile } from '../features/marketplace/thunks/userThunk';
import { fetchCurrentUser } from '../features/marketplace/thunks/userThunk';

const ProfilePage = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();


  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || user.avatar || ''
  });

  useEffect(() => {
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || user.avatar || ''
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await dispatch(updateUserProfile({
      name: formData.name,
      bio: formData.bio,
      avatarUrl: formData.avatarUrl
    }));
    await dispatch(fetchCurrentUser());
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || user.avatar || ''
    });
    setEditMode(false);
  };

  if (!user.name) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow flex flex-col gap-4 items-center">
      <Avatar
        image={formData.avatarUrl || undefined}
        label={!formData.avatarUrl && user.name ? user.name.charAt(0).toUpperCase() : undefined}
        size="xlarge"
        shape="circle"
        style={{
          backgroundColor: !formData.avatarUrl ? '#1d4ed8' : undefined,
          color: '#fff',
          fontSize: 32,
        }}
      />

      {!editMode ? (
        <>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>
          <p><b>Bio:</b> {user.bio || 'No bio provided'}</p>
          <Button label="Edit Profile" icon="pi pi-pencil" onClick={() => setEditMode(true)} />
        </>
      ) : (
        <>
          <InputText name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
          <InputTextarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Your Bio" rows={3} />
          <InputText name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} placeholder="Avatar URL" />
          <div className="flex gap-2">
            <Button label="Save" icon="pi pi-check" onClick={handleSave} />
            <Button label="Cancel" icon="pi pi-times" className="p-button-secondary" onClick={handleCancel} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
