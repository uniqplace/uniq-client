import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBidOffersByRequest } from '../slices/BidOfferSlice';
import { fetchBidRequestByProductId } from '../slices/stepperSlice';
import type { RootState, AppDispatch } from '../../../store';
import type { BidOffer } from '../../../types';
import { Avatar } from 'primereact/avatar';
import { useNavigate } from 'react-router-dom';
import NormalizedRating from '../../../components/shared/NormalizedRating';

interface BidOffersListProps {
  bidRequestId: string;
  setCanGoNext?: (canGo: boolean) => void;
}
const BidOffersList: React.FC<BidOffersListProps> = ({ bidRequestId: initialBidRequestId, setCanGoNext }) => {

  // Manufacturer selection state
  const [isSelectingManufacturer, setIsSelectingManufacturer] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  useEffect(() => {
    if (setCanGoNext) {
      if (isSelectingManufacturer) {
        setCanGoNext(!!selectedOfferId);
      } else {
        setCanGoNext(false);
      }
    }
  }, [isSelectingManufacturer, selectedOfferId, setCanGoNext]);
  const [bidRequestId, setBidRequestId] = useState<string>(initialBidRequestId);
  const productId = initialBidRequestId; // assume initialBidRequestId is productId if bidRequestId is missing
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState<'date' | 'price' | 'rating'>('date');
  const offers = useSelector((state: RootState) => state.bidOffer.offers);
  const loading = useSelector((state: RootState) => state.bidOffer.loading);
  const error = useSelector((state: RootState) => state.bidOffer.error);

  const sortOptions = [
    { label: 'By Price', value: 'price' },
    { label: 'By Rating', value: 'rating' },
    { label: 'By Date', value: 'date' }
  ];

  // Fetch bidRequestId by productId if needed
  useEffect(() => {
    if (!bidRequestId && productId) {
      dispatch(fetchBidRequestByProductId(productId)).then((action: any) => {
        if (action.payload && action.payload._id) {
          setBidRequestId(action.payload._id);
        }
      });
    }
  }, [bidRequestId, productId, dispatch]);

  useEffect(() => {
    console.log('[BidOffersList] bidRequestId:', bidRequestId);
    if (!bidRequestId || bidRequestId.length < 10) {
      console.warn('[BidOffersList] bidRequestId is missing or looks invalid:', bidRequestId);
      return;
    }
    const sortParam = sortOption !== 'date' ? sortOption : undefined;
    dispatch(fetchBidOffersByRequest({ bidRequestId, sort: sortParam }));
  }, [dispatch, bidRequestId, sortOption]);

  useEffect(() => {
    console.log('[BidOffersList] offers:', offers, 'loading:', loading, 'error:', error);
    if (offers && offers.length === 0 && bidRequestId) {
      console.warn('[BidOffersList] No offers found for bidRequestId:', bidRequestId);
    }
  }, [offers, loading, error, bidRequestId]);
  // Row click behavior changes depending on selection mode
  const handleRowClick = (offer: BidOffer) => {
    if (isSelectingManufacturer) {
      if (offer._id) {
        const newSelectedOfferId = offer._id === selectedOfferId ? null : offer._id;
        setSelectedOfferId(newSelectedOfferId);

        // Persist the selected offer in LocalStorage
        if (newSelectedOfferId) {
          localStorage.setItem('selectedBidOffer', JSON.stringify(offer));
        } else {
          localStorage.removeItem('selectedBidOffer');
        }
      } else {
        setSelectedOfferId(null);
      }
    } else {
      navigate(`/BidOfferDetails/${offer._id}`, { state: { offer: offer } });
    }
  };
  // Client-side sorting logic
  function sortOffers(offers: BidOffer[], sortOption: 'date' | 'price' | 'rating') {
    if (!offers) return [];
    const offersCopy = [...offers];
    switch (sortOption) {
      case 'price':
        return offersCopy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case 'rating':
        return offersCopy.sort((a, b) => ((b.manufacturerId?.rating ?? 0) - (a.manufacturerId?.rating ?? 0)));
      case 'date':
      default:
        return offersCopy; // No date field, so keep original order
    }
  }
  const sortedOffers = sortOffers(offers, sortOption);
  function getLeadTime(createdAt?: string | Date, estimatedDelivery?: string | Date) {
    if (!createdAt || !estimatedDelivery) return '';
    const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const delivery = typeof estimatedDelivery === 'string' ? new Date(estimatedDelivery) : estimatedDelivery;
    const diffMs = delivery.getTime() - created.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays + ' days';
  }
  return (
    <Card className="p-2 shadow-2 border-round">
      {(!bidRequestId || bidRequestId.length < 10) && (
        <div className="text-red-500 text-center py-5">
          bidRequestId is missing or invalid: {String(bidRequestId)}
        </div>
      )}
      {offers && offers.length > 0 && <h1 className="text-xl font-bold mb-4">Bid Offers for Request #{offers[0]?.bidRequestId?.productId?.title}</h1>}
      <div className="flex justify-between align-items-center mb-3">
        <h2 className="text-2xl font-bold">Received Bids</h2>
        <Dropdown
          value={offers && offers.length > 0 ? sortOption : null}
          options={sortOptions}
          onChange={offers && offers.length > 0 ? (e) => setSortOption(e.value) : undefined}
          placeholder="Sort by"
          className={`w-12rem ${!(offers && offers.length > 0) ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
          disabled={!(offers && offers.length > 0)}
        />
      </div>
      <Message
        severity="info"
        text="Your custom project is open for bids. Review and select a manufacturer to proceed."
        className="mb-4"
      />
      {loading ? (
        <div className="flex justify-content-center py-5">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-5">{error}</div>
      ) : !sortedOffers || sortedOffers.length === 0 ? (
        <div className="text-center text-gray-500 py-8 text-lg">
          No offers have been received for this request yet.
        </div>
      ) : (
        <>
          {/* Table header - desktop only */}
          <div
            className="hidden md:grid grid-cols-12 gap-2 py-4 px-4 border-b border-gray-200 text-xl font-bold text-900 font-sans"
            style={{ fontFamily: 'Inter, Arial, sans-serif' }}
          >
            <div className="col-span-3 flex items-center text-left justify-start">
              <span className="w-full">Manufacturer</span>
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <span className="w-full text-center">Price</span>
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <span className="w-full text-center">Lead Time</span>
            </div>
            <div className="col-span-4 flex items-center justify-center">
              <span className="w-full text-center">Response</span>
            </div>
          </div>
          <div>
            {sortedOffers.map((offer: BidOffer, idx) =>
              offer.manufacturerId && offer.manufacturerId.userId ? (
                <div
                  key={
                    offer.bidRequestId +
                    '-' +
                    (offer.manufacturerId && typeof offer.manufacturerId === 'object' && '_id' in offer.manufacturerId
                      ? offer.manufacturerId._id
                      : 'unknown') +
                    '-' +
                    idx
                  }
                  className={`md:grid md:grid-cols-12 md:gap-4 md:items-center md:py-2 md:px-4 md:border-b md:border-gray-200 flex flex-row items-center bg-gray-50 rounded-lg shadow-md p-3 mb-3 transition hover:shadow-lg focus-within:shadow-lg ${isSelectingManufacturer ? 'cursor-pointer' : ''} ${isSelectingManufacturer && selectedOfferId === offer._id ? 'border-2 border-green-500 bg-green-50' : ''}`}
                  style={{ fontFamily: 'Arial, sans-serif', WebkitTapHighlightColor: 'rgba(0,0,0,0.03)' }}
                  onClick={() => handleRowClick(offer)}
                >
                  {/* Manufacturer */}
                  <div className="md:col-span-3 flex items-center gap-1 md:gap-2 mb-1 md:mb-0">
                    <Avatar
                      image={offer.manufacturerId.userId.avatarUrl || '/default-avatar.png'}
                      shape="circle"
                      style={{ width: '50px', height: '50px' }}
                      className="border border-gray-300 w-12 h-12 [&>img]:w-full [&>img]:h-full [&>img]:object-cover"
                    />
                    <span className="font-semibold text-gray-800 text-sm md:text-base truncate">
                      {offer.manufacturerId.userId.name}
                    </span>
                    {/* Selection icon */}
                    {isSelectingManufacturer && (
                      <span className={`ml-2 text-xl ${selectedOfferId === offer._id ? 'text-green-600' : 'text-gray-400'}`} title="Select manufacturer">
                        {selectedOfferId === offer._id ? <i className="pi pi-check-circle" /> : <i className="pi pi-circle-off" />}
                      </span>
                    )}
                  </div>
                  {/* Price */}
                  <div className="md:col-span-2 text-center text-gray-900 font-medium text-sm md:text-base">
                    <span>${offer.price}</span>
                  </div>
                  {/* Lead Time */}
                  <div className="md:col-span-2 flex flex-col items-center text-gray-600 text-xs md:text-base text-center mb-0.5 md:mb-0">
                    <span className="block md:hidden text-xs font-bold text-gray-500 text-center mb-0.5">Lead Time</span>
                    <span>
                      {offer.estimatedDelivery ? getLeadTime(offer.createdAt, offer.estimatedDelivery) : ''}
                    </span>
                  </div>
                  {/* Response */}
                  <div className="md:col-span-4 flex flex-col items-center text-gray-500 truncate text-xs md:text-base text-center mb-1 md:mb-0">
                    <span className="block md:hidden text-xs font-bold text-gray-500 text-center mb-0.5">Response</span>
                    <span>{offer.note || 'No note provided'}</span>
                  </div>
                  {/* Rating */}
                  <div className="md:col-span-2 text-center">
                    <NormalizedRating
                      rating={offer.manufacturerId?.rating ?? 0}
                      offers={offers}
                      readOnly
                      style={{ fontSize: '1rem' }}
                    />
                  </div>
                  {/* Response */}
                  <div className="md:col-span-3 text-center text-gray-500 text-sm md:text-base truncate">
                    <span>{offer.note || 'No note provided'}</span>
                  </div>
                  {/* Chat Button */}
                  <div className="md:col-span-1 flex justify-center mt-1 md:mt-0">
                    <Button
                      className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-150 text-xl"
                      icon="pi pi-comments"
                      aria-label="Chat"
                    ></Button>
                    <Button
                      className="md:hidden flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-150 text-xl"
                      icon="pi pi-comments"
                      aria-label="Chat"
                    />
                  </div>
                  {/* WhatsApp-style Send button only for selected offer in selection mode */}
                  {isSelectingManufacturer && selectedOfferId === offer._id && (
                    <div
                      className="flex items-center ml-4 md:ml-4 sm:ml-2"
                      style={{ minWidth: '120px', flexShrink: 0 }}
                    >
                      <span
                        className="relative group flex items-center"
                        style={{ minWidth: '44px', height: '44px' }}
                      >
                        <div className="flex justify-center">
                        </div>
                      </span>
                    </div>
                  )}
                </div>
              ) : null
            )}
          </div>
          {/* Toggle selection mode button */}
          <Button
            label={isSelectingManufacturer ? "Cancel Selection" : "Select Manufacturer"}
            className={`p-button-primary w-full mt-4 ${isSelectingManufacturer ? 'p-button-outlined' : ''}`}
            onClick={() => {
              if (isSelectingManufacturer) {
                setIsSelectingManufacturer(false);
                setSelectedOfferId(null); 
                if (setCanGoNext) setCanGoNext(false); 
              } else {
                setIsSelectingManufacturer(true);
                if (setCanGoNext) setCanGoNext(false); 
              }
            }}
          />
        </>
      )}
    </Card>
  );
};
export default BidOffersList;