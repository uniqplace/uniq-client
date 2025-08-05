import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from '../../../components/shared';
import ProductUploadForm from './ProductUploadForm';
import type { Product } from '../../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleCardClick = () => {
    navigate(`/product/${product._id}`, { state: { product } });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  return (
    <>
      <div className="group product-card hover:shadow-large transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.jpg'}
            alt={product.title}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-medium">
              <span className="text-lg font-bold text-primary-600">
                ${product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Category Badge */}
          {typeof product.category?.name === 'string' && (
            <div className="absolute top-4 left-4">
              <span className="product-tag">
                {product.category.name}
              </span>
            </div>
          )}

          {/* Hover Overlay with Actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-3">
              <Button
                variant="primary"
                size="small"
                onClick={handleCardClick}
                className="shadow-medium"
              >
                View Details
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={handleEditClick}
                className="bg-white/90 backdrop-blur-sm border-white text-navy-900 hover:bg-white"
              >
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Creator Info */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <i className="pi pi-user text-white text-xs"></i>
            </div>
            <span className="text-sm text-neutral-600">
              {typeof product.creator?.name === 'string' ? product.creator.name : 'Unknown Creator'}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                product.status === 'published' 
                  ? 'bg-success-100 text-success-600' 
                  : 'bg-warning-100 text-warning-600'
              }`}>
                {product.status}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEditClick}
                className="p-2 text-neutral-400 hover:text-primary-500 transition-colors duration-200"
                title="Edit Product"
              >
                <i className="pi pi-pencil text-sm"></i>
              </button>
              <button
                onClick={handleCardClick}
                className="p-2 text-neutral-400 hover:text-primary-500 transition-colors duration-200"
                title="View Details"
              >
                <i className="pi pi-eye text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        header={
          <div className="flex items-center space-x-2">
            <i className="pi pi-pencil text-primary-600"></i>
            <span className="text-lg font-semibold">Edit Product</span>
          </div>
        }
        modal
        style={{ width: '90vw', maxWidth: '800px' }}
        className="luxury-card"
      >
        <ProductUploadForm
          product={product}
          onClose={() => setShowEditDialog(false)}
        />
      </Dialog>
    </>
  );
};

export default ProductCard;