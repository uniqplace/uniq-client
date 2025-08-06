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
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  editable = false
}) => {
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  const handleViewDetails = () => {
    navigate(`/product/${product._id}`, { state: { product } });
  };

  const handleEdit = () => setShowEdit(true);
  const handleCloseEdit = () => setShowEdit(false);

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