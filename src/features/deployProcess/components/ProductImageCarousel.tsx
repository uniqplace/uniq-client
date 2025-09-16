// components/ProductImageCarousel.tsx
import { useState } from 'react';

interface ProductImageCarouselProps {
  images: string[];
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images }) => {
  const [imgIndex, setImgIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col items-center mb-2">
      <div className="relative">
        <img
          src={images[imgIndex]}
          alt={`Product ${imgIndex + 1}`}
          className="w-32 h-32 object-cover rounded shadow"
        />
        {images.length > 1 && (
          <>
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 hover:text-blue-600"
              style={{ zIndex: 2, background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}
              onClick={() => setImgIndex(i => i === 0 ? images.length - 1 : i - 1)}
              title="Previous image"
            >
              <span className="pi pi-chevron-left text-xl" />
            </button>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 hover:text-blue-600"
              style={{ zIndex: 2, background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}
              onClick={() => setImgIndex(i => i === images.length - 1 ? 0 : i + 1)}
              title="Next image"
            >
              <span className="pi pi-chevron-right text-xl" />
            </button>
          </>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {imgIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ProductImageCarousel;
