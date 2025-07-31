

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import type { Order } from '../../../../types';

interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
}

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'pending': return 'secondary';   
        case 'paid': return 'success';        
        case 'shipped': return 'info';        
        case 'delivered': return 'primary';   
        case 'cancelled': return 'danger';    
        default: return null;
    }
};

export const OrderDetailsModal = ({ order, onClose }: OrderDetailsModalProps) => {
    return (
        <Dialog
            header="Order Details"
            visible={true}
            onHide={onClose}
            style={{ width: '90%', maxWidth: '30rem' }}
            modal
        >
            <div className="p-fluid">

                <div className="flex align-items-center gap-3 mb-3">
                    <img
                        src={order.product.images[0]}
                        alt={order.product.title}
                        className="border-round"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                    <div>
                        <h3 className="m-0">{order.product.title}</h3>
                        <small className="text-secondary">Created by: {order.creator.name}</small>
                    </div>
                </div>

                <div className="flex align-items-center gap-2 mb-3">
                    <Tag
                        value={order.status}
                        className={`${getStatusSeverity(order.status)} text-white px-3 py-1 rounded-full text-sm`}
                    />
                    <span className="font-semibold">Total: {order.totalAmount} ₪</span>
                </div>

                <div className="mb-3">
                    <p className="m-0"><strong>Payment Method:</strong> {order.paymentMethod}</p>
                    <p className="m-0"><strong>Created At:</strong> {new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                    <p className="m-0"><strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleDateString('en-GB')}</p>
                </div>

                <div className="mb-3">
                    <p className="font-semibold m-0">Shipping Address:</p>
                    <p className="m-0">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                    <p className="m-0">{order.shippingAddress.state}, {order.shippingAddress.country}</p>
                    <p className="m-0">Zip Code: {order.shippingAddress.zipCode}</p>
                </div>

                <Button
                    label="Contact Seller"
                    className="w-full mt-2"
                    severity="secondary"
                />
            </div>
        </Dialog>
    );
};
