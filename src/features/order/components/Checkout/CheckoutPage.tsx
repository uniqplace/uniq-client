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
  const productFromState = location.state?.product;
  const toast = useRef<Toast>(null);
  const currentOrder = location.state?.order as Order;
  const product: Product = props.product || productFromState || currentOrder?.product;
  const productPrice = props.price !== undefined ? props.price : product?.price || 0;

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

    if (currentOrder) {
      return {
        ...currentOrder,
        productId: currentOrder.productId || fallbackProduct._id,
        buyerId: currentOrder.buyerId || user.id,
        creator: currentOrder.creator || { name: fallbackProduct.creator.name, _id: fallbackProduct.creator._id },
        product: currentOrder.product || fallbackProduct,
      };
    }

    return {
      _id: '',
      productId: product?._id || fallbackProduct._id,
      buyerId: user.id,
      creator: props.creator
        ? { name: props.creator.name, _id: props.creator._id }
        : { name: fallbackProduct.creator.name, _id: fallbackProduct.creator._id },
      status: 'pending',
      totalAmount: productPrice * initialQuantity,
      paymentMethod: 'credit_card',
      shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quantity: initialQuantity,
      product: fallbackProduct,
    };
  });

  const [shipping, setShipping] = useState<string>('standard');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [createOrder] = useCreateOrderMutation();
  const [isReadOnly, setIsReadOnly] = useState(false);

  // 💰 מחשב totalAmount בכל שינוי רלוונטי (לא יתאפס לעולם)
  useEffect(() => {
    if (!product || !productPrice || !order?.quantity) return;

    const shippingPrice =
      SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.price || 0;
    const totalAmount = productPrice * order.quantity + shippingPrice;

    if (order.totalAmount !== totalAmount) {
      setOrder(prev => ({ ...prev, totalAmount }));
    }
  }, [product, productPrice, order.quantity, shipping]);

  // 🚫 מונע דריסה של הזמנה קיימת מה־localStorage
  useEffect(() => {
    const savedOrder = JSON.parse(localStorage.getItem('currentOrder') || 'null');
    if (savedOrder && !order._id) {
      setOrder(savedOrder);
    }
  }, []);

  // 💾 שמירת order ל-localStorage רק אם קיים מוצר
  useEffect(() => {
    if (order && order.productId) {
      localStorage.setItem('currentOrder', JSON.stringify(order));
    }
  }, [order]);

  // 🧭 מצב readOnly רק אחרי הזמנה שהושלמה
  useEffect(() => {
    const savedOrder = JSON.parse(localStorage.getItem('completedOrder') || 'null');
    if (savedOrder) {
      setIsReadOnly(true);
    }
  }, []);

  // טעינת פרטי ההזמנה הקודמת אם המשתמש חוזר לאחר סיום
  useEffect(() => {
    const fetchOrderDetails = async () => {
      const savedOrder = JSON.parse(localStorage.getItem('completedOrder') || 'null');
      if (savedOrder) {
        setOrder(savedOrder);
        return;
      }

      try {
        const orderId = localStorage.getItem('currentOrderId') || '';
        const token = localStorage.getItem('token') || '';
        if (!orderId || !token) return;

        const response = await fetch(`http://localhost:5002/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const fetchedOrder = await response.json();
            setOrder(fetchedOrder);
          }
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      }
    };

    fetchOrderDetails();
  }, [user.id]);

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
      localStorage.setItem('completedOrder', JSON.stringify(order));
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
