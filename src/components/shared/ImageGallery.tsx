// ImageGallery Component - displays product images with main image and thumbnail navigation
// Features: main large image, clickable thumbnails, zoom modal functionality
import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from '../shared';
interface ImageGalleryProps {
  images: string[];
  productTitle: string;
}
const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productTitle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);
  // Handle case when no images are provided
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }


  const currentImage = images[currentImageIndex];

  // Extracted navigation handlers
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => Math.min(images.length - 1, prev + 1));
  };



  return (
    <div className="flex flex-col space-y-4">
      {/* Main large image - clickable to open zoom modal */}
      <div className="relative">
        <img
          src={currentImage}
          alt={productTitle}
          className="w-full h-96 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setShowZoomModal(true)}
        />
        {/* Zoom icon indicator */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full">
          <i className="pi pi-search-plus"></i>
        </div>
      </div>
      {/* Thumbnail images grid - only show if multiple images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${productTitle} ${index + 1}`}
              className={`h-20 w-full object-cover rounded cursor-pointer transition-all ${
                index === currentImageIndex
                  ? 'border-2 border-blue-500 opacity-100'
                  : 'border border-gray-300 opacity-70 hover:opacity-100'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      )}
      {/* Zoom Modal - shows enlarged image */}
      <Dialog
        visible={showZoomModal}
        onHide={() => setShowZoomModal(false)}
        header={productTitle}
        modal
        style={{ width: '80vw', maxWidth: '800px' }}
        contentStyle={{ padding: '0' }}
        closeIcon={<i className="pi pi-times" style={{ fontSize: '1.5rem' }} />}

      >
        <div className="relative">
          <img
            src={currentImage}
            alt={productTitle}
            className="w-full h-auto max-h-[70vh] object-contain"
          />
          {/* Navigation buttons in zoom modal if multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <Button
                variant="secondary"
                size="small"
                onClick={handlePrevImage}
                disabled={currentImageIndex === 0}
                icon="pi pi-chevron-left"
              />
              <Button
                variant="secondary"
                size="small"
                onClick={handleNextImage}
                disabled={currentImageIndex === images.length - 1}
                icon="pi pi-chevron-right"
              />
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};
export default ImageGallery;