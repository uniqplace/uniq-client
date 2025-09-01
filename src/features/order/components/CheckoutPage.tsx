import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import * as yup from 'yup';
import type { Address, Order, Product, User } from '../../../types/index';
import Payment from '../../payments/components/Payment';
import './CheckoutPage.css';
import { useCreateOrderMutation } from '../slices/orderApiSlice';
import { useGetProductByIdQuery } from '../../marketplace/slices/productApiSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

interface CheckoutPageProps {
  product?: Product;
}

const SHIPPING_OPTIONS = [
  { label: 'Standard (5$)', value: 'standard', price: 5 },
  { label: 'Express (15$)', value: 'express', price: 15 },
];

const orderSchema = yup.object().shape({
  quantity: yup.number().min(1).required('Quantity is required'),
  shippingAddress: yup.object().shape({
    street: yup.string().required('Street is required'),
    city: yup.string().required('City is required'),
    state: yup.string().min(2, 'State must be at least 2 characters').required('State is required'),
    zipCode: yup.string().matches(/^\d{4,10}$/, 'Invalid zip code').required('Zip code is required'),
    country: yup.string().required('Country is required'),
  }),
  notes: yup.string().max(500),
  agreed: yup.boolean().oneOf([true], 'You must agree to the terms'),
});

export const CheckoutPage: React.FC<CheckoutPageProps> = () => {
  const location = useLocation();
  const params = useParams();
  const user = useSelector((state: RootState) => state.user) as User;
  const productIdFromParams = params.productId;
  const productFromState = location.state?.product;
  const toast = useRef<Toast>(null);

  const { data: productFromServer, isLoading: productLoading, isError: productError } =
    useGetProductByIdQuery(productIdFromParams!, { skip: !!productFromState });

  const product = productFromState || productFromServer;

  const [order, setOrder] = useState<Order>({
    id: '',
    productId: product?._id || '',
    buyerId: user.id,
    creator: { name: product?.creator.name || '', _id: product?.creator._id || '' },
    status: 'pending',
    totalAmount: 0,
    paymentMethod: '',
    shippingAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quantity: 1,
    product: {
      _id: product?._id || '',
      title: product?.title || '',
      images: product?.images || [],
      creatorName: product?.creator.name || '',
    },
  });

  const [shipping, setShipping] = useState<string>('standard');
  const [agreed, setAgreed] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [createOrder] = useCreateOrderMutation();

  // עדכון סכום כולל
  useEffect(() => {
    if (product) {
      const shippingPrice = SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.price || 0;
      const totalAmount = product.price * order.quantity + shippingPrice;
      setOrder(prev => ({ ...prev, totalAmount }));
    }
  }, [product, order.quantity, shipping]);

  if (productLoading) return <div className="loading">Loading Product...</div>;
  if (!product || productError) return <div className="error">Product Not Found</div>;

  // ניהול לחיצה על Pay Now
  const handlePay = async () => {
    setSubmitted(true);
    try {
      await orderSchema.validate({ ...order, agreed }, { abortEarly: false });
      setFormErrors({});
      setPaymentDialog(true);
    } catch (err: any) {
      const errors: { [key: string]: string } = {};
      err.inner?.forEach((e: any) => { if (e.path) errors[e.path] = e.message; });
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // יצירת הזמנה
  const addNewOrder = async () => {
    try {
      await createOrder(order).unwrap();
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Order created successfully', life: 3000 });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create order', life: 3000 });
    } finally {
      setPaymentDialog(false);
    }
  };

  const shippingPrice = SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.price || 0;
  const productTotal = product.price * order.quantity;
  const totalAmount = productTotal + shippingPrice;

  return (
  <div className="checkout-root">
      <div className="checkout-columns">
        {/* --- Left Column --- */}
        <div className="checkout-form">
          {/* Product Info */}
          <div className="product-info mb-5">
            <img src={product.images[0]} alt={product.title} className="product-img" />
            <div>
              <div className="product-title">{product.title}</div>
              <small className="product-desc">{product.description?.slice(0, 80)}...</small>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <label className="font-bold block mb-2">Quantity</label>
            <InputNumber
              value={order.quantity}
              min={1}
              max={99}
              onValueChange={e => setOrder(prev => ({ ...prev, quantity: e.value || 1 }))}
              showButtons
              buttonLayout="horizontal"
              decrementButtonClassName="p-button-sm p-button-outlined p-button-danger"
              incrementButtonClassName="p-button-sm p-button-outlined p-button-success"
              inputStyle={{ textAlign: 'center', width: '60px' }}
              style={{ borderRadius: '8px' }}
            />
          </div>

          {/* Shipping Method */}
          <div className="mb-5">
            <label className="font-bold block mb-3">Shipping Method</label>
            <div className="shipping-options">
              {SHIPPING_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => setShipping(opt.value)}
                  className={`shipping-card ${shipping === opt.value ? 'selected' : ''}`}
                >
                  <div className="shipping-header">
                    <Tag value={opt.label} severity="info" />
                    <i className={`pi ${opt.value === 'express' ? 'pi-send' : 'pi-truck'}`} />
                  </div>
                  <div className="shipping-estimate">
                    Estimated delivery: {opt.value === 'express' ? '1-2 days' : '3-5 days'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Details */}
          <Divider align="left" className="mb-4">
            <div className="divider-title">
              <i className="pi pi-user mr-2" />
              <b>Shipping Details</b>
            </div>
          </Divider>
          <div className="shipping-form">
            {['street', 'city', 'state', 'zipCode', 'country'].map(field => (
              <div key={field} className="shipping-field">
                <label htmlFor={field} className="font-bold block mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <InputText
                  id={field}
                  className={`w-full ${submitted && formErrors[`shippingAddress.${field}`] ? 'p-invalid' : ''}`}
                  value={(order.shippingAddress as any)[field]}
                  onChange={e => setOrder(prev => ({
                    ...prev,
                    shippingAddress: { ...prev.shippingAddress, [field]: e.target.value },
                  }))}
                />
                {submitted && formErrors[`shippingAddress.${field}`] && (
                  <small className="p-error">{formErrors[`shippingAddress.${field}`]}</small>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="field mb-3">
            <label htmlFor="notes" className="font-bold">Order Notes</label>
            <InputText
              id="notes"
              value={order.notes}
              onChange={e => setOrder(prev => ({ ...prev, notes: e.target.value }))}
              maxLength={500}
              className="w-full"
            />
          </div>

          {/* Checkbox */}
          <div className="field-checkbox mb-4">
            <Checkbox inputId="agreed" checked={agreed} onChange={e => setAgreed(e.checked!)} />
            <label htmlFor="agreed" className="ml-2">I agree to the terms and conditions</label>
            {submitted && formErrors.agreed && <small className="p-error block">{formErrors.agreed}</small>}
          </div>
        </div>

        {/* --- Right Column --- */}
        <div className="checkout-summary">
          <Divider align="right">
            <b>Order Summary</b>
          </Divider>
          <div className="summary-card">
            <div className="summary-item">
              <span>{product.title}</span>
              <Tag value={product.condition} severity="info" />
            </div>
            <Divider />
            <div className="summary-item">
              <span>Product total</span>
              <span>${productTotal.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Shipping</span>
              <span>${shippingPrice.toFixed(2)}</span>
            </div>
            <Divider />
            <div className="summary-total">
              <span>Total Due</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
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