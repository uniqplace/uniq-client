import React, { useState, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
import { useDispatch } from 'react-redux';
import { setManufacturerPreferences } from '../slices/deploySlice';
import { useSaveBidRequestMutation } from '../slices/deployApiSlice';
import { useGetAllCategoriesQuery } from '../../marketplace/slices/categoriesApiSlice';
import { useGetLocationsQuery } from '../slices/locationApiSlice';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import type { Category } from '../../../types';

const priceRangeMin = 0;
const priceRangeMax = 1000;
const deliveryOptions = [
  ...Array.from({ length: 29 }, (_, i) => ({
    label: `${i + 1} day${i === 0 ? '' : 's'}`,
    value: i + 1,
  })),
  ...Array.from({ length: 6 }, (_, i) => {
    const month = i + 1;
    const days = month * 30;
    return {
      label: `${month} month${month > 1 ? 's' : ''}`,
      value: days,
    };
  }),
];

const ManufacturerPreferencesStep: React.FC = () => {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [locationPreference, setLocationPreference] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: priceRangeMin, max: priceRangeMax });
  const [deliveryTimeframe, setDeliveryTimeframe] = useState<string>('7 days');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping'>('pickup');
  const [ratingPreference, setRatingPreference] = useState<number>(1);
  const dispatch = useDispatch();
  const [saveBidRequest] = useSaveBidRequestMutation();
  const toast = useRef<Toast>(null);

  const { data: allCategories, isLoading: loadingCategories, error: categoriesError } = useGetAllCategoriesQuery();
  const { data: locationsData, isLoading: loadingLocations, error: locationsError } = useGetLocationsQuery(undefined);

  const categoryOptions = allCategories ? allCategories.data.map((category: Category) => ({ label: category.name, value: category._id })) : [];

  const locationOptions = locationsData
    ? [...locationsData.map((loc: any) => ({ label: loc.name, value: loc.id })), { label: 'General', value: 'general' }]
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const preferences = {
      productId: 'exampleProductId', // Replace with actual productId
      categoryId,
      locationPreference,
      priceRange: { min: priceRange.min, max: priceRange.max },
      deliveryTimeframe,
      deliveryMethod,
      ratingPreference,
    };

    dispatch(setManufacturerPreferences(preferences));

    try {
      const response = await saveBidRequest(preferences).unwrap();
      console.log('Bid request created successfully:', response);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Bid request opened successfully on ${new Date(response.createdAt).toLocaleDateString()}`,
        life: 4000,
      });
    } catch (error) {
      console.error('Error creating bid request:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create bid request. Please try again.',
        life: 4000,
      });
    }
  };

  const handlePriceRangeChange = (e: { value: [number, number] }) => {
    setPriceRange({ min: e.value[0], max: e.value[1] });
  };

  const handleDeliveryTimeframeChange = (event: { value: number | [number, number] }) => {
    const index = Array.isArray(event.value) ? event.value[0] : event.value;
    const selected = deliveryOptions[index];
    if (selected) {
      setDeliveryTimeframe(selected.label);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
      }
    }
  };

  const isFormValid = categoryId && locationPreference && priceRange.min && priceRange.max && deliveryTimeframe && deliveryMethod;

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-w-3xl mx-auto bg-white rounded shadow" onKeyPress={handleKeyPress}>
      <Toast ref={toast} />
      <h2 className="text-xl font-semibold mb-4 text-center">Select Bid Preferences</h2>

      {loadingCategories && <ProgressSpinner style={{ width: '50px', height: '50px' }} />}
      {categoriesError && <Message severity="error" text="Error loading categories" />}

      <div className="flex flex-col items-center w-full">
        <label htmlFor="category" className="block mb-2 font-medium">Category</label>
        <Dropdown
          id="category"
          value={categoryId}
          options={categoryOptions}
          onChange={e => setCategoryId(e.value)}
          placeholder="Select a category"
          className="w-full"
          disabled={loadingCategories || !!categoriesError}
        />
      </div>

      <div className="flex flex-col items-center w-full">
        <label htmlFor="location" className="block mb-2 font-medium">Location</label>
        <Dropdown
          id="location"
          value={locationPreference}
          options={locationOptions}
          onChange={e => setLocationPreference(e.value)}
          placeholder="Select a location"
          className="w-full"
          disabled={loadingLocations || !!locationsError}
        />
      </div>

      <div className="flex flex-col items-center w-full">
        <label className="block mb-2 font-medium">Price Range ($)</label>
        <Slider
          value={[priceRange.min, priceRange.max]}
          onChange={(e) => handlePriceRangeChange({ value: e.value as [number, number] })}
          range
          min={priceRangeMin}
          max={priceRangeMax}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-sm mt-2 w-full">
          <span>{priceRange.min}</span>
          <span>{priceRange.max}</span>
        </div>
      </div>

      <div className="flex flex-col items-center w-full">
        <label className="block mb-2 font-medium">Rating Preference</label>
        <div className="flex justify-center items-center w-full">
          <Rating
            value={ratingPreference}
            onChange={(e) => setRatingPreference(e.value ?? 1)}
            cancel={false}
            className="w-auto"
          />
        </div>
        <div className="text-sm mt-2 text-center">{ratingPreference} Stars</div>
      </div>

      <div className="flex flex-col items-center w-full">
        <label className="block mb-2 font-medium">Delivery Timeframe</label>
        <Slider
          value={deliveryOptions.findIndex(opt => opt.label === deliveryTimeframe)}
          onChange={handleDeliveryTimeframeChange}
          min={0}
          max={deliveryOptions.length - 1}
          step={1}
          className="w-full"
        />
        <div className="text-sm mt-2 text-center">{deliveryTimeframe}</div>
      </div>

      <div className="flex flex-col items-center w-full">
        <label htmlFor="deliveryMethod" className="block mb-2 font-medium">Delivery Method</label>
        <SelectButton
          id="deliveryMethod"
          value={deliveryMethod}
          options={[
            { label: 'Pickup', value: 'pickup' },
            { label: 'Shipping', value: 'shipping' },
          ]}
          onChange={e => setDeliveryMethod(e.value)}
          className="w-full"
        />
      </div>

      <Button type="submit" label="Continue" className="mt-6 w-full" disabled={!isFormValid} />
    </form>
  );
};

export default ManufacturerPreferencesStep;
