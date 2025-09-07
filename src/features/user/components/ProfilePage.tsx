

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FileUpload } from 'primereact/fileupload';
import { useNavigate } from 'react-router-dom';
import FilesUpload from '../../../components/shared/FilesUpload';
import { useUpdateUserAvatarMutation, useUpdateUserMutation } from '../slices/userApiSlice';
import ManufacturerFields, { type ManufacturerFieldsRef } from './ManufacturerFields';
import { roleOptions } from '../../../constants/roles';
import { useUploadImagesMutation, useDeleteImagesMutation } from '../../../api/apiSlice';
import { updateManufacturerProfile } from '../slices/manufacturerSlice';
import { updateUser } from '../slices/userSlice';

const ProfilePage: React.FC = () => {
  const user = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  // Server mutations
  const [updateUserMutation, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [uploadFilesMutation] = useUploadImagesMutation();
  const [updateUserAvatarMutation] = useUpdateUserAvatarMutation();
  const [deleteImagesMutation] = useDeleteImagesMutation();

  // Local form state
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl?.trim() || '',
    role: user.role || 'customer',
  });
  const [editMode, setEditMode] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(formData.avatarUrl);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [servicesOffered, setServicesOffered] = useState<string[]>(user.servicesOffered || []);
  const [rating, ] = useState<number>(0);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(user.portfolio || []);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioFileError, setPortfolioFileError] = useState<string | null>(null);

  // Manufacturer fields
  const [categories, setCategories] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const manufacturerFieldsRef = useRef<ManufacturerFieldsRef>(null);

  // Sync state with user on load
  useEffect(() => {
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl?.trim() || '',
      role: user.role || 'customer',
    });
    setAvatarPreviewUrl(user.avatarUrl?.trim() || '');
    setSkills(user.skills || []);
    setServicesOffered(user.servicesOffered || []);
    setPortfolioUrls(user.portfolio || []);
    setAvatarLoadError(false);
    setCategories([]);
    setLocation('');
    setAvailableFrom('');
  }, [user]);

  // Reset manufacturer fields if role changes
  useEffect(() => {
    if (formData.role !== 'manufacturer') {
      setCategories([]);
      setLocation('');
      setAvailableFrom('');
      setServicesOffered([]);
    }
  }, [formData.role]);

  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleItemChange = useCallback(
    (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      setter(prev => prev.map((item, i) => (i === index ? value : item)));
    },
    []
  );

  const handleAddItem = useCallback((setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  }, []);

  const handleRemoveItem = useCallback(
    (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      setter(prev => prev.filter((_, i) => i !== index));
    },
    []
  );

  const handleAvatarFileChange = useCallback(
    async (event: any) => {
      const file = event.files?.[0];
      if (!file || !user.id) return;

      const formDataToSend = new FormData();
      formDataToSend.append('files', file);

      try {
        const uploadedUrls = await uploadFilesMutation(formDataToSend).unwrap();
        const newAvatarUrl = uploadedUrls[0];
        setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
        setAvatarPreviewUrl(newAvatarUrl);
        await updateUserAvatarMutation(newAvatarUrl);
        toast.current?.show({ severity: 'success', summary: 'Avatar Uploaded', detail: 'Your avatar has been updated successfully!', life: 3000 });
      } catch (error) {
        setAvatarLoadError(true);
        console.error('Failed to upload avatar:', error);
      }
    },
    [uploadFilesMutation, updateUserAvatarMutation, user.id]
  );

  const handlePortfolioLinkChange = (idx: number, value: string) => {
    setPortfolioUrls(prev => prev.map((item, i) => (i === idx ? value : item)));
    }

  const handleAddPortfolioLink = () => setPortfolioUrls(prev => [...prev, '']);

  const handleRemovePortfolioItem = async (itemToRemove: string) => {
    try {
      await deleteImagesMutation([itemToRemove]).unwrap();
      setPortfolioUrls(prev => prev.filter(item => item !== itemToRemove));
      toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Portfolio item deleted.', life: 3000 });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Delete Failed', detail: 'Could not delete file.', life: 3000 });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl?.trim() || '',
      role: user.role || 'customer',
    });
    setAvatarPreviewUrl(user.avatarUrl?.trim() || '');
    setSkills(user.skills || []);
    setServicesOffered(user.servicesOffered || []);
    setPortfolioUrls(user.portfolio || []);
    setEditMode(false);
    setAvatarLoadError(false);
    setPortfolioFiles([]);
    setPortfolioFileError(null);
    toast.current?.show({ severity: 'info', summary: 'Changes Canceled', detail: 'Unsaved changes discarded.', life: 3000 });
  };

  const handleSave = async () => {
    // Validate manufacturer fields locally
    if (formData.role === 'manufacturer' && manufacturerFieldsRef.current) {
      const valid = manufacturerFieldsRef.current.validate();
      if (!valid) {
        toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required manufacturer fields.', life: 3000 });
        return;
      }
    }

    // Save user profile
    try {
      // Build valid manufacturer object if needed
      let manufacturerObj = undefined;
      if (formData.role === 'manufacturer') {
        manufacturerObj = {
          userId: {
            _id: user.id || '',
            name: formData.name || user.name || '',
            email: user.email || '',
            avatarUrl: user.avatarUrl || user.avatar || ''
          },
          name: formData.name || user.name || '',
          categories,
          location,
          availableFrom,
          servicesOffered,
          rating
        };
      }

      const actionResult = await updateUserMutation({
        name: formData.name,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
        role: formData.role,
        skills: formData.role === 'creator' ? skills : [],
        portfolio: formData.role === 'creator' ? portfolioUrls : [],
        manufacturer: manufacturerObj
      })
      .unwrap();

      dispatch(updateUser(actionResult));

      if (formData.role === 'manufacturer' && user.id) {
        const manufacturerPayload = {
          userId: user.id || '', // ManufacturerProfile expects string
          name: formData.name || user.name || '',
          categories,
          location,
          availableFrom,
          servicesOffered,
          rating,
        };
        dispatch(updateManufacturerProfile(manufacturerPayload));
      }
      setEditMode(false);
      toast.current?.show({ severity: 'success', summary: 'Profile Updated', detail: 'Profile saved successfully!', life: 3000 });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const isLoading = isUpdatingUser;

  return (
    <div className="flex justify-content-center align-items-center min-h-screen bg-gray-100 p-4">
      <Toast ref={toast} />
      <div className="surface-card p-5 shadow-2 border-round w-full max-w-xl relative">
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-full flex justify-content-center align-items-center bg-white-alpha-80 z-5">
            <ProgressSpinner strokeWidth="4" animationDuration=".8s" />
          </div>
        )}

        <Button icon="pi pi-times" className="p-button-text p-button-secondary p-button-rounded absolute top-3 right-3" onClick={() => navigate('/')} />

        <div className="flex flex-col items-center gap-4 w-full">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-primary shadow-1 flex justify-content-center align-items-center bg-gray-200">
              {avatarPreviewUrl && !avatarLoadError ? (
                <img src={avatarPreviewUrl} alt={formData.name || 'Avatar'} className="w-full h-full object-cover" onError={() => setAvatarLoadError(true)} />
              ) : (
                <span className="text-6xl text-color-secondary font-bold select-none">{formData.name ? formData.name.charAt(0).toUpperCase() : '?'}</span>
              )}
            </div>
            {editMode && (
              <FileUpload
                mode="basic"
                name="avatar"
                accept="image/*"
                maxFileSize={5000000}
                auto
                customUpload
                uploadHandler={handleAvatarFileChange}
                chooseLabel=""
                chooseOptions={{ icon: 'pi pi-pencil', className: 'p-button-rounded p-button-text p-button-sm absolute bottom-0 right-0' }}
                disabled={isLoading}
              />
            )}
          </div>

          {!editMode ? (
            <div className="w-full flex flex-col gap-3 text-lg text-center">
              <h2 className="text-2xl font-bold mb-1">{user.name || 'No Name'}</h2>
              {user.bio && <p className="text-color-secondary mb-2 max-w-prose mx-auto">{user.bio}</p>}
              {user.role && <p className="text-lg font-medium text-primary-500 mb-3">Role: {user.role}</p>}
              {/* Skills, Services, Portfolio displayed here similar to your original code */}
              <div className="flex justify-content-end mt-4 w-full">
                <Button label="Edit Profile" icon="pi pi-pencil" onClick={() => setEditMode(true)} className="p-button-primary" />
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <InputText name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full" maxLength={50} />
              <InputTextarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." rows={4} className="w-full" maxLength={500} />
              <Dropdown
                value={formData.role}
                options={roleOptions}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => setFormData({ ...formData, role: e.value })}
                placeholder="Select a Role"
                className="w-full"
              />
              {/* Skills */}
              {formData.role === 'creator' && skills.map((skill, idx) => (
                <div key={idx} className="p-inputgroup mb-2">
                  <InputText value={skill} onChange={e => handleItemChange(idx, e.target.value, setSkills)} />
                  <Button icon="pi pi-minus" onClick={() => handleRemoveItem(idx, setSkills)} />
                </div>
              ))}
              {formData.role === 'creator' && <Button label="Add Skill" icon="pi pi-plus" onClick={() => handleAddItem(setSkills)} />}

              {/* Manufacturer fields */}
              {formData.role === 'manufacturer' && (
                <ManufacturerFields
                  ref={manufacturerFieldsRef}
                  servicesOffered={servicesOffered}
                  setServicesOffered={setServicesOffered}
                  categories={categories}
                  setCategories={setCategories}
                  location={location}
                  setLocation={setLocation}
                  availableFrom={availableFrom}
                  setAvailableFrom={setAvailableFrom}
                  handleItemChange={handleItemChange}
                  handleAddItem={handleAddItem}
                  handleRemoveItem={handleRemoveItem}
                  disabled={isLoading}
                />
              )}

              {/* Portfolio */}
              <div className="field">
                {portfolioUrls.map((item, idx) => (
                  <div key={idx} className="p-inputgroup mb-2">
                    <InputText value={item} onChange={e => handlePortfolioLinkChange(idx, e.target.value)} />
                    <Button icon="pi pi-minus" onClick={() => handleRemovePortfolioItem(item)} />
                  </div>
                ))}
                <Button label="Add Link" icon="pi pi-plus" onClick={handleAddPortfolioLink} />
                <FilesUpload
                  files={portfolioFiles}
                  setFiles={setPortfolioFiles}
                  fileError={portfolioFileError}
                  setFileError={setPortfolioFileError}
                  onUploaded={(urls) => setPortfolioUrls(prev => [...prev, ...urls])}
                  fileUrls={portfolioUrls}
                />
              </div>

              <div className="flex justify-content-end gap-2 mt-4">
                <Button label="Cancel" icon="pi pi-times" onClick={handleCancel} disabled={isLoading} />
                <Button label="Save" icon="pi pi-check" onClick={handleSave} disabled={isLoading} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
