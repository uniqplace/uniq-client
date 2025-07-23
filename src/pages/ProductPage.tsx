import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, ImageGallery, Payment, CreatorCard } from '../components/shared';
import { getStatusColor, getConditionColor } from '../utils/product';
import { formatDate } from '../utils/date';
import { fetchProduct } from '../features/marketplace/thunks';
import { clearSelectedProduct } from '../features/marketplace/slices/marketplaceSlice';
import type { RootState, AppDispatch } from '../store';
import type { Product } from '../types';



const ProductPage: React.FC = () => {
  const location = useLocation();
  const product = (location.state as { product?: Product })?.product;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedProduct, productLoading, productError } = useSelector(
    (state: RootState) => state.marketplace
  );


  useEffect(() => {
    if (product) {
      dispatch(clearSelectedProduct());
      dispatch({ type: 'marketplace/setSelectedProduct', payload: product });
      return;
    }
    if (id) {
      dispatch(fetchProduct(id));
    }
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, dispatch, product]);
  
  const handleBackToMarketplace = () => {
    navigate(-1);
  };

  if (productLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-spinner pi-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (productError) {
    if (import.meta.env.MODE === 'development') {
      console.error('Product error:', productError);
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{productError}</p>
          <Button variant="primary" onClick={handleBackToMarketplace}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const currentProduct = product || selectedProduct;
  if (!currentProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No product found</p>
          <Button variant="primary" onClick={handleBackToMarketplace}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }
    const handleBuyNow = () => {
    navigate(`/checkout/${currentProduct._id}`, { state: { product: currentProduct } });
  };

  const formattedPrice = `$${currentProduct.price.toFixed(2)}`;
console.log('Current product:', currentProduct);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
        <Button
          variant="secondary"
          onClick={handleBackToMarketplace}
          icon="pi pi-arrow-left"
          label="Back to Marketplace"
        />
        {currentProduct.creator ? (
          <div className="w-full lg:w-auto">
            <CreatorCard creator={currentProduct.creator} />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <ImageGallery 
            images={currentProduct.images} 
            productTitle={currentProduct.title} 
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentProduct.title}
            </h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-3xl font-bold text-green-600">
                {formattedPrice}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentProduct.status)}`}>
                {currentProduct.status ? currentProduct.status.toUpperCase() : ''}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{currentProduct.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Condition</h4>
              <span className={`inline-block px-2 py-1 rounded text-sm ${getConditionColor(currentProduct.condition)}`}>
                {currentProduct.condition.replace('_', ' ')}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Category</h4>
              <p className="text-gray-700">
                {currentProduct.category ? currentProduct.category.name : 'No category available'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Location</h4>
              <p className="text-gray-700">{currentProduct.location}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Posted</h4>
              <p className="text-gray-700">
                {formatDate(currentProduct.createdAt)}
              </p>
            </div>
          </div>

          {currentProduct.tags && currentProduct.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {currentProduct.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button
              variant="primary"
              size="large"
              onClick={handleBuyNow}
              disabled={currentProduct.status !== 'published'}
              className="w-full"
              icon="pi pi-shopping-cart"
            >
              {currentProduct.status === 'published' 
                ? `Buy Now - ${formattedPrice}`
                : 'Not Available'
              }
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductPage;
