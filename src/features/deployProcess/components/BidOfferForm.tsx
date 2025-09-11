import { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import type { RootState } from '../../../store';
import { AddBidOffer, resetBidOffer } from '../slices/BidOfferSlice';
import type { BidOffer } from '../../../types';

const BidOfferForm = ({
  bidRequestId: propBidRequestId,
  manufacturerId: propManufacturerId,
}: {
  bidRequestId?: string;
  manufacturerId?: string;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const [errors, setErrors] = useState({
    price: false,
    estimatedDelivery: false,
  });
  

  const clearForm = () => {
    setPrice(null);
    setEstimatedDelivery(null);
    setNote('');
    setAttachmentUrl('');
    setErrors({ price: false, estimatedDelivery: false });
  };

  // --- Validation ---
  const validateForm = () => {
    const errors = {
      price: price == null || price <= 0,
      estimatedDelivery: !estimatedDelivery,
    };setErrors(errors);

    if (errors.price || errors.estimatedDelivery || !user?.id) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Missing Required Fields',
        detail: 'Please fill in all required fields.',
        life: 3000,
      });
      return false;
    }
    return true;
  };

  // --- API call ---
  const submitOffer = async () => {
    setLoading(true);
    let newBidOffer: Partial<BidOffer> = {
      bidRequestId,
      manufacturerId,
      price: price ?? 0,
      estimatedDelivery: estimatedDelivery
        ? estimatedDelivery.toISOString()
        : '',
      note,
      attachmentUrl,
    };

    const res = await dispatch(AddBidOffer(newBidOffer as BidOffer)).unwrap();
    return res.data;
  };

  // --- Clear + Navigate ---
  const finalizeSubmission = (newBidOffer: BidOffer) => {
    dispatch(resetBidOffer());
    toast.current?.show({
      severity: 'success',
      summary: 'Offer Sent',
      detail: 'Your offer has been submitted successfully.',
      life: 3000,
    });

    clearForm();
    forceUpdate();
    navigate(`/BidOfferDetails/${newBidOffer._id}`, {
      state: { offer: newBidOffer },
    });
  };

  // --- HandleSubmit (רזה יותר) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const newBidOffer = await submitOffer();
      finalizeSubmission(newBidOffer);
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail:
          typeof error === 'string'
            ? error
            : error?.message || JSON.stringify(error) || 'Failed to submit offer.',
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // force rerender for errors
  const [, setRerender] = useState(false);
  const forceUpdate = () => setRerender((r) => !r);

  if (!bidRequestId || !manufacturerId) {
    return (
      <div className="text-red-500 text-center">
        Missing required information to submit an offer.
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-8">
      <Card className="w-full max-w-lg shadow-4 surface-card border-round-xl">
        <Toast ref={toast} />
        <h2 className="text-2xl font-semibold mb-4 text-center text-primary">
          Submit Your Offer
        </h2>
        <Divider />

        <form onSubmit={handleSubmit} className="p-fluid space-y-5">
          {/* Price */}
          <div>
            <label className="font-medium mb-2 block">Price (₪)*</label>
            <InputText
              value={price != null ? price.toString() : ''}
              onChange={(e) => {
                const parsed = parseFloat(e.target.value);
                setPrice(isNaN(parsed) ? null : parsed);
              }}
              placeholder="Enter your price"
              keyfilter="money"
              className={classNames({ 'p-invalid': errors.price })}
            />
            {errors.price && (
              <small className="p-error">Price is required.</small>
            )}
          </div>

          {/* Delivery Date */}
          <div>
            <label className="font-medium mb-2 block">Estimated Delivery*</label>
            <Calendar
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.value as Date)}
              showIcon
              placeholder="Select a delivery date"
              className={classNames({ 'p-invalid': errors.estimatedDelivery })}
              minDate={new Date()}
            />
            {errors.estimatedDelivery && (
              <small className="p-error">Delivery date is required.</small>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="font-medium mb-2 block">Note (optional)</label>
            <InputTextarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note..."
              autoResize
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="font-medium mb-2 block">Attachment URL (optional)</label>
            <InputText
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="Paste file URL"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            label={loading ? '' : 'Submit Offer'}
            icon={loading ? undefined : 'pi pi-check'}
            className="p-button-lg"
            disabled={loading || !user?.id}
          >
            {loading && (
              <ProgressSpinner
                style={{ width: '20px', height: '20px' }}
                strokeWidth="4"
              />
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default BidOfferForm;
