import React, { useState, useRef, useEffect } from 'react';
import { useLocation} from 'react-router-dom';
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
    zipCode: yup.string().matches(/^\d{4,10}$/, 'Invalid zip code').required('Zip code is required'),
    country: yup.string().required('Country is required'),
  }),
  notes: yup.string().max(500),
});
interface CheckoutPageProps {
  order?: Order;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user) as User;
  const productFromState = location.state?.product;
  const toast = useRef<Toast>(null);
  const currentOrder = location.state?.order as Order;  
  const product: Product = productFromState || currentOrder?.product;

  // Initialize order state, using props.order if provided
  const initialQuantity = 1;
  const initialTotalAmount = product ? product.price * initialQuantity : 0;
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
      productId: fallbackProduct._id,
      buyerId: user.id,
      creator: { name: fallbackProduct.creator.name, _id: fallbackProduct.creator._id },
      status: 'pending',
      totalAmount: initialTotalAmount,
      paymentMethod: 'credit_card',
      shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quantity: initialQuantity,
      product: fallbackProduct,
    };
  });

  // Sync order state with props.order if it changes
  useEffect(() => {
    if (currentOrder) {
      setOrder(prev => ({
        ...prev,
        ...currentOrder,
        productId: currentOrder.productId || product?._id || '',
        buyerId: currentOrder.buyerId || user.id,
        creator: currentOrder.creator || { name: product?.creator.name || '', _id: product?.creator._id || '' },
        product: currentOrder.product || {
          _id: product?._id || '',
          title: product?.title || '',
          images: product?.images || [],
          creatorName: product?.creator.name || '',
        },
      }));
    }
  }, [currentOrder, product, user.id]);

  const [shipping, setShipping] = useState<string>('standard');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const [createOrder] = useCreateOrderMutation();

  //Update total amount
  useEffect(() => {

    if (product) {
      const shippingPrice = SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.price || 0;
      const totalAmount = product.price * order.quantity + shippingPrice;
      setOrder(prev => ({ ...prev, totalAmount }));
    }
  }, [user, product, order.quantity, shipping]);

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
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Order created successfully', life: 3000 });
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


