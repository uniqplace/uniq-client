import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/shared';
import type { Product } from '../../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart 
}) => {
  const navigate = useNavigate();

  // Navigate to product detail page when View Details is clicked
  const handleViewDetails = () => {
    
    navigate(`/product/${product._id}`);
  };
  return (
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
        </div>
      }
    >
      <p className="text-gray-600 line-clamp-2">{product.description}</p>
      <div className="mt-2">
        <span className="text-sm text-gray-500">Category: {product.category}</span>
      </div>
    </Card>
  );
};

export default ProductCard; 