import React from 'react';
import { Card } from '../../../components/shared';
import type { Product } from '../../../types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onViewDetails, 
  onAddToCart 
}) => {
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
            onClick={() => onViewDetails(product.id)}
            className="p-button p-button-outlined"
          >
            View Details
          </button>
          {onAddToCart && (
            <button 
              onClick={() => onAddToCart(product.id)}
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
        <br />
        <span className="text-sm text-gray-500">Creator: {product.creator?.name}</span>
      </div>
    </Card>
  );
};

export default ProductCard; 