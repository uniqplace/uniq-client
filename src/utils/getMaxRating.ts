import type { BidOffer } from "../types";

export function getMaxRating(offers: BidOffer | BidOffer[] | null | undefined): number {
    console.log('offers in getMaxRating:', offers);
    
    if (!offers) return 5;

    // אם זה הצעה בודדת, הופכים אותה למערך עם פריט אחד
    const offerArray = Array.isArray(offers) ? offers : [offers];

    // מחזירים את הדירוג הכי גבוה
    return Math.max(...offerArray.map(o => o.manufacturerId?.rating ?? 0), 5);
}
