import { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import type { RootState } from '../../../store';
import { AddBidOffer } from '../slices/BidOfferSlice';
import type { BidOffer } from '../../../types';
import { ProgressSpinner } from 'primereact/progressspinner';

const BidOfferForm = ({ bidRequestId }: { bidRequestId: string }) => {
  const [price, setPrice] = useState('');
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
    setPrice('');
    setEstimatedDelivery(null);
    setNote('');
    setAttachmentUrl('');
    errorsRef.current = { price: false, estimatedDelivery: false };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNumber = parseFloat(price);
    const errors = {
      price: !price || isNaN(priceNumber) || priceNumber <= 0,
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
      // נאלץ לעדכן מחדש כי ref לא גורם לרינדור:
      forceUpdate();
      return;
    }

    try {
      setLoading(true);

      const newBidOffer: Partial<BidOffer> = {
        bidRequestId,
        price: parseFloat(price),
        estimatedDelivery: estimatedDelivery ? estimatedDelivery.toISOString() : '',
        note,
        attachmentUrl,
      };

      await dispatch(AddBidOffer(newBidOffer as BidOffer)).unwrap();

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

  // פתרון לרינדור כשמשתמשים ב-ref:
  const [, setRerender] = useState(false);
  const forceUpdate = () => setRerender(r => !r);

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
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          keyfilter="money"
          placeholder="Enter your price"
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
