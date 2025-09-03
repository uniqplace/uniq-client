import React, { useState, useEffect, useRef } from 'react';
import { Slider } from 'primereact/slider';

interface Props {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minProductPrice: number;
  maxProductPrice: number;
}

const PriceFilterSection: React.FC<Props> = ({
  priceRange,
  setPriceRange,
  minProductPrice,
  maxProductPrice,
}) => {
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>(priceRange);
  const debounceTimeout = useRef<number | null>(null);
  useEffect(() => {
    setTempPriceRange(priceRange);
  }, [priceRange]);

  // Debounce: update priceRange only after user stops dragging
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setPriceRange(
        tempPriceRange[0] > tempPriceRange[1]
          ? [tempPriceRange[1], tempPriceRange[0]]
          : tempPriceRange
      );
    }, 400);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [tempPriceRange, setPriceRange]);

  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        <label id="price-slider-label" htmlFor="price-slider" className="mb-3 font-semibold text-center">
          Select a price range
        </label>
        <div className="flex items-center gap-7 w-full justify-center">
          <Slider
            id="price-slider"
            aria-labelledby="price-slider-label"
            value={tempPriceRange}
            onChange={e => {
              if (Array.isArray(e.value)) setTempPriceRange(e.value as [number, number]);
            }}
            range
            min={minProductPrice}
            max={maxProductPrice}
            step={10}
            style={{ width: '70%', backgroundColor: '#f0f4f8', borderRadius: '8px' }}
            pt={{
              handle: {
                className: `
                  bg-blue-600 border-2 border-white w-7 h-7 rounded-full shadow-lg
                  transition-colors duration-200 hover:bg-blue-800
                  absolute -translate-y-1/4
                `
              },
            }}
            className="mb-2 shadow-sm"
          />
        </div>
        <div className="flex gap-2 mt-2 text-center">
          <span>${tempPriceRange[0]}</span> - <span>${tempPriceRange[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceFilterSection;