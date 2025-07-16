import React from 'react';
import { useSelector } from 'react-redux';
import ProductCard from '../features/marketplace/components/ProductCard';
import type { RootState } from '../store';
import type { Product } from '../types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { fetchProducts } from '../features/marketplace/thunks';


const Marketplace: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { products, loading, error } = useSelector((state: RootState) => state.marketplace);

  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchProducts());
    
  }, [dispatch]);

  const handleAddToCart = (productId: string) => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', productId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product: Product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default Marketplace; 