// Payment Modal Component - shows "checkout coming soon" message
// Displays when user clicks "Buy Now" button, simulates payment process

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from '../../../components/shared';
import type { Product } from '../../../types';

interface PaymentProps {
  isVisible: boolean;
  onHide: () => void;
  onSave: () => void;
  product?: Product;
  price?: number;
}

const Payment: React.FC<PaymentProps> = ({ isVisible, onHide, onSave,product, price }) => {
  return (
    <Dialog
      visible={isVisible}
      onHide={onHide}
      closeIcon={<i className="pi pi-times" style={{ fontSize: '1.5rem' }} />}
      header="Payment"
      modal
      style={{ width: '400px' }}
      footer={
        <div className="flex justify-end space-x-2">
          <Button
            variant="secondary"
            onClick={onHide}
            label="Close"
          />
          <Button
            variant="primary"
            onClick={onSave}
            label="Add Order"
          />

        </div>
      }
    >
      <div className="text-center py-6">
        {/* Payment coming soon icon */}
        <div className="mb-4">
          <i className="pi pi-shopping-cart text-4xl text-blue-500"></i>
        </div>

        {/* Main message */}
        <h3 className="text-lg font-semibold mb-2">Checkout Coming Soon!</h3>

        <p className="text-gray-600 mb-4">
          Payment functionality is currently under development.
        </p>

        {/* Product details if provided */}
        {product?.title && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-medium">{product?.title}</p>
            {price && typeof price === 'number' && (
              <p className="text-lg font-bold text-green-600">${price.toFixed(2)}</p>
            )}
          </div>
        )}

        {/* Additional info */}
        <p className="text-sm text-gray-500">
          Thank you for your interest! We'll notify you when checkout is available.
        </p>
      </div>
    </Dialog>
  );
};

export default Payment;
