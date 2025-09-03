
import { useState } from 'react';
import { Button } from 'primereact/button';
import type { Order, OrderStatus } from '../../../../types';
import { getStatusTag } from './getStatusTag';
import { OrderStatusTracker } from './OrderStatus';
import { useNavigate } from 'react-router-dom';

interface OrderCardProps {
  order: Order;
  onShowDetails: () => void;
}

export const OrderCard = ({ order, onShowDetails }: OrderCardProps) => {
  const [showStatusOrder, setShowStatusOrder] = useState<string | null>(null);
 const navigate = useNavigate();
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <img
          src={order.product.images[0]}
          alt={order.product.title}
          className="w-16 h-16 rounded self-start"
        />

        <div className="flex-1">
          <div className="font-semibold">{order.product.title}</div>
          <div className="text-sm text-gray-600">
            Date: {new Date(order.createdAt).toLocaleDateString('he-IL')}
          </div>
          <div className="mt-1">{getStatusTag(order.status)}</div>
        </div>

        <div className="text-sm font-bold text-right sm:text-left whitespace-nowrap">
          {order.totalAmount} ₪
        </div>
      </div>

      <div className="flex justify-between gap-2 mt-4">
        <Button
          label="Details"
          icon="pi pi-eye"
          size="small"
          className="p-button-sm text-xs flex-1"
          onClick={onShowDetails}
        />
        <Button
          label="Track"
          icon="pi pi-truck"
          size="small"
          className="p-button-sm text-xs flex-1"
          onClick={() => setShowStatusOrder(order.status)}
        />
        <Button
          label="Repeat"
          icon="pi pi-refresh"
          size="small"
          className="p-button-sm text-xs flex-1"
          onClick={() => navigate(`/checkout/${order.product._id}`, { state: { order } })}
        />
      </div>

      {showStatusOrder && (
        <OrderStatusTracker
          visible={!!showStatusOrder}
          status={showStatusOrder as OrderStatus}
          onHide={() => setShowStatusOrder(null)}
        />
      )}
    </div>
  );
};
