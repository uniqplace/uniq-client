import type { BidOffer } from '../types';

/**
 * Persists the selected bid offer in LocalStorage.
 * @param offer - The selected bid offer to persist, or null to remove it.
 */
export const persistSelectedOffer = (offer: BidOffer | null) => {
  if (offer) {
    localStorage.setItem('selectedBidOffer', JSON.stringify(offer));
  } else {
    localStorage.removeItem('selectedBidOffer');
  }
};