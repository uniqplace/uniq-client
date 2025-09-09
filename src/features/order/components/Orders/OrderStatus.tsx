import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Steps } from 'primereact/steps';
import type { MenuItem } from 'primereact/menuitem';
import type { Order, OrderStatus } from '../../../../types';
import type { RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useUpdateOrderStatusMutation } from '../../slices/orderApiSlice';
import { Button } from 'primereact/button';
import { toast } from 'react-toastify';
import { setOrders, setSelectedOrder } from '../../slices/orderSlice';


interface Props {
  visible: boolean;
  status: OrderStatus;
  onHide: () => void;
  orderId: string;
  currentTab: 'buyer' | 'creator';
  refetchOrders: () => void;
}

const STATUS_ORDER: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'pending ',
  paid: 'paid',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

export const OrderStatusTracker: React.FC<Props> = ({ visible, status, onHide, orderId, currentTab,refetchOrders }) => {
    
  const [localStatus, setLocalStatus] = useState<OrderStatus>(status);
  const currentStepIndex = STATUS_ORDER.indexOf(localStatus);
  
  const isCancelled = status === 'cancelled';
  const { role } = useSelector((state: RootState) => state.user);
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.order.orders);

  const steps: MenuItem[] = STATUS_ORDER.map((step, idx) => {
    const isPast = idx < currentStepIndex;
    const isCurrent = idx === currentStepIndex;

    const style = isCancelled && idx === currentStepIndex
      ? { color: '#f44336', fontWeight: 'bold' }
      : isPast
        ? { color: '#4caf50', fontWeight: 'bold' }
        : isCurrent
          ? { color: '#2196f3', fontWeight: 'bold' }
          : { color: '#9e9e9e' };

    return {
      label: STATUS_LABELS[step],
      template: (item) => <span style={style}>{item.label}</span>,
    };
  });

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);
  
  const handleUpdate = async (newStatus: OrderStatus) => {
    if (!orderId) {
      toast.error("Missing orderId, cannot update status");
      return;
    }
    try {
      const updatedOrder = await updateStatus({ id: orderId, status: newStatus }).unwrap();
      dispatch(setSelectedOrder(updatedOrder));
      dispatch(setOrders(
        orders.map((order:Order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      ));
      toast.success("Status updated successfully");
      setLocalStatus(newStatus);
      refetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="order status"
      style={{ width: '40vw' }}
      modal
      closeIcon={<i className="pi pi-times" style={{ fontSize: '1.5rem' }} />}
    >
      <Steps
        model={steps}
        readOnly={true}
        activeIndex={STATUS_ORDER.indexOf(localStatus)}
        // activeIndex={1}
        className="custom-stepper"
      />
      {role === 'creator' && currentTab ==='creator' && !isCancelled && (
        <div className="flex justify-center gap-4 mt-4">
          <Button
            label="Previous"
            icon="pi pi-arrow-left"
            disabled={currentStepIndex <= 0 || isLoading}
            onClick={() => handleUpdate(STATUS_ORDER[currentStepIndex - 1])}
          />
          <Button
            label="Next"
            icon="pi pi-arrow-right"
            disabled={currentStepIndex >= STATUS_ORDER.length - 1 || isLoading}
            onClick={() => handleUpdate(STATUS_ORDER[currentStepIndex + 1])}
          />
        </div>
      )}

      {isCancelled && (
        <div className="text-red-500 text-center mt-3 font-semibold">
          The order was cancelled
        </div>
      )}
    </Dialog>
  );
};
