import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { SHIPPING_OPTIONS } from './CheckoutPage';
import type { Order, Address } from '../../../../types/index'; // Corrected import path for Address type
import type { Product } from '../../../../types'; // Added import for Product
import './CheckoutPage.css';

interface OrderDetailsProps {
    order: Order;
    setOrder: (order: Order) => void;
    shipping: string;
    setShipping: (value: string) => void;
    submitted: boolean;
    formErrors: { [key: string]: string };
    readOnly?: boolean; // Added readOnly prop
    product: Product; // Added product prop
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
    order, setOrder, shipping, setShipping, submitted, formErrors, readOnly = false, 
}) => {
    return (
        <div>
            {/* Quantity */}
            <div className="mb-4">
                <label className="font-bold block mb-2">Quantity</label>
                <InputNumber
                    value={order.quantity ?? 1} // Ensure default value is 1
                    min={1}
                    max={order.product?.stock || 1}
                    onValueChange={e => !readOnly && setOrder({ ...order, quantity: e.value || 1 })}
                    showButtons={!readOnly}
                    buttonLayout="horizontal"
                    decrementButtonClassName="p-button-sm p-button-outlined p-button-danger"
                    incrementButtonClassName="p-button-sm p-button-outlined p-button-success"
                    inputStyle={{ textAlign: 'center', width: '60px' }}
                    style={{ borderRadius: '8px' }}
                    disabled={readOnly} // Disable input in read-only mode
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
                            onClick={() => !readOnly && setShipping(opt.value)}
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
                {(['street', 'city', 'state', 'zipCode', 'country'] as (keyof Address)[]).map((field: keyof Address) => (
                    <div key={String(field)} className="shipping-field">
                        <label htmlFor={String(field)} className="font-bold block mb-1">
                            {String(field).charAt(0).toUpperCase() + String(field).slice(1)}
                        </label>
                        <InputText
                            id={String(field)}
                            className={`w-full ${submitted && formErrors[`shippingAddress.${String(field)}`] ? 'p-invalid' : ''}`}
                            value={(order.shippingAddress?.[field] ?? '')} // Ensure default value is an empty string
                            onChange={e => !readOnly && setOrder({
                                ...order,
                                shippingAddress: {
                                    ...order.shippingAddress,
                                    [field]: e.target.value
                                }
                            })}
                            disabled={readOnly} // Disable input in read-only mode
                        />
                        {submitted && formErrors[`shippingAddress.${String(field)}`] && (
                            <small className="p-error">{formErrors[`shippingAddress.${String(field)}`]}</small>
                        )}
                    </div>
                ))}
            </div>

            {/* Notes */}
            <div className="field mb-3">
                <label htmlFor="notes" className="font-bold">Order Notes</label>
                <InputText
                    id="notes"
                    value={order.notes ?? ''} // Ensure default value is an empty string
                    onChange={e => !readOnly && setOrder({ ...order, notes: e.target.value })}
                    maxLength={500}
                    className="w-full"
                    disabled={readOnly} // Disable input in read-only mode
                />
            </div>
        </div>
    );
};

export default OrderDetails;
