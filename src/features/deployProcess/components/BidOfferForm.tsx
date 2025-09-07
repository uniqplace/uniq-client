import { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import type { RootState } from '../../../store';
import { AddBidOffer, resetBidOffer } from '../slices/BidOfferSlice';
import { ProgressSpinner } from 'primereact/progressspinner';
import type { BidOfferResponse } from '../../../types';
import { useLocation } from 'react-router-dom';

const BidOfferForm = ({ bidRequestId: propBidRequestId, manufacturerId: propManufacturerId }: { bidRequestId?: string, manufacturerId?: string }) => {
  const location = useLocation();

  const bidRequestId = propBidRequestId || location.state?.bidRequestId;
  const manufacturerId = propManufacturerId || location.state?.manufacturerId;

  const [price, setPrice] = useState<number | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(null);
  const [note, setNote] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useRef<Toast>(null);
  const user = useAppSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();

  const errorsRef = useRef({
    price: false,
    estimatedDelivery: false,
  });

  const clearForm = () => {
    setPrice(null);
    setEstimatedDelivery(null);
    setNote('');
    setAttachmentUrl('');
    errorsRef.current = { price: false, estimatedDelivery: false };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      price: price == null || price <= 0,
      estimatedDelivery: !estimatedDelivery,
    };

    errorsRef.current = errors;

    if (errors.price || errors.estimatedDelivery || !user?.id) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Missing Required Fields',
        detail: 'Please fill in all required fields.',
        life: 3000,
      });
      forceUpdate();
      return;
    }

    try {
      setLoading(true);

      const newBidOffer: Partial<BidOfferResponse> = {
        bidRequestId,
        manufacturerId,
        price: price ?? 0,
        estimatedDelivery: estimatedDelivery ? estimatedDelivery.toISOString() : '',
        note,
        attachmentUrl,
      };

      await dispatch(AddBidOffer(newBidOffer as BidOfferResponse)).unwrap();
      dispatch(resetBidOffer());
      toast.current?.show({
        severity: 'success',
        summary: 'Offer Sent',
        detail: 'Your offer has been submitted successfully.',
        life: 3000,
      });

      clearForm();
      forceUpdate();

    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: typeof error === 'string'
          ? error
          : error?.message || JSON.stringify(error) || 'Failed to submit offer.',
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // a solution to rendering ref:
  const [, setRerender] = useState(false);
  const forceUpdate = () => setRerender(r => !r);

  if (!bidRequestId || !manufacturerId) {
    return <div className="text-red-500 text-center">Missing required information to submit an offer.</div>;
  }

  return (
    <form
      className="max-w-lg mx-auto mt-10 p-6 border-round shadow-4 surface-card"
      onSubmit={handleSubmit}
    >
      <Toast ref={toast} />
      <h2 className="text-2xl font-semibold mb-5 text-center">Submit Your Offer</h2>

      <div className="mb-4">
        <label className="block mb-1">Price (₪)*</label>
        <InputText
          value={price != null ? price.toString() : ''}
          onChange={(e) => {
            const value = e.target.value;
            const parsed = parseFloat(value);
            setPrice(isNaN(parsed) ? null : parsed);
          }}
          placeholder="Enter your price"
          keyfilter="money"
          className={classNames('w-full', { 'p-invalid': errorsRef.current.price })}
        />
        {errorsRef.current.price && (
          <small className="p-error">Price is required.</small>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Estimated Delivery*</label>
        <Calendar
          value={estimatedDelivery}
          onChange={(e) => setEstimatedDelivery(e.value as Date)}
          showIcon
          placeholder="Select a delivery date"
          className={classNames('w-full', { 'p-invalid': errorsRef.current.estimatedDelivery })}
          minDate={new Date()}
        />
        {errorsRef.current.estimatedDelivery && (
          <small className="p-error">Delivery date is required.</small>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Note (optional)</label>
        <InputTextarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add a note..."
          className="w-full"
        />
      </div>

      <div className="mb-5">
        <label className="block mb-1">Attachment URL (optional)</label>
        <InputText
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        label={loading ? '' : 'Submit Offer'}
        icon={loading ? undefined : 'pi pi-check'}
        className="w-full"
        disabled={loading || !user?.id}
      >
        {loading && <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="4" />}
      </Button>
    </form>
  );
};

export default BidOfferForm;
