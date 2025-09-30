import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { SHIPPING_OPTIONS } from './CheckoutPage';
import type { Order, Product } from '../../../../types';
import './CheckoutPage.css';

interface OrderDetailsProps {
    order: Order;
    setOrder: (order: Order) => void;
    shipping: string;
    setShipping: (value: string) => void;
    submitted: boolean;
    formErrors: { [key: string]: string };
    product: Product;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
    order, setOrder, shipping, setShipping, submitted, formErrors
}) => {
    return (
        <div>
            {/* Quantity */}
            <div className="mb-4">
                <label className="font-bold block mb-2">Quantity</label>
                <InputNumber
                    value={order.quantity}
                    min={1}
                    max={order.product?.stock || 1}
                    onValueChange={e => setOrder({ ...order, quantity: e.value || 1 })}
                    showButtons
                    buttonLayout="horizontal"
                    decrementButtonClassName="p-button-sm p-button-outlined p-button-danger"
                    incrementButtonClassName="p-button-sm p-button-outlined p-button-success"
                    inputStyle={{ textAlign: 'center', width: '60px' }}
                    style={{ borderRadius: '8px' }}
                />
                {order.product?.stock !== undefined && (
                    <p className="mt-2 text-sm text-gray-500">
                        Stock available: <span className="font-medium">{order.product.stock} units</span>
                    </p>
                )}
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
                            onChange={e => setOrder({
                                ...order,
                                shippingAddress: { ...order.shippingAddress, [field]: e.target.value }
                            })}
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
                    onChange={e => setOrder({ ...order, notes: e.target.value })}
                    maxLength={500}
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default OrderDetails;
