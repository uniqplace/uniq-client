import React from "react";
import { Rating } from "primereact/rating";
import type { BidOffer } from "../../types";

interface NormalizedRatingProps {
  rating?: number;                  
  offers?: BidOffer | BidOffer[]; 
  maxRating?: number;               
  readOnly?: boolean;               
  onChange?: (value: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function getMaxRating(offers: BidOffer | BidOffer[] | null | undefined): number {
  if (!offers) return 5;
  const offerArray = Array.isArray(offers) ? offers : [offers];
  return Math.max(...offerArray.map(o => o.manufacturerId?.rating ?? 0), 5);
}

const NormalizedRating: React.FC<NormalizedRatingProps> = ({
  rating = 0,
  offers,
  maxRating,
  readOnly = true,
  onChange,
  className,
  style
}) => {
  const effectiveMax = maxRating ?? getMaxRating(offers ?? null);
  const normalizedValue = effectiveMax > 0 ? (rating / effectiveMax) * 5 : 0;

  return (
    <Rating
      value={normalizedValue}
      readOnly={readOnly}
      cancel={false}
      stars={5}
      onChange={e => onChange?.(e.value ?? 0)}
      className={className}
      style={style}
    />
  );
};

export default NormalizedRating;
