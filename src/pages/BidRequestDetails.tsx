import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import type { BidRequest } from '../types';


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

    return (
        <div className="flex justify-center items-center mt-8">
            <Card title="Bid Request Details" className="w-full max-w-2xl">
                <div className="p-2">
                    <div className="mb-2"><b>Status:</b> {bidRequest.status}</div>
                    <Divider />
                    <div className="mb-2"><b>Category:</b> {typeof bidRequest.categoryId === 'object' && bidRequest.categoryId !== null ? (bidRequest.categoryId as any).name : bidRequest.categoryId}</div>
                    <Divider />
                    <div className="mb-2"><b>Product:</b> {typeof bidRequest.productId === 'object' && bidRequest.productId !== null ? (bidRequest.productId as any).title : bidRequest.productId}</div>
                    <Divider />
                    <div className="mb-2"><b>Location Preference:</b> {bidRequest.locationPreference}</div>
                    <Divider />
                    <div className="mb-2"><b>Price Range:</b> {bidRequest.priceRange ? `${bidRequest.priceRange.min} - ${bidRequest.priceRange.max}` : 'N/A'}</div>
                    <Divider />
                    <div className="mb-2"><b>Delivery Timeframe:</b> {bidRequest.deliveryTimeframe}</div>
                    <Divider />
                    <div className="mb-2"><b>Delivery Method:</b> {bidRequest.deliveryMethod === 'pickup' ? 'Pickup' : 'Shipping'}</div>
                    <Divider />
                    <div className="mb-2"><b>Manufacturers:</b> {Array.isArray(bidRequest.manufacturers)
            ? bidRequest.manufacturers.map((m, i) => (
                <span key={i}>{m.manufacturer.name} ({m.status}){bidRequest.manufacturers && i < bidRequest.manufacturers.length - 1 ? ', ' : ''}</span>
              ))
            : 'N/A'}
          </div>
          <Divider />
                    <div className="mb-2"><b>Created At:</b> {new Date(bidRequest.createdAt).toLocaleString('en-US')}</div>
                    <Divider />
                    <div className="mb-2"><b>Updated At:</b> {new Date(bidRequest.updatedAt).toLocaleString('en-US')}</div>
                    <Divider />
                    <div className="flex justify-end">
                        <button
                            className="p-button p-component p-button-primary"
                            onClick={() => {
                                if (bidRequestId) {
                                    const userId = location.state?.userId;
                                    navigate('/BidOffer', { state: { bidRequestId, manufactorerId: userId } });
                                }
                            }}
                        >
                            Submit Offer
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default BidRequestDetails;
