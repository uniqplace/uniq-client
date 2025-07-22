import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';

// Placeholder data, will be replaced with real data later
const categoryOptions = [
  { label: 'T-Shirts', value: 'tshirts' },
  { label: 'Hoodies', value: 'hoodies' },
  { label: 'Jeans', value: 'jeans' },
];
const locationOptions = [
  { label: 'Tel Aviv', value: 'tel-aviv' },
  { label: 'Jerusalem', value: 'jerusalem' },
  { label: 'Haifa', value: 'haifa' },
];

const priceRangeMin = 10;
const priceRangeMax = 1000;
const timeRangeMin = 1; // days
const timeRangeMax = 30; // days

const ManufacturerPreferencesStep: React.FC = () => {
  // In the future: get requestId from redux
  // const requestId = useSelector((state: RootState) => state.deploy.requestId);

  const [category, setCategory] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([priceRangeMin, priceRangeMax]);
  const [availability, setAvailability] = useState<number>(7);
  const [deliveryPref, setDeliveryPref] = useState<'delivery' | 'pickup'>('delivery');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle form submission (dispatch, API, etc.)
    // For now, just log
    console.log({ category, location, priceRange, availability, deliveryPref });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-5 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Select Bid Preferences</h2>

      <div>
        <label htmlFor="category" className="block mb-1 font-medium">Category</label>
        <Dropdown
          id="category"
          value={category}
          options={categoryOptions}
          onChange={e => setCategory(e.value)}
          placeholder="Select a category"
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="location" className="block mb-1 font-medium">Location</label>
        <Dropdown
          id="location"
          value={location}
          options={locationOptions}
          onChange={e => setLocation(e.value)}
          placeholder="Select a location"
          className="w-full"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Price Range (₪)</label>
        <Slider
          value={priceRange}
          onChange={e => setPriceRange(e.value as [number, number])}
          range
          min={priceRangeMin}
          max={priceRangeMax}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-sm mt-1">
          <span>{priceRange[0]}</span>
          <span>{priceRange[1]}</span>
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">Availability Time (days)</label>
        <Slider
          value={availability}
          onChange={e => setAvailability(e.value as number)}
          min={timeRangeMin}
          max={timeRangeMax}
          step={1}
          className="w-full"
        />
        <div className="text-sm mt-1">{availability} days</div>
      </div>

      <div>
        <label htmlFor="deliveryPref" className="block mb-1 font-medium">Delivery Preference</label>
        <SelectButton
          id="deliveryPref"
          value={deliveryPref}
          options={[
            { label: 'Delivery', value: 'delivery' },
            { label: 'Pickup', value: 'pickup' },
          ]}
          onChange={e => setDeliveryPref(e.value)}
          className="w-full"
        />
      </div>

      <Button type="submit" label="Continue" className="mt-4 w-full" />
    </form>
  );
};

export default ManufacturerPreferencesStep;
