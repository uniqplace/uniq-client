// ProductPage Component - main product detail page
// Displays complete product information including images, details, seller info, and buy button

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, ImageGallery, CreatorCard, Payment } from '../components/shared';
import { fetchProduct } from '../features/marketplace/thunks';
import { clearSelectedProduct } from '../features/marketplace/slices/marketplaceSlice';
import type { RootState, AppDispatch } from '../store';

const ProductPage: React.FC = () => {
  // Get product ID from URL parameters
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get product data and loading states from Redux store
  const { selectedProduct, productLoading, productError } = useSelector(
    (state: RootState) => state.marketplace
  );
  
  // Local state for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch product data when component mounts or ID changes
  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(id));
    }
    
    // Cleanup function - clear selected product when leaving page
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, dispatch]);

  // Handle Buy Now button click
  const handleBuyNow = () => {
    setShowPaymentModal(true);
  };

  // Handle back to marketplace navigation
  const handleBackToMarketplace = () => {
    navigate('/marketplace');
  };

  // Render loading state
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

  // Render error state
  if (productError) {
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

  // Render empty state if no product
  if (!selectedProduct) {
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

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get condition badge color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'like_new': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={handleBackToMarketplace}
          icon="pi pi-arrow-left"
          label="Back to Marketplace"
        />
      </div>

      {/* Main product content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Image Gallery */}
        <div>
          <ImageGallery 
            images={selectedProduct.images} 
            productTitle={selectedProduct.title} 
          />
        </div>

        {/* Right side - Product Details */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedProduct.title}
            </h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-3xl font-bold text-green-600">
                ${selectedProduct.price.toFixed(2)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProduct.status)}`}>
                {selectedProduct.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Product Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Condition</h4>
              <span className={`inline-block px-2 py-1 rounded text-sm ${getConditionColor(selectedProduct.condition)}`}>
                {selectedProduct.condition.replace('_', ' ')}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Category</h4>
              <p className="text-gray-700">{selectedProduct.category}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Location</h4>
              <p className="text-gray-700">{selectedProduct.location}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Posted</h4>
              <p className="text-gray-700">
                {new Date(selectedProduct.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Tags */}
          {selectedProduct.tags && selectedProduct.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.tags.map((tag, index) => (
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

          {/* Seller Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Seller</h3>
            <CreatorCard creator={selectedProduct.seller} />
          </div>

          {/* Buy Now Button */}
          <div className="pt-4">
            <Button
              variant="primary"
              size="large"
              onClick={handleBuyNow}
              disabled={selectedProduct.status !== 'active'}
              className="w-full"
              icon="pi pi-shopping-cart"
            >
              {selectedProduct.status === 'active' 
                ? `Buy Now - $${selectedProduct.price.toFixed(2)}`
                : 'Not Available'
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Payment
        isVisible={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        productTitle={selectedProduct.title}
        price={selectedProduct.price}
      />
    </div>
  );
};

export default ProductPage;
