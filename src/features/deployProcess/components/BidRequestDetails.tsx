import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';

import { useDispatch, useSelector } from 'react-redux';
import { fetchBidOffersByRequest } from '../slices/BidOfferSlice';
import { fetchBidRequestById } from '../slices/BidRequestSlice';

import type { RootState, AppDispatch } from '../../../store';
import type { BidOffer } from '../../../types';
import { Button } from 'primereact/button';
import { ArrowLeft } from 'lucide-react';


const BidRequestDetails = () => {
    const { bidRequestId } = useParams();
    console.log("bidRequestId from params:", bidRequestId);

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.user.manufacturerId);
    const offers = useSelector((state: RootState) => state.bidOffer.offers);

    const bidRequest = useSelector((state: RootState) => state.bidRequest.currentBidRequest);
    const isLoading = useSelector((state: RootState) => state.bidRequest.loading);
    const fetchError = useSelector((state: RootState) => state.bidRequest.error);
    const [hasSubmittedOffer, setHasSubmittedOffer] = useState(false);
    // Always get userOffer from offers
    const userOffer = offers?.find((offer: BidOffer) => offer.manufacturerId?._id === userId);

    const submittedAt = userOffer?.createdAt ? new Date(userOffer.createdAt).toLocaleString('en-US') : null;

    useEffect(() => {
        if (bidRequestId) {
            dispatch(fetchBidRequestById(bidRequestId));
            dispatch(fetchBidOffersByRequest({ bidRequestId }));
        }
    }, [bidRequestId, dispatch]);

    useEffect(() => {
        if (offers && userId) {
            setHasSubmittedOffer(offers.some((offer: any) => offer.manufacturerId?._id === userId));
        }
    }, [offers, userId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <ProgressSpinner />
            </div>
        );
    }

    if (fetchError) {
        return <div className="text-red-500 text-center">{fetchError}</div>;
    }

    if (!bidRequest) {
        return <div className="text-gray-500 text-center">No bid request found.</div>;
    }

    // Utility function to check if a value is an object
    const isObject = (value: any): boolean => {
        return value !== null && typeof value === 'object';
    };

    // Correcting creatorId usage
    const creatorName = isObject(bidRequest.creatorId) ? (bidRequest.creatorId as any).name : 'Unknown Creator';
    const creatorAvatar = isObject(bidRequest.creatorId) ? (bidRequest.creatorId as any).avatarUrl : '';

    // Handler function for navigation
    const handleNavigation = () => {
        if (bidRequestId) {

            console.log('Navigating to BidOffer with:', { bidRequestId, manufacturerId: userId });
            navigate('/BidOffer', { state: { bidRequestId, manufacturerId: userId } });
        }
    };

    // Helper function to get the class string for the status badge
    const getStatusBadgeClass = (status: string | undefined): string => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-700 border-green-500';
            case 'expired':
                return 'bg-yellow-100 text-yellow-700 border-yellow-500';
            case 'closed':
                return 'bg-red-100 text-red-700 border-red-500';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    // Helper function to validate if a value is a valid date
    const isValidDate = (date: any): boolean => {
        return date instanceof Date && !isNaN(date.getTime());
    };

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-50">
            <Card className="w-full max-w-2xl shadow-md p-6 rounded-lg">
                <div className="mb-4">
                    <Button
                        label="Back to Requests"
                        icon={<ArrowLeft size={16} />}
                        className="p-button-text p-button-sm text-green-600"
                        onClick={() => navigate(-1)} // חזרה לעמוד הקודם
                    />
                </div>
                <div className="flex items-center gap-4 mb-6">
                    <div>
                        <span id="creator-avatar">
                            <Avatar
                                image={creatorAvatar}
                                icon={!creatorAvatar ? "pi pi-user" : undefined}
                                size="large"
                                shape="circle"
                                className="border border-gray-300 shadow-sm [&>img]:w-full [&>img]:h-full [&>img]:object-cover"
                            />
                        </span>
                        <Tooltip target="#creator-avatar" content={creatorName} />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-gray-800">{creatorName}</div>
                        <div className="text-sm text-gray-500">Request Creator</div>
                    </div>
                </div>
                {hasSubmittedOffer && submittedAt && (
                    <div className="text-green-600 text-sm ml-4 flex items-center gap-2">
                        Offer submitted at: {submittedAt}
                        <button
                            className="p-button p-button-sm p-button-outlined p-0 flex items-center justify-center"
                            style={{ width: 28, height: 28 }}
                            onClick={() => navigate(`/BidOfferDetails/${userOffer?._id}`, { state: { offer: userOffer } })}
                            title="View full offer details"
                        >
                            <span className="pi pi-arrow-right" />
                        </button>
                    </div>
                )}
                <Divider />
                <div className="mb-4">
                    <div className="grid grid-cols-2 gap-6 items-center">
                        <div className="font-semibold text-gray-700 flex items-center gap-2">
                            <i className="pi pi-info-circle text-gray-500 text-lg"></i>
                            <span className="text-lg">Status:</span>
                        </div>
                        <div className='flex items-center justify-center'>
                            <div className={`text-sm font-medium px-3 py-1 rounded-lg border w-fit ${getStatusBadgeClass(bidRequest.status)}`}>{bidRequest.status || "Not specified"}</div>
                        </div>
                        <div className="font-semibold text-gray-700 flex items-center gap-2">
                            <i className="pi pi-tags text-gray-500 text-lg"></i>
                            <span className="text-lg">Category:</span>
                        </div>
                        <div className="text-sm text-gray-800 font-medium">{isObject(bidRequest.categoryId) ? (bidRequest.categoryId as any).name : bidRequest.categoryId || "Not specified"}</div>

                        <div className="font-semibold text-gray-700 flex items-center gap-2">
                            <i className="pi pi-box text-gray-500 text-lg"></i>
                            <span className="text-lg">Product:</span>
                        </div>
                        <div className="text-sm text-gray-800 font-medium">{isObject(bidRequest.productId) ? (bidRequest.productId as any).title : bidRequest.productId || "Not specified"}</div>

                        <div className="font-semibold text-gray-700 flex items-center gap-2">
                            <i className="pi pi-map-marker text-gray-500 text-lg"></i>
                            <span className="text-lg">Location Preference:</span>
                        </div>
                        <div className="text-sm text-gray-800 font-medium">{bidRequest.locationPreference || "Not specified"}</div>

                        <div className="font-semibold text-gray-700 flex items-center gap-2">
                            <i className="pi pi-dollar text-gray-500 text-lg"></i>
                            <span className="text-lg">Price Range:</span>
                        </div>
                        <div className="text-sm text-gray-800 font-medium">{bidRequest.priceRange ? `${bidRequest.priceRange.min} - ${bidRequest.priceRange.max} ₪` : "Not specified"}</div>

                        <div className="font-semibold text-gray-700 flex items-center gap-2">
                            <i className="pi pi-calendar text-gray-500 text-lg"></i>
                            <span className="text-lg">Delivery Timeframe:</span>
                        </div>
                        <div className="text-sm text-gray-800 font-medium">{bidRequest.deliveryTimeframe || "Not specified"}</div>

                        <div className="font-semibold text-gray-700 flex items-center gap-2">
                            <i className="pi pi-truck text-gray-500 text-lg"></i>
                            <span className="text-lg">Delivery Method:</span>
                        </div>
                        <div className="text-sm text-gray-800 font-medium">{bidRequest.deliveryMethod === 'pickup' ? 'Pickup' : 'Shipping'}</div>

                        <div className="font-semibold text-gray-700 flex items-center gap-2">
                            <i className="pi pi-clock text-gray-500 text-lg"></i>
                            <span className="text-lg">Created At:</span>
                        </div>
                        <div className="text-sm text-gray-800 font-medium">{isValidDate(new Date(bidRequest.createdAt)) ? new Date(bidRequest.createdAt).toLocaleString('en-US') : "Invalid date"}</div>

                        <div className="font-semibold text-gray-700 flex items-center gap-2">
                            <i className="pi pi-refresh text-gray-500 text-lg"></i>
                            <span className="text-lg">Updated At:</span>
                        </div>
                        <div className="text-sm text-gray-800 font-medium">{isValidDate(new Date(bidRequest.updatedAt)) ? new Date(bidRequest.updatedAt).toLocaleString('en-US') : "Invalid date"}</div>
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        className="p-button p-component p-button-primary"
                        onClick={handleNavigation}
                        disabled={hasSubmittedOffer}
                    >
                        Submit Offer
                    </button>

                </div>
            </Card>
        </div>
    );
};

export default BidRequestDetails;
