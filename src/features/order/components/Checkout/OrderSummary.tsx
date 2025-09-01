import React from 'react';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import type { Order, Product } from '../../../../types';
import { SHIPPING_OPTIONS } from './CheckoutPage';
import './CheckoutPage.css';

interface OrderSummaryProps {
    order: Order;
    product: Product;
    shipping: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ order, product, shipping }) => {
    const productTotal = product.price * order.quantity;
    const shippingPrice = SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.price || 0;
    const totalAmount = productTotal + shippingPrice;

    return (
        <div className="checkout-summary">
            <Divider align="right"><b>Order Summary</b></Divider>
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
        </div>
    );
};

export default OrderSummary;
