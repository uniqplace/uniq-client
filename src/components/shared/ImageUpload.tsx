import React from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Message } from 'primereact/message';
import { useDeleteImagesMutation, useUploadImagesMutation } from '../../api/apiSlice';
import { ProgressSpinner } from 'primereact/progressspinner';

interface ImageUploadProps {
  images: File[];
  setImages: (files: File[]) => void;
  imageError?: string | null;
  setImageError?: (msg: string | null) => void;
  onUploaded?: (urls: string[]) => void;
  imageUrls?: string[]; // הוסף prop זה!
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  setImages,
  imageError,
  setImageError,
  onUploaded,
  imageUrls = [], // ברירת מחדל למערך ריק
}) => {
  const [uploadImages, { isLoading }] = useUploadImagesMutation();
  const [deleteImages, { isLoading: isDeleting }] = useDeleteImagesMutation();

  const handleUploadToServer = async () => {
    if (!images.length) return;
    const formData = new FormData();
    images.forEach((file) => formData.append('images', file));
    try {
      const urls = await uploadImages(formData).unwrap();
      if (onUploaded) onUploaded(urls);
    } catch {
      if (setImageError) setImageError('Image upload failed');
    }
  };

  const handleCancel = async () => {
    if (imageUrls.length > 0) {
      try {
        await deleteImages(imageUrls).unwrap();
      } catch {
        if (setImageError) setImageError('Failed to delete images from server');
      }
      setImages([]);
      if (setImageError) setImageError(null);
      if (onUploaded) onUploaded([]);
    } else {
      setImages([]);
      if (setImageError) setImageError(null);
    }
  };
  return (
    <div style={{ position: 'relative' }}>
      {(isLoading || isDeleting) && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255,255,255,0.7)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ProgressSpinner style={{ width: 50, height: 50 }} />
        </div>
      )}
      <FileUpload
        name="images"
        customUpload
        multiple
        auto={false}
        uploadHandler={handleUploadToServer}
        onClear={handleCancel}
        onSelect={(e) => setImages(e.files as File[])}
        accept="image/*"
        maxFileSize={10_000_000}
        emptyTemplate={<p className="m-0">Drag and drop images here.</p>}
        disabled={isLoading || isDeleting}
      />
      {imageError && <Message severity="error" text={imageError} />}
    </div>
  );
};

export default ImageUpload;