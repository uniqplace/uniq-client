import React, { useRef } from 'react';
import type { RefObject } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Slider } from 'primereact/slider';

interface Props {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minProductPrice: number;
  maxProductPrice: number;
  pricePanelRef: RefObject<OverlayPanel>;
}

const PriceFilterSection: React.FC<Props> = ({ priceRange, setPriceRange, minProductPrice, maxProductPrice, pricePanelRef }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pricePanelRef?.current) {
      const panel = pricePanelRef.current.getElement();
      if (panel) {
        const filterBtn = panel.querySelector('.filter-btn');
        if (filterBtn) {
          (filterBtn as HTMLButtonElement).click();
        }
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <label id="price-slider-label" htmlFor="price-slider" className="mb-5 font-semibold">Select a price range</label>
        <Slider
          id="price-slider"
          aria-labelledby="price-slider-label"
          value={priceRange}
          onChange={e => {
            if (Array.isArray(e.value)) setPriceRange(e.value as [number, number]);
          }}
          range
          min={minProductPrice}
          max={maxProductPrice}
          step={10}
          style={{ width: '200px' }}
          // @ts-ignore
          inputRef={inputRef}
          // @ts-ignore
          onKeyDown={handleSliderKeyDown}
        />
      </div>
      <div className="flex gap-2 mt-2">
        <span>${priceRange[0]}</span> - <span>${priceRange[1]}</span>
      </div>
    </div>
  );
};

export default PriceFilterSection;
