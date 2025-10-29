import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, ImageGallery, RatingComponent } from '../components/shared';
import { getStatusColor, getConditionColor } from '../utils/product';
import { formatDate } from '../utils/date';
import { fetchProduct } from '../features/marketplace/thunks/marketplaceThunks';
import { clearSelectedProduct } from '../features/marketplace/slices/marketplaceSlice';
import type { RootState, AppDispatch } from '../store';
import type { Product } from '../types';
import UserCard from '../components/shared/UserCard';

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
      dispatch({ type: 'marketplace/setSelectedProduct', payload: product });
    } else if (id) {
      dispatch(fetchProduct(id));
    }

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, dispatch, product]);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page on load
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <button
              onClick={handleBackToMarketplace}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
            >
              <i className="pi pi-arrow-left group-hover:-translate-x-1 transition-transform duration-200"></i>
              <span className="font-medium">Back to Marketplace</span>
            </button>
            {currentProduct.creator && (
              <div className="w-full lg:w-auto m-0 p-0 box-border">
                <UserCard user={{
                  id: currentProduct.creator.id || currentProduct.creator._id || '',
                  name: currentProduct.creator.name,
                  email: currentProduct.creator.email || '',
                  role: currentProduct.creator.role || 'creator',
                }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Section */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <ImageGallery
                images={currentProduct.images}
                productTitle={currentProduct.title}
              />
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-8">
            {/* Title and Price Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {currentProduct.title}
                </h2>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formattedPrice}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${getStatusColor(currentProduct.status)}`}>
                    {currentProduct.status ? currentProduct.status.toUpperCase() : ''}
                  </span>
                </div>
                {/* Sales Information */}
                {typeof currentProduct.sales === 'number' && currentProduct.sales > 0 && (
                  <div className="flex items-center gap-4 mt-4">
                    <i className="pi pi-shopping-cart text-orange-500 text-xl"></i>
                    <span className="text-lg font-medium text-gray-700">
                      {currentProduct.sales} units sold
                    </span>
                  </div>
                )}
                {/* RatingComponent */}
                <div className="mt-4">
              <RatingComponent 
                itemId={currentProduct._id} 
                itemType="product" 
                ownerId={currentProduct.creator.id || currentProduct.creator._id} 
              />
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <i className="pi pi-info-circle mr-3 text-blue-500"></i>
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">{currentProduct.description}</p>
            </div>

            {/* Product Details Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <i className="pi pi-list mr-3 text-purple-500"></i>
                Product Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <i className="pi pi-check-circle mr-2 text-green-500"></i>
                    Condition
                  </h4>
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getConditionColor(currentProduct.condition)}`}>
                    {currentProduct.condition.replace('_', ' ')}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <i className="pi pi-tag mr-2 text-blue-500"></i>
                    Category
                  </h4>
                  <p className="text-gray-700 font-medium">
                    {currentProduct.category ? currentProduct.category.name : 'No category available'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <i className="pi pi-map-marker mr-2 text-red-500"></i>
                    Location
                  </h4>
                  <p className="text-gray-700 font-medium">{currentProduct.location}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <i className="pi pi-calendar mr-2 text-orange-500"></i>
                    Posted
                  </h4>
                  <p className="text-gray-700 font-medium">
                    {formatDate(currentProduct.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags Card */}
            {currentProduct.tags && currentProduct.tags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h4 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <i className="pi pi-hashtag mr-3 text-indigo-500"></i>
                  Tags
                </h4>
                <div className="flex flex-wrap gap-3">
                  {currentProduct.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200 hover:from-indigo-200 hover:to-purple-200 transition-all duration-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky bottom-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total Price:</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formattedPrice}
                  </span>
                </div>
                {/* Subtle Stock Information */}
                <div className="text-gray-700 text-center">
                  {currentProduct.stock ? `${currentProduct.stock} units available` : 'Out of stock'}
                </div>
                <button
                  onClick={handleBuyNow}
                  disabled={currentProduct.status !== 'published' || !currentProduct.stock}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${currentProduct.status === 'published' && currentProduct.stock
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  <i className="pi pi-shopping-cart mr-3"></i>
                  {currentProduct.status === 'published' && currentProduct.stock
                    ? `Buy Now - ${formattedPrice}`
                    : 'Not Available'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
