import React, { useRef, useState, useEffect } from 'react';
import type { RefObject } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Slider } from 'primereact/slider';
import { Button } from 'primereact/button';

interface Props {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minProductPrice: number;
  maxProductPrice: number;
  pricePanelRef: RefObject<OverlayPanel>;
  handleFilter?: () => void;
}

const PriceFilterSection: React.FC<Props> = ({ priceRange, setPriceRange, minProductPrice, maxProductPrice, pricePanelRef, handleFilter }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>(priceRange);

  useEffect(() => {
    setTempPriceRange(priceRange); 
  }, [priceRange]);

  useEffect(() => {
    if (handleFilter) {
      handleFilter();
    }
  }, [priceRange]);

  useEffect(() => {
    if (pricePanelRef.current) {
      const panelEl = pricePanelRef.current.getElement();
      if (panelEl) {
        const keydownHandler = (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            handleApply();
          }
        };
        panelEl.addEventListener('keydown', keydownHandler);
        return () => {
          panelEl.removeEventListener('keydown', keydownHandler);
        };
      }
    }
  }, [pricePanelRef]);

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  function handleApply(): void {
    const sortedRange: [number, number] = tempPriceRange[0] > tempPriceRange[1]
      ? [tempPriceRange[1], tempPriceRange[0]]
      : tempPriceRange;
    setPriceRange(sortedRange);
    if (handleFilter) {
      handleFilter();
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        <label id="price-slider-label" htmlFor="price-slider" className="mb-3 font-semibold text-center">
          Select a price range
        </label>
        <div className="flex items-center gap-4 w-full justify-center">
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
            style={{ width: '70%', backgroundColor: '#f0f4f8', borderRadius: '8px', padding: '5px' }}
            className="mb-2 shadow-sm"
            // @ts-ignore
            inputRef={inputRef}
            // @ts-ignore
            onKeyDown={handleSliderKeyDown}
          />
          <Button
            label="Apply"
            className="p-button-rounded p-button-outlined p-button-sm bg-gray-100 px-3 py-1 rounded"
            onClick={() => handleApply()}
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
