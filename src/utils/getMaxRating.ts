import type { BidOffer } from "../types";

export function getMaxRating(offers: BidOffer | BidOffer[] | null | undefined): number {
    console.log('offers in getMaxRating:', offers);
    
    if (!offers) return 5;

    const offerArray = Array.isArray(offers) ? offers : [offers];

    return Math.max(...offerArray.map(o => o.manufacturerId?.rating ?? 0), 5);
}
