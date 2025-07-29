import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBidOffersByRequest } from '../slices/BidOfferSlice';
import type { RootState, AppDispatch } from '../../../store';
import type { BidOffer } from '../../../types';
import { Avatar } from 'primereact/avatar';

interface BidOffersListProps {
  bidRequestId: string;
}

const BidOffersList: React.FC<BidOffersListProps> = ({ bidRequestId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [sortOption, setSortOption] = useState<'date' | 'price' | 'rating'>('date');
  const offers = useSelector((state: RootState) => state.bidOffer.offers);
  const loading = useSelector((state: RootState) => state.bidOffer.loading);
  const error = useSelector((state: RootState) => state.bidOffer.error);

  const sortOptions = [
    { label: 'By Price', value: 'price' },
    { label: 'By Rating', value: 'rating' }
  ];

  useEffect(() => {
    if (bidRequestId) {
      const sortParam = sortOption !== 'date' ? sortOption : undefined;
      dispatch(fetchBidOffersByRequest({ bidRequestId, sort: sortParam }));
    }
  }, [dispatch, bidRequestId, sortOption]);

  const sortedOffers = offers;

  return (
    <Card className="p-4 shadow-2 border-round">
      {offers && offers.length > 0 && <h1 className="text-xl font-bold mb-4">Bid Offers for Request #{offers[0]?.bidRequestId.productId.title}</h1>}
      <div className="flex justify-between align-items-center mb-3">
        <h2 className="text-2xl font-bold">Received Bids</h2>
        {offers && offers.length > 0 ? (
          <Dropdown
            value={sortOption}
            options={sortOptions}
            onChange={(e) => setSortOption(e.value)}
            placeholder="Sort by"
            className="w-12rem"
          />
        ) : (
          <Dropdown
            value={null}
            options={sortOptions}
            placeholder="Sort by"
            className="w-12rem opacity-50 cursor-not-allowed bg-gray-100"
            disabled
          />
        )}
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
          
          <div
            className="grid grid-cols-12 gap-2 py-4 px-4 border-b border-gray-200 text-xl font-bold text-900 font-sans"
            style={{ fontFamily: 'Inter, Arial, sans-serif' }}
          >
            <div className="col-span-3 flex items-center text-left justify-start">
              <span className="w-full">Manufacturer</span>
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <span className="w-full text-center">Price</span>
            </div>
            <div className="col-span-3 flex items-center justify-center">
              <span className="w-full text-center">Lead Time</span>
            </div>
            <div className="col-span-3 flex items-center justify-center">
              <span className="w-full text-center">Response</span>
            </div>
            <div className="col-span-1"></div>
          </div>
         
          <div>
            {sortedOffers.map((offer: BidOffer, idx) =>
              offer.manufacturerId && offer.manufacturerId.userId ? (
                <div
                  className="grid grid-cols-12 gap-2 items-center py-4 px-4 border-b border-gray-100 text-sm"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                  key={offer.bidRequestId + '-' + offer.manufacturerId._id + '-' + idx}
                >
                  {/* Manufacturer */}
                  <div className="col-span-3 flex items-center gap-3">
                    <Avatar
                      image={offer.manufacturerId.userId.avatarUrl || '/default-avatar.png'}
                      shape="circle"
                      style={{ width: '56px', height: '56px' }}
                    />
                    <span className="font-semibold text-gray-800 text-xl">
                      {offer.manufacturerId.userId.name}
                    </span>
                  </div>
                  {/* Price */}
                  <div className="col-span-2 text-center text-gray-900 font-medium text-xl">${offer.price}</div>
                  {/* Lead Time */}
                  <div className="col-span-3 text-center text-gray-600">{offer.estimatedDelivery} days</div>
                  {/* Note */}
                  <div className="col-span-3 text-center text-gray-500 truncate">
                    {offer.note || 'No note provided'}
                  </div>
                  {/* Chat Button */}
                  <div className="col-span-1 flex justify-end">
                    <Button
                      label="Chat"
                      className="p-button-sm p-button-outlined"
                      style={{
                        padding: '4px 12px',
                        fontSize: '13px',
                        borderColor: '#007BFF',
                        color: '#007BFF',
                      }}
                    />
                  </div>
                </div>
              ) : null
            )}
          </div>
          <Button
            label="Select Manufacturer"
            className="p-button-primary w-full mt-4"
          />
        </>
      )}
    </Card>
  );
};

export default BidOffersList;
