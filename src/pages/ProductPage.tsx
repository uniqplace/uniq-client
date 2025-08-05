import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, ImageGallery, CreatorCard } from '../components/shared';
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-amber-50 flex items-center justify-center">
        <div className="luxury-card text-center py-16">
          <i className="pi pi-spinner pi-spin text-4xl text-brand-500 mb-4"></i>
          <p className="text-neutral-600 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (productError) {
    if (import.meta.env.MODE === 'development') {
      console.error('Product error:', productError);
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-amber-50 flex items-center justify-center">
        <div className="luxury-card text-center py-16">
          <i className="pi pi-exclamation-triangle text-4xl text-error-500 mb-4"></i>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Product Not Found</h2>
          <p className="text-neutral-600 mb-6">{productError}</p>
          <Button variant="primary" onClick={handleBackToMarketplace} icon="pi pi-arrow-left">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const currentProduct = product || selectedProduct;
  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-amber-50 flex items-center justify-center">
        <div className="luxury-card text-center py-16">
          <i className="pi pi-box text-4xl text-neutral-400 mb-4"></i>
          <p className="text-neutral-600 mb-6">No product found</p>
          <Button variant="primary" onClick={handleBackToMarketplace} icon="pi pi-arrow-left">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const handleBuyNow = () => {
    navigate(`/checkout/${currentProduct._id}`, { state: { product: currentProduct } });
  };

  const handleSimulateBid = () => {
    // Placeholder for bid simulation functionality
    console.log('Simulate bid for product:', currentProduct._id);
  };

  const formattedPrice = `$${currentProduct.price.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-amber-50">
      <div className="container-responsive section-padding">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-4">
          <Button
            variant="outline"
            onClick={handleBackToMarketplace}
            icon="pi pi-arrow-left"
            label="Back to Marketplace"
            className="self-start"
          />
          {currentProduct.creator && (
            <div className="w-full lg:w-auto">
              <CreatorCard creator={currentProduct.creator} />
            </div>
          )}
        </div>

        {/* Main Product Layout - Two Column on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Images */}
          <div className="order-1 lg:order-1">
            <ImageGallery 
              images={currentProduct.images} 
              productTitle={currentProduct.title} 
            />
          </div>

          {/* Right Column: Product Details */}
          <div className="order-2 lg:order-2 space-y-6">
            {/* Title and Price Section */}
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight">
                {currentProduct.title}
              </h1>
              
              {/* Price and Status Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl lg:text-4xl font-bold text-success-600">
                    {formattedPrice}
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-success-100 text-success-700 border border-success-200">
                    {currentProduct.status ? currentProduct.status.toUpperCase() : 'PUBLISHED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <i className="pi pi-info-circle text-brand-500"></i>
                Description
              </h3>
              <p className="text-neutral-700 leading-relaxed text-base">
                {currentProduct.description}
              </p>
            </div>

            {/* Product Attributes Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <i className="pi pi-tag text-brand-500"></i>
                Product Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <i className="pi pi-star text-brand-500 text-lg"></i>
                  <div>
                    <h4 className="font-medium text-neutral-900 text-sm">Condition</h4>
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getConditionColor(currentProduct.condition)}`}>
                      {currentProduct.condition.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <i className="pi pi-th-large text-brand-500 text-lg"></i>
                  <div>
                    <h4 className="font-medium text-neutral-900 text-sm">Category</h4>
                    <p className="text-neutral-600 text-sm">
                      {currentProduct.category ? currentProduct.category.name : 'No category'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <i className="pi pi-map-marker text-brand-500 text-lg"></i>
                  <div>
                    <h4 className="font-medium text-neutral-900 text-sm">Location</h4>
                    <p className="text-neutral-600 text-sm">{currentProduct.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <i className="pi pi-calendar text-brand-500 text-lg"></i>
                  <div>
                    <h4 className="font-medium text-neutral-900 text-sm">Posted</h4>
                    <p className="text-neutral-600 text-sm">
                      {formatDate(currentProduct.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            {currentProduct.tags && currentProduct.tags.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <i className="pi pi-tags text-brand-500"></i>
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentProduct.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium border border-brand-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons Section */}
            <div className="space-y-4 pt-6">
              {/* Primary Action - Buy Now */}
              <Button
                variant="primary"
                size="large"
                onClick={handleBuyNow}
                disabled={currentProduct.status !== 'published'}
                className="w-full text-lg py-4 shadow-medium hover:shadow-large transition-all duration-200"
                icon="pi pi-shopping-cart"
              >
                {currentProduct.status === 'published' 
                  ? `Buy Now - ${formattedPrice}`
                  : 'Not Available for Purchase'
                }
              </Button>

              {/* Secondary Action - Simulate Bid (reduced emphasis) */}
              <Button
                variant="outline"
                size="medium"
                onClick={handleSimulateBid}
                className="w-full text-base py-3 border-brand-300 text-brand-600 hover:bg-brand-50"
                icon="pi pi-dollar"
              >
                Simulate Bid
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
