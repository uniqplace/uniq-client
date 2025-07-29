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
          <div
            key={idx}
            className="flex flex-col items-center p-2 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            style={{ width: '90px', height: '90px', overflow: 'hidden', position: 'relative' }}
          >
            {isImage ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
              />
            ) : isVideo ? (
              <i className="pi pi-video" style={{ fontSize: '30px', color: '#1976d2' }} />
            ) : isPdf ? (
              <i className="pi pi-file-pdf" style={{ fontSize: '30px', color: '#d32f2f' }} />
            ) : (
              <i className="pi pi-file" style={{ fontSize: '30px', color: '#1976d2' }} />
            )}
            <span className="text-xs text-center mt-1 text-gray-700 truncate w-full absolute bottom-1 px-1">
              {file.name}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative border border-gray-300 rounded-lg p-4 bg-gray-50">
      {(isLoading || isDeleting) && (
        <div
          className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg"
          style={{ zIndex: 10 }}
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
        emptyTemplate={<p className="m-0 text-gray-500">גרור ושחרר קבצים לכאן או לחץ/י לבחירה.</p>}
        disabled={isLoading || isDeleting}
        // הוספת סגנונות מותאמים אישית לכפתורים של Primereact
        // שימו לב: ייתכן שתצטרכו לשחק עם הקלאסים והסלקטורים ב-CSS שלכם
        // כדי לדרוס את סגנונות ברירת המחדל של Primereact בצורה אפקטיבית
        headerTemplate={(options) => {
          const { className, chooseButton, uploadButton, cancelButton } = options;
          return (
            <div className={className} style={{backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
              {chooseButton}
              {uploadButton}
              {cancelButton}
            </div>
          );
        }}
        // הוספת קלאסים עבור גודל קטן יותר של כפתורים
        // נדרש להגדיר את הקלאסים האלו בקובץ CSS גלובלי או בקובץ CSS מודולרי
        chooseOptions={{ icon: 'pi pi-fw pi-plus', label: 'בחר', className: 'p-button-sm' }}
        uploadOptions={{ icon: 'pi pi-fw pi-cloud-upload', label: 'העלה', className: 'p-button-sm' }}
        cancelOptions={{ icon: 'pi pi-fw pi-times', label: 'בטל', className: 'p-button-sm p-button-danger' }}
      />
      {files.length > 0 && renderFilePreview()}
      {fileError && <Message severity="error" text={fileError} className="mt-2 w-full" />}
    </div>
  );
};

export default FilesUpload;