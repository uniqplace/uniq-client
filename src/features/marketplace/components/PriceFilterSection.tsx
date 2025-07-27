import React from 'react';
import type { RefObject } from 'react';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Slider } from 'primereact/slider';

interface Props {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minProductPrice: number;
  maxProductPrice: number;
  pricePanelRef: RefObject<OverlayPanel>;
}

const PriceFilterSection: React.FC<Props> = ({ priceRange, setPriceRange, minProductPrice, maxProductPrice, pricePanelRef }) => (
  <span className="w-full">
    <Button
      label={`Price: $${priceRange[0]} - $${priceRange[1]}`}
      icon="pi pi-chevron-down"
      iconPos="right"
      onClick={e => pricePanelRef.current?.toggle(e)}
      className="p-button-outlined p-button-rounded w-full filter-btn"
    />
    <OverlayPanel ref={pricePanelRef}>
      <div style={{ width: 220 }}>
        <div className="mb-2 font-semibold">Select a price range</div>
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
        <div className="flex gap-2 mt-2">
          <span>${priceRange[0]}</span> - <span>${priceRange[1]}</span>
        </div>
      </div>
    </OverlayPanel>
  </span>
);

export default PriceFilterSection;
