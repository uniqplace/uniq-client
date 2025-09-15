import React, { useState, useRef } from 'react';
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
import { useAppSelector, useAppDispatch } from '../../../hooks/hooks';
import { AddBidOffer, updateBidOffer } from '../slices/BidOfferSlice';
import type { RootState } from '../../../store';
import type { BidOffer } from '../../../types';

const BidOfferForm = ({
  bidRequestId: propBidRequestId,
  manufacturerId: propManufacturerId,
  initialOffer = null,
  setOffer = () => {}, // Default to no-op function
  setEditing = () => {}, // Default to no-op function
}: {
  bidRequestId?: string;
  manufacturerId?: string;
  initialOffer?: Partial<BidOffer> | null;
  setOffer?: React.Dispatch<React.SetStateAction<BidOffer | null>>; // Made optional
  setEditing?: React.Dispatch<React.SetStateAction<boolean>>; // Made optional
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const bidRequestId = propBidRequestId || location.state?.bidRequestId;
  const manufacturerId = propManufacturerId || location.state?.manufacturerId;
  const bidOfferId = (initialOffer as BidOffer)?._id || location.state?.bidOfferId;

  const [price, setPrice] = useState<number | null>(initialOffer?.price || null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date | null>(
    initialOffer?.estimatedDelivery ? new Date(initialOffer.estimatedDelivery) : null
  );
  const [note, setNote] = useState(initialOffer?.note || '');
  const [attachmentUrl, setAttachmentUrl] = useState(initialOffer?.attachmentUrl || '');
  const [loading, setLoading] = useState(false);

  const toast = useRef<Toast>(null);
  const user = useAppSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();

  const [errors, setErrors] = useState({
    price: false,
    estimatedDelivery: false,
  });

  const validateForm = () => {
    const errors = {
      price: price == null || price <= 0,
      estimatedDelivery: !estimatedDelivery,
    };
    setErrors(errors);

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

  const clearForm = () => {
    setPrice(null);
    setEstimatedDelivery(null);
    setNote('');
    setAttachmentUrl('');
    setErrors({ price: false, estimatedDelivery: false });
  };

  const finalizeSubmission = (message: string, newBidOfferId?: string) => {
    clearForm();
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000,
    });

    if (newBidOfferId && !loading) {
      navigate(`/BidOfferDetails/${newBidOfferId}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newBidOffer: Partial<BidOffer> = {
      ...(bidOfferId && { _id: bidOfferId }), // Include _id only if it exists
      bidRequestId,
      manufacturerId,
      price: price ?? 0,
      estimatedDelivery: estimatedDelivery?.toISOString() || '',
      note,
      attachmentUrl,
    };

    try {
      setLoading(true);
      if (initialOffer) {
        // Editing existing offer
        const updatedOffer = await dispatch(updateBidOffer(newBidOffer as BidOffer)).unwrap();
        setOffer(updatedOffer);
        setEditing(false);
      } else {
        // Creating new offer
        const createdOffer = await dispatch(AddBidOffer(newBidOffer as BidOffer)).unwrap();
        finalizeSubmission('Bid offer created successfully.', createdOffer.data._id);
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit bid offer. Please try again.',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <Card className="w-full max-w-lg shadow-4 surface-card border-round-xl">
        <Toast ref={toast} />
        <h2 className="text-2xl font-semibold mb-4 text-center text-primary">
          {initialOffer ? 'Edit Your Offer' : 'Submit Your Offer'}
        </h2>
        <Divider />

        <form onSubmit={handleSubmit} className="p-fluid space-y-5">
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
            {errors.price && <small className="p-error">Price is required.</small>}
          </div>

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

          <div>
            <label className="font-medium mb-2 block">Attachment URL (optional)</label>
            <InputText
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="Paste file URL"
            />
          </div>

          <Button
            type="submit"
            label={loading ? '' : initialOffer ? 'Save Changes' : 'Submit Offer'}
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
