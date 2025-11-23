import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import type { Order, Product, User } from '../../../../types';
import { useCreateOrderMutation } from '../../slices/orderApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import ProductDetails from './ProductDetails';
import OrderDetails from './OrderDetails';
import './CheckoutPage.css';
import Payment from '../../../payments/components/Payment';
import * as yup from 'yup';
import OrderSummary from './OrderSummary';
import { addOrder } from '../../slices/orderSlice';
import { useGetProductByIdQuery } from '../../../marketplace/slices/productApiSlice';

export const SHIPPING_OPTIONS = [
  { label: 'Standard (5$)', value: 'standard', price: 5 },
  { label: 'Express (15$)', value: 'express', price: 15 },
];

export const orderSchema = yup.object().shape({
  quantity: yup.number().min(1).required('Quantity is required'),
  shippingAddress: yup.object().shape({
    street: yup.string().required('Street is required'),
    city: yup.string().required('City is required'),
    state: yup.string().min(2, 'State must be at least 2 characters').required('State is required'),
    zipCode: yup.string().matches(/^[\d]{4,10}$/, 'Invalid zip code').required('Zip code is required'),
    country: yup.string().required('Country is required'),
  }),
  notes: yup.string().max(500),
});

interface CheckoutPageProps {
  order?: Order;
  product?: Product;
  creator?: { name: string, _id: string };
  price?: number;
  onOrderSuccess?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = (props) => {
  const location = useLocation();
  const { productId } = useParams<{ productId: string }>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user) as User;
  const buyerId = user.id;
  const toast = useRef<Toast>(null);
  
  // Get product from props, location.state, or fetch from API
  const productFromProps = props.product;
  const productFromLocation = (location.state as { product?: Product })?.product;
  
  // Fetch product from API if we have productId and no product from props/location
  const shouldFetchProduct = !productFromProps && !productFromLocation && productId;
  const { data: fetchedProduct, isLoading: isLoadingProduct, error: productError } = useGetProductByIdQuery(
    productId || '',
    { skip: !shouldFetchProduct }
  );

  // Determine the actual product to use
  const product: Product = useMemo(() => {
    return productFromProps || productFromLocation || fetchedProduct || {
      _id: '',
      title: '',
      description: '',
      price: 0,
      images: [],
      creator: { id: '', _id: '', name: '', email: '', role: 'creator' },
      category: { _id: '', name: '' },
      subCategories: [],
      tags: [],
      stock: 0,
      sales: 0,
      status: 'draft',
      condition: 'new',
      location: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }, [productFromProps, productFromLocation, fetchedProduct]);

  const productPrice = props.price !== undefined && props.price !== null
    ? props.price
    : product?.price || 0;
  
  // Check if product is actually loaded (not just fallback)
  const isProductLoaded = !!(productFromProps || productFromLocation || (fetchedProduct && fetchedProduct._id));


  const initialQuantity = 1;

  const [order, setOrder] = useState<Order>(() => {
    const fallbackProduct: Product = product || {
      _id: '',
      title: '',
      description: '',
      price: 0,
      images: [],
      creator: { _id: '', name: '' },
      creatorName: '',
      category: '',
      stock: 0,
      tags: [],
      createdAt: '',
      updatedAt: '',
    };

    return {
      _id: '',
      productId: product?._id || fallbackProduct._id,
      buyerId: buyerId || '',
      creator: props.creator
        ? { name: props.creator.name, _id: props.creator._id || '' }
        : { name: fallbackProduct.creator.name, _id: fallbackProduct.creator._id || '' },
      status: 'pending',
      totalAmount: (props.price !== undefined ? props.price : product?.price || 0) * initialQuantity,
      paymentMethod: 'credit_card',
      shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quantity: initialQuantity,
      product: fallbackProduct,
    };
  });
  useEffect(() => {
    setOrder(prev => ({ ...prev, buyerId: buyerId || '' }));
  }, [buyerId]);

  const [shipping, setShipping] = useState<string>('standard');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [createOrder] = useCreateOrderMutation();
  const [isReadOnly,] = useState(false);

  // Update order when product is loaded
  useEffect(() => {
    if (isProductLoaded && product && product._id) {
      const shippingPrice = SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.price || 0;
      const calculatedTotalAmount = productPrice * order.quantity + shippingPrice;
      
      setOrder(prev => ({
        ...prev,
        productId: product._id || prev.productId,
        product: product,
        creator: props.creator
          ? { name: props.creator.name, _id: props.creator._id || '' }
          : product.creator
            ? { name: product.creator.name || '', _id: product.creator._id || '' }
            : prev.creator,
        totalAmount: calculatedTotalAmount > 0 ? calculatedTotalAmount : prev.totalAmount,
      }));
    }
  }, [isProductLoaded, product, productPrice, order.quantity, shipping, props.creator]);

  // Update totalAmount when price or quantity changes (after product is loaded)
  useEffect(() => {
    if (isProductLoaded && product && productPrice > 0 && order.quantity > 0) {
      const shippingPrice = SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.price || 0;
      const totalAmount = productPrice * order.quantity + shippingPrice;
      setOrder(prev => ({ ...prev, totalAmount }));
    }
  }, [isProductLoaded, productPrice, order.quantity, shipping]);

  const handlePay = async () => {
    // Validate that product is loaded before proceeding
    if (!isProductLoaded || !product._id || !order.productId) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Product information is still loading. Please wait...', 
        life: 3000 
      });
      return;
    }

    setSubmitted(true);
    try {
      await orderSchema.validate({ ...order }, { abortEarly: false });
      setFormErrors({});
      setPaymentDialog(true);
    } catch (err: any) {
      const errors: { [key: string]: string } = {};
      err.inner?.forEach((e: any) => { if (e.path) errors[e.path] = e.message; });
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const addNewOrder = async () => {
    // Final validation before sending
    if (!isProductLoaded || !product._id || !order.productId) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Cannot create order: Product information is missing', 
        life: 3000 
      });
      setPaymentDialog(false);
      return;
    }

    // Ensure order has all required product data
    const orderToSend: Order = {
      ...order,
      productId: product._id,
      product: product,
      creator: props.creator
        ? { name: props.creator.name, _id: props.creator._id || '' }
        : product.creator
          ? { name: product.creator.name || '', _id: product.creator._id || '' }
          : order.creator,
    };

    try {
      await createOrder(orderToSend).unwrap();
      dispatch(addOrder(orderToSend));
      localStorage.setItem(`completedOrder_${orderToSend._id}`, JSON.stringify(orderToSend));
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Order created successfully', life: 3000 });
      if (props.onOrderSuccess) props.onOrderSuccess();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create order', life: 3000 });
    } finally {
      setPaymentDialog(false);
    }
  };

  // Show loading state while fetching product
  if (isLoadingProduct) {
    return (
      <div className="checkout-root">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <i className="pi pi-spinner pi-spin text-4xl text-blue-500 mb-4"></i>
            <p className="text-gray-600">Loading product information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if product failed to load
  if (productError && shouldFetchProduct) {
    return (
      <div className="checkout-root">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">Failed to load product information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-root">
      <Toast ref={toast} />
      <div className="checkout-columns">
        <div className='left-side'>
          <ProductDetails product={product} />
          <OrderDetails
            order={order}
            setOrder={setOrder}
            shipping={shipping}
            setShipping={setShipping}
            submitted={submitted}
            formErrors={formErrors}
            product={product}
            readOnly={isReadOnly}
          />
        </div>

        <div className='right-side'>
          <OrderSummary
            order={order}
            product={product}
            shipping={shipping}
          />
          <Button label="Pay Now" onClick={handlePay} className="mt-4 w-full" />
        </div>
      </div>

      <Payment
        isVisible={paymentDialog}
        onSave={addNewOrder}
        onHide={() => setPaymentDialog(false)}
        product={product}
        price={order.totalAmount}
      />
    </div>
  );
};