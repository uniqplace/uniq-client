import React from 'react';
import type { Product } from '../../../../types';
import './CheckoutPage.css';

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  return (
    <div className="product-info mb-5">
      <img src={product.images[0]} alt={product.title} className="product-img" />
      <div>
        <div className="product-title">{product.title}</div>
        <small className="product-desc">{product.description?.slice(0, 80)}...</small>
      </div>
    </div>
  );
};

export default ProductDetails;
