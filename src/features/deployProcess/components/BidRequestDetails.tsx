import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import type { BidRequest } from '../../../types';


const BidRequestDetails = () => {
    const { bidRequestId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [bidRequest, setBidRequest] = useState<BidRequest | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBidRequestDetails = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bidRequests/${bidRequestId}`, {
                    credentials: 'include',
                });
                if (!response.ok) throw new Error('Error loading bid request');
                const data = await response.json();
                setBidRequest(data.bidRequest as BidRequest);
            } catch (err: any) {
                setFetchError('Error loading bid request');
            } finally {
                setIsLoading(false);
            }
        };
        if (bidRequestId) fetchBidRequestDetails();
    }, [bidRequestId]);

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
            const userId = location.state?.userId;
            navigate('/BidOffer', { state: { bidRequestId, manufactorerId: userId } });
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
                <div className="flex items-center gap-4 mb-6">
                    <div>
                        <span id="creator-avatar">
                            <Avatar
                                image={creatorAvatar}
                                icon={!creatorAvatar ? "pi pi-user" : undefined}
                                size="large"
                                shape="circle"
                                className="border border-gray-300 shadow-sm"
                            />
                        </span>
                        <Tooltip target="#creator-avatar" content={creatorName} />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-gray-800">{creatorName}</div>
                        <div className="text-sm text-gray-500">Request Creator</div>
                    </div>
                </div>
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
                    >
                        Submit Offer
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default BidRequestDetails;
