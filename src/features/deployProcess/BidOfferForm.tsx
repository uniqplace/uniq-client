
import { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import type { RootState } from '../../store';
import { AddBidOffer } from './BidOfferSlice';
import type { BidOffer } from '../../types';
import { ProgressSpinner } from 'primereact/progressspinner';

const BidOfferForm = ({ bidRequestId }: { bidRequestId: string }) => {
  const [price, setPrice] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(null);
  const [note, setNote] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useRef<Toast>(null);
  const user = useAppSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();

  const handleSubmit = async () => {
    setSubmitted(true);

    if (!price || !estimatedDelivery || !user?.id) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Missing Required Fields',
        detail: 'Please fill in all required fields.',
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const newBidOffer: BidOffer = {
        bidRequestId,
        manufacturerId: user.id,
        price: parseFloat(price),
        estimatedDelivery: estimatedDelivery.toISOString(),
        note,
        attachmentUrl,
      };

      await dispatch(AddBidOffer(newBidOffer)).unwrap();

      toast.current?.show({
        severity: 'success',
        summary: 'Offer Sent',
        detail: 'Your offer has been submitted successfully.',
        life: 3000,
      });

      // Clear form
      setPrice('');
      setEstimatedDelivery(null);
      setNote('');
      setAttachmentUrl('');
      setSubmitted(false);
    } catch (error: unknown){
         if (error instanceof Error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error: Failed to submit offer.',
          detail: error.message,
          life: 4000,
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit offer.',
          life: 4000,
        });
      }
    }  finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border-round shadow-4 surface-card">
      <Toast ref={toast} />
      <h2 className="text-2xl font-semibold mb-5 text-center">Submit Your Offer</h2>

      <div className="mb-4">
        <label className="block mb-1">Price (₪)*</label>
        <InputText
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          keyfilter="money"
          placeholder="Enter your price"
          className={classNames('w-full', { 'p-invalid': submitted && !price })}
        />
        {submitted && !price && (
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
          className={classNames('w-full', { 'p-invalid': submitted && !estimatedDelivery })}
          minDate={new Date()}
        />
        {submitted && !estimatedDelivery && (
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
        label={loading ? '' : 'Submit Offer'}
        icon={loading ? undefined : 'pi pi-check'}
        className="w-full"
        onClick={handleSubmit}
        disabled={loading || !user?.id}
      >
        {loading && <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="4" />}
      </Button>
    </div>
  );
};

export default BidOfferForm;
