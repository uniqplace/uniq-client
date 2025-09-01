import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/shared';
import { Dialog } from 'primereact/dialog';
import ProductUploadForm from './ProductUploadForm';
import type { Product } from '../../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  editable?: boolean;
  isHorizontal?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  editable = false,
  isHorizontal = false
}) => {
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  const handleViewDetails = () => {
    navigate(`/product/${product._id}`, { state: { product } });
  };

  const handleEdit = () => setShowEdit(true);
  const handleCloseEdit = () => setShowEdit(false);

  if (isHorizontal) {
    return (
      <>
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-80 md:flex-shrink-0">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
            
            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{product.title}</h3>
                  <span className="text-2xl font-bold text-emerald-600 ml-4">${product.price.toFixed(2)}</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  <span className="flex items-center text-gray-500">
                    <i className="pi pi-user mr-2"></i>
                    Creator: {typeof product.creator?.name === 'string' ? product.creator.name : 'Unknown'}
                  </span>
                  {typeof product.category?.name === 'string' && (
                    <span className="flex items-center text-gray-500">
                      <i className="pi pi-tag mr-2"></i>
                      Category: {product.category.name}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleViewDetails}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  View Details
                </button>
                {onAddToCart && (
                  <button
                    onClick={() => onAddToCart(product._id)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-medium"
                  >
                    Add to Cart
                  </button>
                )}
                {editable && (
                  <button
                    onClick={handleEdit}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2.5 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Dialog
          header="Edit Product"
          visible={showEdit}
          style={{ width: '50vw', maxWidth: 600 }}
          onHide={handleCloseEdit}
          modal
        >
          <ProductUploadForm product={product} onClose={handleCloseEdit} />
        </Dialog>
      </>
    );
  }

  // Vertical layout (original)
  return (
    <>
      <Card
        title={product.title}
        subtitle={`$${product.price.toFixed(2)}`}
        className="product-card"
        header={
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
        }
        footer={
          <div className="flex gap-2">
            <button
              onClick={handleViewDetails}
              className="p-button p-button-outlined"
            >
              View Details
            </button>
            {onAddToCart && (
              <button
                onClick={() => onAddToCart(product._id)}
                className="p-button p-button-success"
              >
                Add to Cart
              </button>
            )}
            {editable && (
              <button
                onClick={handleEdit}
                className="p-button p-button-warning"
              >
                Edit
              </button>
            )}
          </div>
        }
      >
        <p className="text-gray-600 line-clamp-2">{product.description}</p>
        <div className="mt-2">
          <span className="text-sm text-gray-500">
            Creator: {typeof product.creator?.name === 'string' ? product.creator.name : 'Unknown'}
          </span>
        </div>
        <div className="mt-2">
          {typeof product.category?.name === 'string' && (
            <span className="text-sm text-gray-500 ml-2">Category: {product.category.name}</span>
          )}
        </div>
      </Card>
      <Dialog
        header="Edit Product"
        visible={showEdit}
        style={{ width: '60vw', maxWidth: 600 }}
        onHide={handleCloseEdit}
        modal
        closeIcon={<i className="pi pi-times" style={{ fontSize: '1.5rem' }} />}

      >
      <ProductUploadForm product={product} onClose={handleCloseEdit} />
    </Dialog >
    </>
  );
};

export default ProductCard;