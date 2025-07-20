import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { updateUserProfile, updateUserAvatar } from '../features/marketplace/thunks/userThunk';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { updateUser } from '../features/marketplace/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import UpdateRole from '../components/shared/UpdateRole'; // ← ייבוא הקומפוננטה
import { roleOptions } from '../constants/roles'; // ← ייבוא האופציות
import { Dropdown } from 'primereact/dropdown';

const ProfilePage = () => {
  const user = useAppSelector((state) => state.user);
  const loading = useAppSelector((state) => state.user.loading);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    avatarUrl:
      user.avatarUrl && user.avatarUrl.trim() !== ''
        ? user.avatarUrl
        : user.avatar && user.avatar.trim() !== ''
          ? user.avatar
          : null,
    role: user.role || '', // ← הוסף שדה role
  });

  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showRoleUpdate, setShowRoleUpdate] = useState(false); // ← סטייט חדש

  useEffect(() => {
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      avatarUrl:
        user.avatarUrl && user.avatarUrl.trim() !== ''
          ? user.avatarUrl
          : user.avatar && user.avatar.trim() !== ''
            ? user.avatar
            : null,
      role: user.role || '', // ← הוסף שדה role
    });
    setAvatarError(false);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user.id) return;

    try {
      setUploading(true);
      const actionResult = await dispatch(updateUserAvatar({ file, userId: user.id }));
      if (updateUserAvatar.fulfilled.match(actionResult)) {
        const newAvatarUrl = actionResult.payload;
        setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
        dispatch(updateUser({ avatarUrl: newAvatarUrl }));
        setAvatarError(false);
      } else {
        alert('Failed to upload avatar');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const actionResult = await dispatch(
      updateUserProfile({
        name: formData.name,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
        role: formData.role, // ← הוסף role
      }),
    );

    if (updateUserProfile.fulfilled.match(actionResult)) {
      dispatch(updateUser(actionResult.payload));
      setFormData({
        name: actionResult.payload.name || '',
        bio: actionResult.payload.bio || '',
        avatarUrl: actionResult.payload.avatarUrl || null,
        role: actionResult.payload.role || '',
      });
      setEditMode(false);
    } else {
      alert('Failed to save profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      avatarUrl:
        user.avatarUrl && user.avatarUrl.trim() !== ''
          ? user.avatarUrl
          : user.avatar && user.avatar.trim() !== ''
            ? user.avatar
            : null,
      role: user.role || '', // ← הוסף שורה זו
    });
    setEditMode(false);
    setAvatarError(false);
  };

  // פונקציה לעדכון רול
  const handleRoleUpdated = (updatedUser: any) => {
    dispatch(updateUser(updatedUser));
    setShowRoleUpdate(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow flex flex-col gap-4 items-center relative">
      {/* אייקון איקס בפינה */}
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        onClick={() => navigate('/')}
        title="סגור וחזור לדף הבית"
        style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}
      >
        <i className="pi pi-times" />
      </button>

      <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-300 shadow-sm">
        {formData.avatarUrl && !avatarError ? (
          <img
            src={formData.avatarUrl || undefined}
            alt={formData.name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
            onLoad={() => setAvatarError(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-700 text-white text-5xl font-bold select-none">
            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </div>

      {!editMode ? (
        <>
          <h2 className="text-2xl font-bold">{formData.name}</h2>
          <p><b>Email:</b> {user.email}</p>
          <div className="flex items-center gap-2">
            <b>Role:</b>
            <span>{user.role}</span>
          </div>
          <p><b>Bio:</b> {formData.bio || 'No bio provided'}</p>
          <Button label="Edit Profile" icon="pi pi-pencil" onClick={() => setEditMode(true)} />
        </>
      ) : (
        <>
          <InputText
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full mb-2"
          />
          <InputTextarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Your Bio"
            rows={3}
            className="w-full mb-2"
          />
          {/* Dropdown for role selection */}
          <div className="w-full mb-2">
            <label htmlFor="role" className="block mb-1 font-bold">Role</label>
            <Dropdown
              id="role"
              name="role"
              value={formData.role}
              options={roleOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => setFormData({ ...formData, role: e.value })}
              placeholder="Select Role"
              className="w-full"
            />
          </div>
          <InputText
            name="avatarUrl"
            value={formData.avatarUrl || ''}
            readOnly
            placeholder="Avatar URL"
            className="w-full mb-2"
          />
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          {uploading && <p>Uploading avatar...</p>}
          <div className="flex gap-2 mt-2">
            <Button label="Save" icon="pi pi-check" onClick={handleSave} disabled={uploading} />
            <Button label="Cancel" icon="pi pi-times" className="p-button-secondary" onClick={handleCancel} disabled={uploading} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
