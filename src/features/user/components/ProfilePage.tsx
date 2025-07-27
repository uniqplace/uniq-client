import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FileUpload } from 'primereact/fileupload';
import { updateUser } from '../slice/userSlice';
import { useNavigate } from 'react-router-dom';
import FilesUpload from '../../../components/shared/FilesUpload';
import { useUpdateUserAvatarMutation, useUpdateUserMutation } from '../slice/userApiSlice';
import { roleOptions } from '../../../constants/roles';
import { useUploadImagesMutation } from '../../../api/apiSlice';
import { useDeleteImagesMutation } from '../../../api/apiSlice'; // ייבוא ה-mutation

const ProfilePage = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const [updateUserMutation, { isLoading: isUpdatingUser, isError: isUpdateError, error: updateError }] = useUpdateUserMutation();
  const [uploadFilesMutation, { isLoading: isUploadingFiles, isError: isUploadFilesError, error: uploadFilesError }] = useUploadImagesMutation();
  const [updateUserAvatarMutation, { isLoading: isUpdatingAvatar, isError: isUpdateAvatarError, error: updateAvatarError }] = useUpdateUserAvatarMutation();
  const [deleteImagesMutation] = useDeleteImagesMutation();

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
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(user.portfolio || []);

  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioFileError, setPortfolioFileError] = useState<string | null>(null);

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
  }, [user]);

  useEffect(() => {
    if (isUpdateError) {
      toast.current?.show({ severity: 'error', summary: 'Profile Update Failed', detail: (updateError as any)?.data?.message || 'Could not update profile.', life: 5000 });
    }
    if (isUploadFilesError) {
      toast.current?.show({ severity: 'error', summary: 'File Upload Failed', detail: (uploadFilesError as any)?.data?.message || 'Could not upload files.', life: 5000 });
    }
    if (isUpdateAvatarError) {
      toast.current?.show({ severity: 'error', summary: 'Avatar Update Failed', detail: (updateAvatarError as any)?.data?.message || 'Could not update avatar.', life: 5000 });
    }
  }, [isUpdateError, updateError, isUploadFilesError, uploadFilesError, isUpdateAvatarError, updateAvatarError]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleItemChange = useCallback(
    (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      if (value.length > 500) return;
      setter((prev) => prev.map((item, i) => (i === index ? value : item)));
    },
    []
  );

  const handleAddPortfolioLink = useCallback(() => {
    setPortfolioUrls((prev) => [...prev, '']);
  }, []);

  const handleAvatarFileChange = useCallback(
    async (event: any) => {
      const file = event.files?.[0];
      if (!file || !user.id) return;

      const formDataToSend = new FormData();
      formDataToSend.append('files', file);

      try {
        const uploadedUrls = await uploadFilesMutation(formDataToSend).unwrap();
        const newAvatarUrl = uploadedUrls[0];
        setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
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

  const handlePortfolioLinkChange = useCallback(
    (idx: number, value: string) => {
      if (value.length > 500) return;
      setPortfolioUrls((prev) => prev.map((item, i) => (i === idx ? value : item)));
    },
    []
  );

  const handleRemovePortfolioItem = useCallback(
    async (itemToRemove: string) => {
      try {
        await deleteImagesMutation([itemToRemove]).unwrap(); // מחיקה מהענן
        setPortfolioUrls((prev) => prev.filter((item) => item !== itemToRemove)); // מחיקה מה-state
        toast.current?.show({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Portfolio item deleted from cloud.',
          life: 3000,
        });
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Delete Failed',
          detail: 'Could not delete file from cloud.',
          life: 3000,
        });
      }
    },
    [deleteImagesMutation]
  );

  const handleAddItem = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      setter((prev) => [...prev, '']);
    },
    []
  );

  const handleRemoveItem = useCallback(
    (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      setter((prev) => prev.filter((_, i) => i !== index));
    },
    []
  );

  const handleCancel = useCallback(() => {
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
    toast.current?.show({ severity: 'info', summary: 'Changes Canceled', detail: 'Your unsaved changes have been discarded.', life: 3000 });
  }, [user]);

  const handleSave = async () => {
    try {
      const actionResult = await updateUserMutation({
        name: formData.name,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
        role: formData.role,
        skills: formData.role === 'creator' ? skills : [],
        servicesOffered: formData.role === 'manufacturer' ? servicesOffered : [],
        portfolio: formData.role === 'creator' ? portfolioUrls : [],
      }).unwrap();
      dispatch(updateUser(actionResult));
      setEditMode(false);
      toast.current?.show({ severity: 'success', summary: 'Profile Updated', detail: 'Your profile has been saved successfully!', life: 3000 });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const isLoading = isUpdatingUser || isUploadingFiles || isUpdatingAvatar;

  return (
    <div className="flex justify-content-center align-items-center min-h-screen bg-gray-100 p-4">
      <Toast ref={toast} />

      <div className="surface-card p-5 shadow-2 border-round w-full max-w-xl relative">
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-full flex justify-content-center align-items-center bg-white-alpha-80 z-5">
            <ProgressSpinner strokeWidth="4" animationDuration=".8s" />
          </div>
        )}

        <Button
          icon="pi pi-times"
          className="p-button-text p-button-secondary p-button-rounded absolute top-3 right-3"
          onClick={() => navigate('/')}
          tooltip="Close and return to home page"
          tooltipOptions={{ position: 'left' }}
        />

        {/* This div now controls the main layout for both edit and read-only modes */}
        <div className="flex flex-col items-center gap-4 w-full">

          {/* Avatar and associated edit button (always present but edit button shown only in editMode) */}
          <div className="relative mb-4"> {/* Added mb-4 for space below avatar area */}
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-primary shadow-1 flex justify-content-center align-items-center bg-gray-200">
              {avatarPreviewUrl && !avatarLoadError ? (
                <img
                  src={avatarPreviewUrl}
                  alt={formData.name || 'Avatar'}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <span className="text-6xl text-color-secondary font-bold select-none">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>
            {editMode && (
              <FileUpload
                mode="basic"
                name="avatar"
                accept="image/*"
                maxFileSize={5000000} // 5MB limit
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
            // Read-Only View - Consolidated and better layout
            <div className="w-full flex flex-col gap-3 text-lg text-center"> {/* Added text-center for alignment */}
              <h2 className="text-2xl font-bold mb-1">{user.name || 'No Name'}</h2>
              {user.bio && <p className="text-color-secondary mb-2 max-w-prose mx-auto">{user.bio}</p>} {/* mx-auto to center bio */}
              {user.role && <p className="text-lg font-medium text-primary-500 mb-3">Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>}

              {/* Skills for creator */}
              {user.role === 'creator' && user.skills && user.skills.length > 0 && (
                <div className="field">
                  <span className="font-bold text-900 block mb-1">Skills:</span> {/* block and mb-1 for better spacing */}
                  <ul className="list-disc ml-4 text-left inline-block"> {/* inline-block to shrink ul width, text-left for list */}
                    {user.skills.map((skill, idx) => (
                      <li key={idx} className="mb-1">{skill}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Services for manufacturer */}
              {user.role === 'manufacturer' && user.servicesOffered && user.servicesOffered.length > 0 && (
                <div className="field">
                  <span className="font-bold text-900 block mb-1">Facilities / Services Offered:</span>
                  <ul className="list-disc ml-4 text-left inline-block">
                    {user.servicesOffered.map((service, idx) => (
                      <li key={idx} className="mb-1">{service}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Portfolio */}
              {user.portfolio && user.portfolio.length > 0 && (
                <div className="field">
                  <span className="font-bold text-900 block mb-3">Portfolio:</span> {/* Increased margin-bottom for separation */}
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3"> {/* Removed mt-3 as gap-3 should be enough */}
                    {user.portfolio.map((item, idx) => (
                      <div key={idx} className="relative aspect-square border border-gray-300 rounded-md overflow-hidden flex items-center justify-content-center bg-gray-100">
                        {item.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i) ? (
                          <img src={item} alt={`Portfolio item ${idx}`} className="w-full h-full object-cover" />
                        ) : item.match(/^https?:\/\/.+\.(mp4|mov|avi)$/i) ? (
                          <i className="pi pi-video text-3xl text-primary-500" />
                        ) : item.match(/^https?:\/\/.+\.pdf$/i) ? (
                          <i className="pi pi-file-pdf text-3xl text-red-500" />
                        ) : item.startsWith('http') ? (
                          <a href={item} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline flex items-center justify-content-center w-full h-full text-center p-2 text-sm">
                            <i className="pi pi-link text-lg mr-1" /> Link
                          </a>
                        ) : (
                          <span className="text-gray-500 text-sm text-center p-2">{item}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-content-end mt-4 w-full">
                <Button label="Edit Profile" icon="pi pi-pencil" onClick={() => setEditMode(true)} className="p-button-primary" />
              </div>
            </div>
          ) : (
            // Edit Mode - Remains largely the same with gap-3 for fields
            <div className="w-full flex flex-col gap-3">
              <InputText
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full"
                maxLength={50}
              />
              <InputTextarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full"
                maxLength={500}
              />
              <div>
                <label htmlFor="role" className="block text-900 font-medium mb-2">Role</label>
                <Dropdown
                  id="role"
                  name="role"
                  value={formData.role}
                  options={roleOptions}
                  optionLabel="label"
                  optionValue="value"
                  onChange={(e) => setFormData({ ...formData, role: e.value })}
                  placeholder="Select a Role"
                  className="w-full"
                />
              </div>

              {/* Skills for creator */}
              {formData.role === 'creator' && (
                <div className="field">
                  <label className="block text-900 font-medium mb-2">Skills</label>
                  {skills.map((skill, idx) => (
                    <div key={idx} className="p-inputgroup mb-2">
                      <InputText
                        value={skill}
                        maxLength={500}
                        onChange={(e) => handleItemChange(idx, e.target.value, setSkills)}
                        placeholder="e.g., UI/UX Design, 3D Modeling"
                        className="w-full"
                      />
                      <Button icon="pi pi-minus" className="p-button-danger" onClick={() => handleRemoveItem(idx, setSkills)} />
                    </div>
                  ))}
                  <Button label="Add Skill" icon="pi pi-plus" className="p-button-text" onClick={() => handleAddItem(setSkills)} />
                </div>
              )}

              {/* Services for manufacturer */}
              {formData.role === 'manufacturer' && (
                <div className="field">
                  <label className="block text-900 font-medium mb-2">Facilities / Services Offered</label>
                  {servicesOffered.map((service, idx) => (
                    <div key={idx} className="p-inputgroup mb-2">
                      <InputText
                        value={service}
                        maxLength={500}
                        onChange={(e) => handleItemChange(idx, e.target.value, setServicesOffered)}
                        placeholder="e.g., CNC Machining, Laser Cutting"
                        className="w-full"
                      />
                      <Button icon="pi pi-minus" className="p-button-danger" onClick={() => handleRemoveItem(idx, setServicesOffered)} />
                    </div>
                  ))}
                  <Button label="Add Service" icon="pi pi-plus" className="p-button-text" onClick={() => handleAddItem(setServicesOffered)} />
                </div>
              )}

              {/* Portfolio */}
              <div className="field">
                <label className="block text-900 font-medium mb-2">Portfolio Links</label>
                {portfolioUrls
                  .filter(
                    (item) =>
                      !item.match(/\.(jpg|jpeg|png|gif|mp4|mov|avi|pdf)$/i)
                  )
                  .map((item, idx) => (
                    <div key={idx} className="p-inputgroup mb-2">
                      <InputText
                        value={item}
                        maxLength={500}
                        onChange={(e) => handlePortfolioLinkChange(idx, e.target.value)}
                        placeholder="Enter URL (e.g., website, Behance, YouTube)"
                        className="w-full"
                      />
                      <Button
                        icon="pi pi-minus"
                        className="p-button-danger"
                        onClick={() => handleRemoveItem(idx, setPortfolioUrls)}
                      />
                    </div>
                  ))}
                <Button
                  label="Add Link"
                  icon="pi pi-plus"
                  className="p-button-text mr-2"
                  onClick={handleAddPortfolioLink}
                />

                <FilesUpload
                  files={portfolioFiles}
                  setFiles={setPortfolioFiles}
                  fileError={portfolioFileError}
                  setFileError={setPortfolioFileError}
                  onUploaded={(urls) => {
                    setPortfolioUrls((prev) => [...prev, ...urls]);
                    toast.current?.show({
                      severity: 'success',
                      summary: 'Files Uploaded',
                      detail: 'Portfolio files uploaded successfully!',
                      life: 3000,
                    });
                  }}
                  fileUrls={portfolioUrls.filter((url) => url.match(/\.(jpg|jpeg|png|gif|mp4|mov|avi|pdf)$/i))}
                  accept="image/*,video/*,application/pdf"
                  maxFileSize={20_000_000}
                />

                {portfolioUrls.filter((url) => url.match(/\.(jpg|jpeg|png|gif|mp4|mov|avi|pdf)$/i)).length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                    {portfolioUrls
                      .filter((url) => url.match(/\.(jpg|jpeg|png|gif|mp4|mov|avi|pdf)$/i))
                      .map((url) => (
                        <div
                          key={url}
                          className="relative aspect-square border border-gray-300 rounded-md overflow-hidden flex items-center justify-content-center bg-gray-100"
                        >
                          {url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img src={url} alt="Portfolio Item" className="w-full h-full object-cover" />
                          ) : url.match(/\.(mp4|mov|avi)$/i) ? (
                            <i className="pi pi-video text-3xl text-primary-500" />
                          ) : url.match(/\.pdf$/i) ? (
                            <i className="pi pi-file-pdf text-3xl text-red-500" />
                          ) : null}
                          <Button
                            type="button"
                            icon="pi pi-times"
                            className="p-button-rounded p-button-danger p-button-sm absolute top-0 right-0 -mt-2 -mr-2"
                            onClick={() => handleRemovePortfolioItem(url)}
                            tooltip="Remove item"
                          />
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="flex justify-content-end gap-2 mt-4">
                <Button label="Cancel" icon="pi pi-times" className="p-button-secondary" onClick={handleCancel} disabled={isLoading} />
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