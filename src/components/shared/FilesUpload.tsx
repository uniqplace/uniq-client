import React from 'react';
import { FileUpload, type FileUploadSelectEvent } from 'primereact/fileupload';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDeleteImagesMutation, useUploadImagesMutation } from '../../api/apiSlice';

interface FilesUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  fileError?: string | null;
  setFileError?: (msg: string | null) => void;
  onUploaded?: (urls: string[]) => void;
  fileUrls?: string[];
  accept?: string; // e.g. "image/*,video/*,application/pdf"
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

  // Preview for files
  const renderFilePreview = () => (
    <div className="flex flex-wrap gap-2 mt-2">
      {files.map((file, idx) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isPdf = file.type === 'application/pdf';
        return (
          <div key={idx} className="flex flex-col items-center p-2 border rounded bg-blue-50">
            {isImage ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : isVideo ? (
              <i className="pi pi-video" style={{ fontSize: 40, color: '#1976d2' }} />
            ) : isPdf ? (
              <i className="pi pi-file-pdf" style={{ fontSize: 40, color: '#d32f2f' }} />
            ) : (
              <i className="pi pi-file" style={{ fontSize: 40, color: '#1976d2' }} />
            )}
            <span className="text-xs mt-1">{file.name}</span>
          </div>
        );
      })}
    </div>
  );

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
        name="files"
        customUpload
        multiple
        auto={false}
        uploadHandler={handleUploadToServer}
        onClear={handleCancel}
        onSelect={(e: FileUploadSelectEvent) => setFiles(e.files as File[])}
        accept={accept}
        maxFileSize={maxFileSize}
        emptyTemplate={<p className="m-0">Drag and drop files here.</p>}
        disabled={isLoading || isDeleting}
      />
      {files.length > 0 && renderFilePreview()}
      {fileError && <Message severity="error" text={fileError} />}
    </div>
  );
};

export default FilesUpload;
