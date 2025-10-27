import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import { updateBidRequestInStepper } from '../../../deployProcess/slices/stepperSlice';

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
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user) as User;
  const auth = useSelector((state: RootState) => state.auth);
  const buyerId = user.id;
  const toast = useRef<Toast>(null);
  const product: Product = props.product || (location.state as { product?: Product })?.product || {
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

  const productPrice = props.price !== undefined && props.price !== null
    ? props.price
    : product?.price || 0;


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
      shippingOption: { label: 'Standard (5$)', value: 'standard', price: 5 },
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
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    if (product && productPrice > 0 && order.quantity > 0) {
      const selectedShippingOption = SHIPPING_OPTIONS.find(opt => opt.value === shipping) || SHIPPING_OPTIONS[0]; 
      const shippingPrice = selectedShippingOption.price as 5 | 15; 
      const totalAmount = productPrice * order.quantity + shippingPrice;
      setOrder(prev => ({
        ...prev,
        totalAmount,
        shippingOption: {
          ...selectedShippingOption,
          label: selectedShippingOption.label as 'Standard (5$)' | 'Express (15$)',
          value: selectedShippingOption.value as 'standard' | 'express',
          price: shippingPrice,
        },
      }));
    }
  }, [product, productPrice, order.quantity, shipping]);

  const handlePay = async () => {
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
    try {
      console.log(order.productId);

      const createdOrderResponse = await createOrder(order).unwrap();
      const createdOrder = createdOrderResponse?.data || createdOrderResponse; // Handle both cases
      const orderId = createdOrder?._id; // Extract the order ID from the server response
      if (!orderId) {
        console.error("Order ID is missing from server response.");
        return;
      }

      dispatch(addOrder(createdOrder));
      localStorage.setItem(`completedOrder_${orderId}`, JSON.stringify(createdOrder));
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Order created successfully', life: 3000 });

      // Save a mapping of productId to orderId in localStorage
      localStorage.setItem(`productToOrder_${order.productId}`, orderId);

      // Update the orderId in the related bid request
      dispatch(updateBidRequestInStepper({ productId: order.productId, orderId }));

      if (props.onOrderSuccess) props.onOrderSuccess();      
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create order', life: 3000 });
    } finally {
      setPaymentDialog(false);
    }
  };

  const stepperState = useSelector((state: RootState) => state.stepper); // Assuming stepper state is in Redux

  useEffect(() => {
    const productStepper = stepperState.productsInProgress[order.productId];
    if (productStepper && productStepper.completedSteps[3]) {
      fetchOrderDetails();
    }
  }, [stepperState.productsInProgress, order.productId]);

  const fetchOrderDetails = async () => {
    let storedOrder = null;

    // Iterate through localStorage keys to find the order by productId
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('completedOrder_')) {
        const orderData = localStorage.getItem(key);
        if (orderData) {
          const parsedOrder = JSON.parse(orderData);
          if (parsedOrder.product === order.productId) {
            storedOrder = parsedOrder;
            break;
          }
        }
      }
    }

    if (storedOrder) {
      console.log('Order found in localStorage:', storedOrder);
      setOrder(storedOrder);
      setIsReadOnly(true);
    } else {
      // Fetch order details from the server if not in localStorage
      try {
        console.log('Fetching order details for productId:', order.productId);
        console.log('Full URL:', `/api/orders/byProduct/${order.productId}`);

        const token = auth?.token || localStorage.getItem('token'); // Retrieve token from Redux or localStorage
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/byProduct/${order.productId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const fetchedOrder = await response.json();
          console.log('Fetched order details:', fetchedOrder); // Log the fetched order details

          if (fetchedOrder?.success && fetchedOrder.data) {
            setOrder(fetchedOrder.data); // Update state with the correct data structure
            setIsReadOnly(true);
          } else {
            console.warn('Fetched order is missing required fields:', fetchedOrder);
          }
        } else {
          console.error('Server returned an error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      }
    }
  };

  return (
    <div className="checkout-root">
      <Toast ref={toast} />
      <div className="checkout-columns">
        <div className='left-side'>
          <ProductDetails product={product} />
          <OrderDetails
            order={order}
            setOrder={setOrder}
            shipping={order.shippingOption?.value || 'standard'} 
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