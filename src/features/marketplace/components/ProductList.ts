import React from 'react';
import { useGetProductsQuery } from '../slices/marketplaceApiSlice';

const ProductList: React.FC = () => {
  const { data, isLoading, error } = useGetProductsQuery({});

  if (isLoading) {
    return "Loading products...";
  }

  if (error) {
    console.error('Error fetching products:', error);
    return "Error loading products";
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return "No products found.";
  }

  return (
    data.map((product) => `${product.title}\n`).join("")
  );
};

export default ProductList;
