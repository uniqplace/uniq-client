import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Steps } from 'primereact/steps';
import type { MenuItem } from 'primereact/menuitem';
import type { OrderStatus } from '../../../../types';


interface Props {
  visible: boolean;
  status: OrderStatus;
  onHide: () => void;
}

const STATUS_ORDER: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'pending ',
  paid: 'paid',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

export const OrderStatusTracker: React.FC<Props> = ({ visible, status, onHide }) => {
  const currentStepIndex = STATUS_ORDER.indexOf(status);
  const isCancelled = status === 'cancelled';

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
            activeIndex={1}
            className="custom-stepper"
       />

      {isCancelled && (
        <div className="text-red-500 text-center mt-3 font-semibold">
                    The order was cancelled
                    </div>
      )}
    </Dialog>
  );
};
