import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '../components/shared';
import { setSelectedOrder } from '../features/payments/slices/paymentsSlice';
import type { RootState, AppDispatch } from '../store';
import type { Order } from '../types';

const Orders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.payments);

  const handleViewOrder = (order: Order) => {
    dispatch(setSelectedOrder(order));
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'paid': return 'text-blue-600';
      case 'shipped': return 'text-purple-600';
      case 'delivered': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders & Payments</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {orders.map((order: Order) => (
          <Card
            key={order.id}
            title={`Order #${order.id.slice(0, 8)}`}
            subtitle={`$${order.totalAmount.toFixed(2)}`}
            className="order-card"
            footer={
              <button 
                onClick={() => handleViewOrder(order)}
                className="p-button p-button-outlined"
              >
                View Details
              </button>
            }
          >
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Status: <span className={`font-semibold ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Payment Method: {order.paymentMethod}
              </p>
              <p className="text-sm text-gray-600">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders; 