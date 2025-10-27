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
    if (!product) {
        return (
            <div className="checkout-summary">
                <Divider align="right"><b>Order Summary</b></Divider>
                <div className="summary-card">
                    <div className="summary-item">
                        <span>Product information is unavailable.</span>
                    </div>
                </div>
            </div>
        );
    }

    const productTotal = (order.totalAmount - (SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.price || 0)) || 0;
    const shippingPrice = SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.price || 0;
    const totalAmount = order.totalAmount || 0;

    // Format dates as DD/MM/YYYY
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const showUpdated = order.updatedAt && order.updatedAt !== order.createdAt;

    return (
        <div className="checkout-summary">
            <Divider align="right"><b>Order Summary</b></Divider>
            <div className="summary-card">
                <div className="summary-item">
                    <span>{product.title}</span>
                    <Tag value={product.condition} severity="info" />
                </div>
                {/* Dates section */}
                <div className="summary-item mt-2 flex gap-2 items-center">
                    <Tag value={`Created: ${formatDate(order.createdAt)}`} icon="pi pi-calendar-plus" severity="success" className="text-xs" />
                    {showUpdated && (
                        <Tag value={`Updated: ${formatDate(order.updatedAt)}`} icon="pi pi-refresh" severity="warning" className="text-xs" />
                    )}
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
