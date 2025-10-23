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

  useEffect(() => {
    if (product && productPrice > 0 && order.quantity > 0) {
      const shippingPrice = SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.price || 0;
      const totalAmount = productPrice * order.quantity + shippingPrice;
      setOrder(prev => ({ ...prev, totalAmount }));
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
      await createOrder(order).unwrap();
      dispatch(addOrder(order));
      localStorage.setItem(`completedOrder_${order._id}`, JSON.stringify(order));
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Order created successfully', life: 3000 });
      if (props.onOrderSuccess) props.onOrderSuccess();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create order', life: 3000 });
    } finally {
      setPaymentDialog(false);
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