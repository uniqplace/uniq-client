import React from 'react';
import { FileUpload, type FileUploadSelectEvent } from 'primereact/fileupload';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDeleteImagesMutation, useUploadImagesMutation } from '../../api/apiSlice';
import './FilesUpload.css';

interface FilesUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  fileError?: string | null;
  setFileError?: (msg: string | null) => void;
  onUploaded?: (urls: string[]) => void;
  fileUrls?: string[];
  accept?: string;
  maxFileSize?: number;
}

const FilesUpload: React.FC<FilesUploadProps> = ({
  files,
  setFiles,
  fileError,
  setFileError,
  onUploaded,
  fileUrls = [],
  accept = "image/*,video/*,application/pdf",
  maxFileSize = 20_000_000
}) => {
  const [uploadFiles, { isLoading }] = useUploadImagesMutation();
  const [deleteFiles, { isLoading: isDeleting }] = useDeleteImagesMutation();

  const handleUploadToServer = async () => {
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    try {
      const urls = await uploadFiles(formData).unwrap();
      if (onUploaded) onUploaded(urls);
      setFiles([]);
    } catch {
      if (setFileError) setFileError('File upload failed');
    }
  };

  const handleCancel = async () => {
    if (fileUrls.length > 0) {
      try {
        await deleteFiles(fileUrls).unwrap();
      } catch {
        if (setFileError) setFileError('Failed to delete files from server');
      }
      setFiles([]);
      if (setFileError) setFileError(null);
      if (onUploaded) onUploaded([]);
    } else {
      setFiles([]);
      if (setFileError) setFileError(null);
    }
  };

  const renderFilePreview = () => (
    <div className="file-preview">
      {files.map((file, idx) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isPdf = file.type === 'application/pdf';
        return (
          <div key={idx} className="file-preview-item">
            {isImage ? (
              <img src={URL.createObjectURL(file)} alt={file.name} className="file-preview-img" />
            ) : isVideo ? (
              <i className="pi pi-video file-preview-icon video" />
            ) : isPdf ? (
              <i className="pi pi-file-pdf file-preview-icon pdf" />
            ) : (
              <i className="pi pi-file file-preview-icon" />
            )}
            <span className="file-preview-name">{file.name}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="files-upload-container">
      {(isLoading || isDeleting) && (
        <div className="files-upload-spinner">
          <ProgressSpinner style={{ width: 40, height: 40 }} />
        </div>
      )}
      <FileUpload
        name="files"
        customUpload
        multiple
        auto={false}
        uploadHandler={handleUploadToServer}
        onClear={handleCancel}
        onSelect={(e: FileUploadSelectEvent) => setFiles(e.files as File[])}
        accept={accept}
        maxFileSize={maxFileSize}
        emptyTemplate={
          <p className="files-upload-empty">
            Drag and drop files here or click to select.
          </p>
        }
        disabled={isLoading || isDeleting}
        headerTemplate={(options) => {
          const { className, chooseButton, uploadButton, cancelButton } = options;
          return (
            <div className={`files-upload-header ${className}`}>
              <div className="files-upload-header-inner">
                <div className="files-upload-btn">{chooseButton}</div>
                <div className="files-upload-btn">{uploadButton}</div>
                <div className="files-upload-btn">{cancelButton}</div>
              </div>
            </div>
          );
        }}
        chooseOptions={{
          icon: 'pi pi-fw pi-plus',
          label: 'Choose',
          className: 'p-button-sm p-button-rounded files-upload-btn'
        }}
        uploadOptions={{
          icon: 'pi pi-fw pi-cloud-upload',
          label: 'Upload',
          className: 'p-button-sm p-button-rounded p-button-success files-upload-btn'
        }}
        cancelOptions={{
          icon: 'pi pi-fw pi-times',
          label: 'Cancel',
          className: 'p-button-sm p-button-rounded p-button-danger files-upload-btn'
        }}
      />
      {files.length > 0 && renderFilePreview()}
      {fileError && <Message severity="error" text={fileError} className="mt-2 w-full text-center" />}
      <div className="files-upload-info">
        Max file size: {(maxFileSize / 1000000).toFixed(1)} MB
      </div>
      <div className="files-upload-info">
        Accepted types: {accept}
      </div>
    </div>
  );
};

export default FilesUpload;
