import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface ProductCompletedDialogProps {
  visible: boolean;
  onHide: () => void;
  onCreateNewProduct: () => Promise<void>;
  loading?: boolean;
}

const ProductCompletedDialog: React.FC<ProductCompletedDialogProps> = ({ visible, onHide, onCreateNewProduct, loading }) => (
  <Dialog
    header={<span className="text-xl font-bold text-primary">Product Completed!</span>}
    visible={visible}
    style={{ width: '350px', borderRadius: '1rem' }}
    onHide={onHide}
    closeIcon={<i className="pi pi-times" style={{ fontSize: '1.5rem' }} />}
    className="rounded-2xl shadow-xl"
  >
    <div className="text-center">
      <p className="mb-4 text-lg">
        <span role="img" aria-label="delivered" style={{ fontSize: '2em' }}>🎉</span><br />
        <span className="font-bold">Congratulations!</span> Your product has been successfully delivered.<br />
        <span className="text-gray-600">We hope you enjoy your unique creation.</span><br />
        <span className="text-gray-400 text-sm">Thank you for choosing us!</span>
      </p>
      <Button
        label={loading ? "create new product..." : "Create New Product"}
        onClick={onCreateNewProduct}
        className="p-button-success mt-3 px-6 py-2 rounded-lg text-base font-semibold shadow-md"
        disabled={loading}
      />
    </div>
  </Dialog>
);

export default ProductCompletedDialog;
