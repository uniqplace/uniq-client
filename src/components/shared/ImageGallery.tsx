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
      <div className="w-full h-96 bg-neutral-100 flex items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300">
        <div className="text-center">
          <i className="pi pi-image text-4xl text-neutral-400 mb-2"></i>
          <span className="text-neutral-500 font-medium">No images available</span>
        </div>
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
      <div className="relative group">
        <img
          src={currentImage}
          alt={productTitle}
          className="w-full h-96 lg:h-[500px] object-cover rounded-2xl cursor-pointer transition-all duration-300 group-hover:scale-[1.02] shadow-medium"
          onClick={() => setShowZoomModal(true)}
        />
        {/* Zoom icon indicator */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white p-3 rounded-full shadow-medium opacity-0 group-hover:opacity-100 transition-all duration-200">
          <i className="pi pi-search-plus text-lg"></i>
        </div>
        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail images grid - only show if multiple images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative cursor-pointer transition-all duration-200 rounded-xl overflow-hidden ${
                index === currentImageIndex
                  ? 'ring-2 ring-brand-500 ring-offset-2 scale-105'
                  : 'hover:scale-105'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img
                src={image}
                alt={`${productTitle} ${index + 1}`}
                className={`h-20 w-full object-cover transition-all duration-200 ${
                  index === currentImageIndex
                    ? 'brightness-100'
                    : 'brightness-75 hover:brightness-100'
                }`}
              />
              {index === currentImageIndex && (
                <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                  <i className="pi pi-check text-white text-sm"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Zoom Modal - shows enlarged image */}
      <Dialog
        visible={showZoomModal}
        onHide={() => setShowZoomModal(false)}
        header={
          <div className="flex items-center gap-2">
            <i className="pi pi-image text-brand-500"></i>
            <span className="text-lg font-semibold">{productTitle}</span>
          </div>
        }
        modal
        style={{ width: '90vw', maxWidth: '1000px' }}
        contentStyle={{ padding: '0' }}
        className="luxury-card"
      >
        <div className="relative">
          <img
            src={currentImage}
            alt={productTitle}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          {/* Navigation buttons in zoom modal if multiple images */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="small"
                onClick={handlePrevImage}
                disabled={currentImageIndex === 0}
                icon="pi pi-chevron-left"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white"
              />
              <Button
                variant="secondary"
                size="small"
                onClick={handleNextImage}
                disabled={currentImageIndex === images.length - 1}
                icon="pi pi-chevron-right"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white"
              />
              {/* Image counter in modal */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentImageIndex + 1} of {images.length}
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default ImageGallery;