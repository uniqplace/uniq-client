
import React from 'react';
import type { Product } from '../../../../types';
import './CheckoutPage.css';
interface ProductDetailsProps {
  product: Product;
}
const getProductImage = (product?: Product): string => {
  if (!product || !product.images || product.images.length === 0) return '/default-image.png';
  return product.images[0];
};
const getProductTitle = (product?: Product): string => {
  return product?.title || '';
};
const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  if (!product) return null;
  return (
    <div className="product-info mb-5">
      <img
        src={getProductImage(product)}
        alt={getProductTitle(product)}
        className="product-img"
      />
      <div>
        <div className="product-title">{getProductTitle(product)}</div>
        <small className="product-desc">{product.description?.slice(0, 80)}...</small>
      </div>
    </div>
  );
};
export default ProductDetails;