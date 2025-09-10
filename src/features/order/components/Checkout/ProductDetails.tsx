import React from 'react';
import type { Product } from '../../../../types';
import './CheckoutPage.css';

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  if (!product) return null;
  return (
    <div className="product-info mb-5">
      <img
        src={product.images && product.images.length > 0 ? product.images[0] : '/default-image.png'}
        alt={product.title}
        className="product-img"
      />
      <div>
        <div className="product-title">{product.title}</div>
        <small className="product-desc">{product.description?.slice(0, 80)}...</small>
      </div>
    </div>
  );
};

export default ProductDetails;
