import React, { useRef, useEffect } from 'react';
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
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sliderRef.current) {
      // Find the input inside the slider
      const input = sliderRef.current.querySelector('input');
      if (input) {
        input.onkeydown = (e: KeyboardEvent) => {
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
      }
    }
  }, [sliderRef, pricePanelRef, priceRange]);

  return (
    <div className="w-full">
      <div className="mb-2 font-semibold">Select a price range</div>
      <div ref={sliderRef}>
        <Slider
          value={priceRange}
          onChange={e => {
            if (Array.isArray(e.value)) setPriceRange(e.value as [number, number]);
          }}
          range
          min={minProductPrice}
          max={maxProductPrice}
          step={10}
          style={{ width: '200px' }}
        />
      </div>
      <div className="flex gap-2 mt-2">
        <span>${priceRange[0]}</span> - <span>${priceRange[1]}</span>
      </div>
    </div>
  );
};

export default PriceFilterSection;
