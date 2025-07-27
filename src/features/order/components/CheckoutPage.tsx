import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Checkbox } from 'primereact/checkbox';
import type { Address, Product } from '../../../types/index';
import Payment from '../../payments/components/Payment';
import './CheckoutPage.css';
import { useCreateOrderMutation } from '../slice/orderApiSlice';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
interface CheckoutPageProps {
  product?: Product;
}

const SHIPPING_OPTIONS = [
  { label: 'Standard (5$)', value: 'standard', price: 5 },
  { label: 'Express (15$)', value: 'express', price: 15 },
];

export const CheckoutPage: React.FC<CheckoutPageProps> = (props) => {
  const location = useLocation();
  const product = props.product || (location.state as { product?: Product })?.product;
  const [quantity, setQuantity] = useState<number>(1);
  const [shipping, setShipping] = useState<string>('standard');
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [notes, setNotes] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [createOrder, { isError, isLoading }] = useCreateOrderMutation();
  const toast = useRef<Toast>(null);

  if (!product) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">Please return to the marketplace and try again.</p>
        </div>
      </div>
    );
  }

  const shippingPrice = SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.price || 0;
  const productTotal = product.price * quantity;
  const totalAmount = productTotal + shippingPrice;

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!shippingAddress.street) errors.street = 'Street is required';
    if (!shippingAddress.city) errors.city = 'City is required';
    if (!shippingAddress.state) errors.state = 'State is required';
    else if (shippingAddress.state.length < 2) errors.state = 'State must be at least 2 characters';
    if (!shippingAddress.zipCode) errors.zipCode = 'Zip code is required';
    else if (!/^\d{4,10}$/.test(shippingAddress.zipCode)) errors.zipCode = 'Invalid zip code';
    if (!shippingAddress.country) errors.country = 'Country is required';
    if (!agreed) errors.agreed = 'You must agree to the terms';
    return errors;
  };

  const handlePay = () => {
    setSubmitted(true);
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setPaymentDialog(true);
  };
  { isLoading && <span>Saving...</span> }
  { isError && <span className="p-error">Error saving order</span> }

async function addNewOrder(): Promise<void> {
  try {
    await createOrder({
      productId: product?._id,
      totalAmount,
      shippingAddress,
      notes,
      creatorId: product?.creator._id,
      buyerId: JSON.parse(localStorage.getItem('user') || '{}').id,
      status: 'pending',
    }).unwrap();
    toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Order created successfully', life: 3000 });
  } catch (error) {
    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create order', life: 3000 });
  }
  setTimeout(() => setPaymentDialog(false), 300);
}

  return (
    <>
      <Toast ref={toast} />
      <div className="checkout-root">
        <div className="checkout-columns">
          <div className="checkout-form">
            {/* --- Product Info --- */}
            <div className="mb-5">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <img src={product.images[0]} alt={product.title} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginRight: 16 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20 }}>{product.title}</div>
                  <small style={{ color: '#888' }}>{product.description.slice(0, 80)}...</small>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="font-bold block mb-2">Quantity</label>
                <InputNumber
                  value={quantity}
                  min={1}
                  max={99}
                  onValueChange={e => setQuantity(e.value || 1)}
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
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {SHIPPING_OPTIONS.map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => setShipping(opt.value)}
                      style={{
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: shipping === opt.value ? '#2196f3' : '#ccc',
                        background: shipping === opt.value ? '#e3f2fd' : '#f6f7fb',
                        borderRadius: 8,
                        padding: 16,
                        minWidth: 160,
                        flex: '1 1 160px',
                        boxShadow: shipping === opt.value ? '0 0 0 2px #2196f3' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <i className={`pi ${opt.value === 'express' ? 'pi-send' : 'pi-truck'}`} style={{ fontSize: 20 }} />
                        <Tag value={opt.label} severity="info" />
                      </div>
                      <div style={{ fontSize: 13, color: '#888' }}>
                        Estimated delivery: {opt.value === 'express' ? '1-2 days' : '3-5 days'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* --- Shipping Details --- */}
            <Divider align="left">
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <i className="pi pi-user" style={{ marginRight: 8 }} />
                <b>Shipping Details</b>
              </div>
            </Divider>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: '1 1 100%' }}>
                <label htmlFor="street" className="font-bold block mb-1">Street</label>
                <div className="p-input-icon-left w-full">
                  <i className="pi pi-home" />
                  <InputText
                    id="street"
                    className={`w-full ${submitted && formErrors.street ? 'p-invalid' : ''}`}
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  />
                </div>
                {submitted && formErrors.street && <small className="p-error">{formErrors.street}</small>}
              </div>
              <div style={{ flex: '1 1 30%' }}>
                <label htmlFor="city" className="font-bold block mb-1">City</label>
                <div className="p-input-icon-left w-full">
                  <i className="pi pi-map-marker" />
                  <InputText
                    id="city"
                    className={`w-full ${submitted && formErrors.city ? 'p-invalid' : ''}`}
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  />
                </div>
                {submitted && formErrors.city && <small className="p-error">{formErrors.city}</small>}
              </div>
              <div style={{ flex: '1 1 30%' }}>
                <label htmlFor="state" className="font-bold block mb-1">State</label>
                <div className="p-input-icon-left w-full">
                  <i className="pi pi-compass" />
                  <InputText
                    id="state"
                    className={`w-full ${submitted && formErrors.state ? 'p-invalid' : ''}`}
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  />
                </div>
                {submitted && formErrors.state && <small className="p-error">{formErrors.state}</small>}
              </div>
              <div style={{ flex: '1 1 30%' }}>
                <label htmlFor="zipCode" className="font-bold block mb-1">Zip Code</label>
                <div className="p-input-icon-left w-full">
                  <i className="pi pi-inbox" />
                  <InputText
                    id="zipCode"
                    className={`w-full ${submitted && formErrors.zipCode ? 'p-invalid' : ''}`}
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  />
                </div>
                {submitted && formErrors.zipCode && <small className="p-error">{formErrors.zipCode}</small>}
              </div>
              <div style={{ flex: '1 1 30%' }}>
                <label htmlFor="country" className="font-bold block mb-1">Country</label>
                <div className="p-input-icon-left w-full">
                  <i className="pi pi-globe" />
                  <InputText
                    id="country"
                    className={`w-full ${submitted && formErrors.country ? 'p-invalid' : ''}`}
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  />
                </div>
                {submitted && formErrors.country && <small className="p-error">{formErrors.country}</small>}
              </div>
            </div>

            {/* Notes */}
            <div className="field mb-3">
              <label htmlFor="notes" className="font-bold">Order Notes</label>
              <InputText id="notes" value={notes} onChange={e => setNotes(e.target.value)} maxLength={500} className="w-full" />
            </div>

            {/* Checkbox */}
            <div className="field-checkbox mb-4">
              <Checkbox inputId="agreed" checked={agreed} onChange={e => setAgreed(e.checked!)} />
              <label htmlFor="agreed" className="ml-2">I agree to the terms and conditions</label>
              {submitted && formErrors.agreed && <small className="p-error block">{formErrors.agreed}</small>}
            </div>
          </div>

          <div className="checkout-divider" />

          <div className="checkout-summary">
            <Divider align="right" type="solid" className="hidden lg:block">
              <b>Order Summary</b>
            </Divider>
            <Divider align="center" className="block lg:hidden">
              <b>Order Summary</b>
            </Divider>
            <div style={{ background: '#f6f7fb', borderRadius: 8, padding: 24, boxShadow: '0 1px 6px #0001' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
               <div style={{ fontWeight: 700 }}>{product.title}</div>
                                               <Tag value={product.condition} severity="info" style={{ marginLeft: 8 }} />
              </div>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span><i className="pi pi-box mr-2" />Product totalAmount</span>
                <span>${productTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span><i className="pi pi-truck mr-2" />Shipping</span>
                <span>${shippingPrice.toFixed(2)}</span>
              </div>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 20 }}>
                <span><i className="pi pi-credit-card mr-2" />totalAmount Due</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <Button label="Pay Now" icon="pi pi-credit-card" className="p-button-success w-full mt-4" onClick={handlePay} />
            </div>
          </div>
          <Payment
            isVisible={paymentDialog}
            onSave={() => addNewOrder()}
            onHide={() => setPaymentDialog(false)}
            product={product}
            price={totalAmount}
          />
        </div>
      </div>
    </>
  );
};
