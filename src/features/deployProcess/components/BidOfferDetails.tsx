// BidOfferDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Rating } from "primereact/rating";
import { ArrowLeft } from "lucide-react";
import type { BidOffer } from "../../../types";
import { useAppDispatch } from "../../../hooks/hooks";
import { fetchBidOfferById } from "../slices/BidOfferSlice";

const BidOfferDetails: React.FC = () => {
    const { BidOfferId } = useParams<{ BidOfferId: string }>();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [offer, setOffer] = useState<BidOffer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const encoded = searchParams.get("manufacturerId"); // או 'encodedOffer'
        if (encoded) {
            try {
                const decoded = JSON.parse(atob(encoded)) as BidOffer;
                setOffer(decoded);
            } catch (err) {
                console.error("Failed to decode offer from URL", err);
            } finally {
                setLoading(false);
            }
        }
        else if (location.state && (location.state as any).offer) {
            setOffer((location.state as any).offer);
            setLoading(false);
        } else if (BidOfferId) {
            setLoading(true);
            dispatch(fetchBidOfferById(BidOfferId))
                .unwrap()
                .then((data: BidOffer) => {
                    setOffer(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [BidOfferId, location.state]);

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (!offer) return <div className="text-center py-8 text-red-500">Offer not found</div>;

    const maxRating = Math.max(offer.manufacturerId?.rating ?? 0, 5);

    return (
        <div className="max-w-3xl mx-auto p-4">
            {/* --- Back button --- */}
            <div className="mb-4">
                <Button
                    icon={<ArrowLeft />}
                    label="Back"
                    className="p-button-text"
                    onClick={() => {
                        if (window.history.length > 1) {
                          navigate(-1);
                        } else {
                          navigate('/MyBidRequest');
                        }
                      }}
                                           
                />
            </div>

            {/* --- Card with offer --- */}
            <Card className="shadow-lg border-round-lg p-6 space-y-6">
                {/* Manufacturer Info */}
                <div className="flex gap-4 items-center mb-6">
                    <Avatar
                        image={offer.manufacturerId?.userId?.avatarUrl || "/default-avatar.png"}
                        shape="circle"
                        size="xlarge"
                        className="[&>img]:w-full [&>img]:h-full [&>img]:object-cover"
                    />
                    <div className="flex flex-col">
                        <div className="flex justify-between w-full gap-2">
                            <span className="font-medium">Manufacturer Name:</span>
                            <span className="font-semibold">{offer.manufacturerId?.userId?.name}</span>
                        </div>
                        <div className="flex justify-between w-full mt-1 gap-4">
                            <span className="font-medium">Manufacturer Rating:</span>
                            <Rating
                                value={(offer.manufacturerId?.rating ?? 0) / maxRating * 5}
                                readOnly
                                cancel={false}
                                stars={5}
                            />
                        </div>
                    </div>
                </div>

                {/* Offer Details */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Offer Details</h3>
                    <div className="flex justify-between">
                        <span className="font-medium">Price:</span>
                        <span>${offer.price}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Lead Time:</span>
                        <span>{offer.estimatedDelivery ? new Date(offer.estimatedDelivery).toLocaleDateString() : "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Note:</span>
                        <span>{offer.note || "No note provided"}</span>
                    </div>
                </div>

                {/* --- Select Manufacturer Button --- */}
                <div className="mt-6 flex justify-center">
                    <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                        Select Manufacturer
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default BidOfferDetails;
