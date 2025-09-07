
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBidOfferById } from '../slices/BidOfferSlice';
import type { RootState, AppDispatch } from '../../../store';
import { useEffect } from 'react';
import { useState } from 'react';

const BidOfferDetails: React.FC = () => {
  // Image gallery state
  const [imgIndex, setImgIndex] = useState(0);
  const { BidOfferId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const offer = useSelector((state: RootState) => state.bidOffer.currentBidOffer);
  const loading = useSelector((state: RootState) => state.bidOffer.currentBidOfferLoading);
  const error = useSelector((state: RootState) => state.bidOffer.currentBidOfferError);

  useEffect(() => {
    if (BidOfferId) {
      dispatch(fetchBidOfferById(BidOfferId));
    }
  }, [BidOfferId, dispatch]);

  if (loading) return <div className="text-center py-8"><span className="pi pi-spin pi-spinner text-2xl" /> Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!offer) return <div className="text-gray-500 text-center py-8">No offer found.</div>;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-md p-4 rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex flex-col items-center">
            <Avatar
              image={typeof offer.bidRequestId?.creatorId?.avatarUrl === 'string' && offer.bidRequestId.creatorId.avatarUrl ? offer.bidRequestId.creatorId.avatarUrl : undefined}
              icon={!(typeof offer.bidRequestId?.creatorId?.avatarUrl === 'string' && offer.bidRequestId.creatorId.avatarUrl) ? "pi pi-user" : undefined}
              size="large"
              shape="circle"
              className="mb-2 border border-gray-300 shadow-sm"
            />
            <div className="font-semibold text-gray-800">{offer.bidRequestId?.creatorId?.name || 'Unknown Creator'}</div>
            <div className="text-xs text-gray-500">{offer.bidRequestId?.creatorId?.email}</div>
            <div className="text-xs text-gray-400">Role: {offer.bidRequestId?.creatorId?.role}</div>
          </div>
          <Divider layout="vertical" className="mx-4" />
          <div className="flex flex-col items-start">
            <div className="font-semibold text-lg text-gray-800 mb-1">Product</div>
            {Array.isArray(offer.bidRequestId?.productId?.images) && offer.bidRequestId.productId.images.length > 0 && (
              <div className="flex flex-col items-center mb-2">
                <div className="relative">
                  <img
                    src={offer.bidRequestId?.productId?.images?.[imgIndex]}
                    alt="Product"
                    className="w-32 h-32 object-cover rounded shadow"
                  />
                  {Array.isArray(offer.bidRequestId?.productId?.images) && offer.bidRequestId.productId.images?.length > 1 && (
                    <>
                      <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 hover:text-blue-600"
                        style={{ zIndex: 2, background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}
                        onClick={() => setImgIndex(i => i === 0 ? (offer.bidRequestId?.productId?.images?.length ?? 1) - 1 : i - 1)}
                        title="Previous image"
                      >
                        <span className="pi pi-chevron-left text-xl" />
                      </button>
                      <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 hover:text-blue-600"
                        style={{ zIndex: 2, background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}
                        onClick={() => setImgIndex(i => i === ((offer.bidRequestId?.productId?.images?.length ?? 1) - 1) ? 0 : i + 1)}
                        title="Next image"
                      >
                        <span className="pi pi-chevron-right text-xl" />
                      </button>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {imgIndex + 1} / {offer.bidRequestId?.productId?.images?.length ?? 1}
                </div>
              </div>
            )}
            <div className="font-medium text-gray-700">{offer.bidRequestId?.productId?.title}</div>
            <div className="text-sm text-gray-500 mb-2">{offer.bidRequestId?.productId?.description}</div>
          
          </div>
        </div>
        <Divider />
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-lg text-gray-800">Your Submitted Offer</div>
        </div>
        <div className="mb-2 text-sm text-gray-700">
          <span className="font-medium">Price:</span> {offer.price} ₪
        </div>
        <div className="mb-2 text-sm text-gray-700">
          <span className="font-medium">Estimated Delivery:</span> {offer.estimatedDelivery ? new Date(offer.estimatedDelivery).toLocaleDateString('en-US') : 'N/A'}
        </div>
        <div className="mb-2 text-sm text-gray-700">
          <span className="font-medium">Note:</span> {offer.note || '—'}
        </div>
        <div className="mb-2 text-sm text-gray-700">
          <span className="font-medium">Attachment:</span> {offer.attachmentUrl ? <a href={offer.attachmentUrl} target="_blank" rel="noopener noreferrer">View</a> : '—'}
        </div>
        <div className="mb-2 text-xs text-gray-500">
          <span className="font-medium">Submitted At:</span> {offer.createdAt ? new Date(offer.createdAt).toLocaleString('en-US') : 'N/A'}
        </div>
      </Card>
    </div>
  );
};

export default BidOfferDetails;
