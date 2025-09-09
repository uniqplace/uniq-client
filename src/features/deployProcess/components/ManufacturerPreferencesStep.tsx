import React, { useState, useRef } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
import { useDispatch } from 'react-redux';
import { saveBidRequest, fetchBidRequestByProductId } from '../../deployProcess/slices/stepperSlice';
import { useGetAllCategoriesQuery } from '../../marketplace/slices/categoriesApiSlice';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import type { Category } from '../../../types';
import { useAppSelector } from '../../../hooks/hooks';

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

const hardcodedLocations = [
  { label: 'Tel Aviv', value: 'tel_aviv' },
  { label: 'Jerusalem', value: 'jerusalem' },
  { label: 'Haifa', value: 'haifa' },
  { label: 'Beer Sheva', value: 'beer_sheva' },
  { label: 'Ashdod', value: 'ashdod' },
  { label: 'Rishon Lezion', value: 'rishon_lezion' },
  { label: 'Petah Tikva', value: 'petah_tikva' },
  { label: 'Netanya', value: 'netanya' },
  { label: 'Herzliya', value: 'herzliya' },
  { label: 'Raanana', value: 'raanana' },
  { label: 'Kfar Saba', value: 'kfar_saba' },
  { label: 'Modiin', value: 'modiin' },
  { label: 'Rehovot', value: 'rehovot' },
  { label: 'Ashkelon', value: 'ashkelon' },
  { label: 'Afula', value: 'afula' },
  { label: 'Tiberias', value: 'tiberias' },
  { label: 'Eilat', value: 'eilat' },
  { label: 'General', value: 'general' },
];

import type { StepProps } from "./Stepper/steps";
import NormalizedRating from '../../../components/shared/Rating';

const ManufacturerPreferencesStep: React.FC<StepProps> = ({ onComplete, setCanGoNext }) => {
  const loading = useAppSelector((state) => state.stepper.loading);

  // Redux stepper state (must be above localStorage logic)
  const completedSteps = useAppSelector(state => state.stepper.completedSteps);
  const currentStepIndex = useAppSelector(state => state.stepper.currentStepIndex);
  // Assuming this step is index 1 (change as needed)
  const thisStepIndex = 1;
  const isStepCompleted = completedSteps?.[thisStepIndex];

  // Readonly state based on step completion
  const isReadOnly = !!isStepCompleted;
  // const isReadOnly = (currentStepIndex ?? -1) > thisStepIndex;


  // Get bidRequest from Redux
  const bidRequest = useAppSelector(state => state.stepper.bidRequest);
  const [categoryId, setCategoryId] = useState<string | null>(typeof bidRequest?.categoryId === 'string' ? bidRequest.categoryId : null);
  const [locationPreference, setLocationPreference] = useState<string | null>(bidRequest?.locationPreference ?? null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>(bidRequest?.priceRange ?? { min: priceRangeMin, max: priceRangeMax });
  const [deliveryTimeframe, setDeliveryTimeframe] = useState<string>(bidRequest?.deliveryTimeframe ?? '7 days');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping'>(bidRequest?.deliveryMethod ?? 'pickup');
  const [ratingPreference, setRatingPreference] = useState<number>(bidRequest?.ratingPreference ?? 1);

  const dispatch = useDispatch();
  // Restore step and form data from Redux on mount (if needed)
  React.useEffect(() => {
    if (bidRequest) {
      if (typeof bidRequest.categoryId === 'string') setCategoryId(bidRequest.categoryId);
      if (bidRequest.locationPreference !== undefined) setLocationPreference(bidRequest.locationPreference);
      if (bidRequest.priceRange !== undefined) setPriceRange(bidRequest.priceRange);
      if (bidRequest.deliveryTimeframe !== undefined) setDeliveryTimeframe(bidRequest.deliveryTimeframe);
      if (bidRequest.deliveryMethod !== undefined) setDeliveryMethod(bidRequest.deliveryMethod);
      if (bidRequest.ratingPreference !== undefined) setRatingPreference(bidRequest.ratingPreference ?? 1);
    }
  }, [bidRequest]);

  // Prefill logic: on mount, if no bidRequest in Redux and productId exists, fetch from server
  React.useEffect(() => {
    // Only fetch if bidRequest is empty/null and productId exists
    if (!bidRequest) {
      let productId: string | null = null;
      const guestId = localStorage.getItem('productId_guest');
      if (guestId) {
        productId = guestId;
      } else {
        const keys = Object.keys(localStorage);
        const productKey = keys.find(k => k.startsWith('productId_'));
        if (productKey) {
          productId = localStorage.getItem(productKey);
        }
      }
      if (productId) {
        // @ts-ignore
        dispatch(fetchBidRequestByProductId(productId));
      }
    }
  }, [bidRequest, dispatch]);

  const toast = useRef<Toast>(null);

  const { data: allCategories, isLoading: loadingCategories, error: categoriesError } = useGetAllCategoriesQuery();

  const categoryOptions = allCategories ? allCategories.data.map((category: Category) => ({ label: category.name, value: category._id })) : [];

  const locationOptions = hardcodedLocations;

  const userId = useAppSelector(state => state.user?.id);
  // Debug: log userId before validation
  console.log('[BidRequest] userId from Redux (user.id):', userId);

  // Save form data to bidRequest in Redux slice on change
  React.useEffect(() => {
    if (!isReadOnly) {
      dispatch({
        type: 'stepper/setBidRequest',
        payload: {
          ...bidRequest,
          categoryId,
          locationPreference,
          priceRange,
          deliveryTimeframe,
          deliveryMethod,
          ratingPreference,
        }
      });
    }
  }, [categoryId, locationPreference, priceRange, deliveryTimeframe, deliveryMethod, ratingPreference, isReadOnly, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get a real productId from localStorage (can be refactored to Redux if needed)
    let productId = undefined;
    const guestId = localStorage.getItem('productId_guest');
    if (guestId) {
      productId = guestId;
    } else {
      const keys = Object.keys(localStorage);
      const productKey = keys.find(k => k.startsWith('productId_'));
      if (productKey) {
        productId = localStorage.getItem(productKey);
      }
    }
    if (!productId) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No productId found. Please start from the first step.',
        life: 4000,
      });
      return;
    }

    // Use bidRequest from Redux
    if (!bidRequest) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Preferences not found in Redux', life: 4000 });
      return;
    }

    // Validate that all required fields are present
    if (!bidRequest.categoryId || typeof bidRequest.categoryId !== 'string') {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Category is required', life: 4000 });
      return;
    }
    if (!bidRequest.locationPreference) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Location is required', life: 4000 });
      return;
    }
    if (!bidRequest.priceRange?.min || !bidRequest.priceRange?.max) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Price range is required', life: 4000 });
      return;
    }
    if (!bidRequest.deliveryTimeframe) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Delivery timeframe is required', life: 4000 });
      return;
    }
    if (!bidRequest.deliveryMethod) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Delivery method is required', life: 4000 });
      return;
    }

    // clientId is required on the server - we will use userId from Redux
    if (!userId) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Client ID is required. Please login.', life: 4000 });
      return;
    }

    // Type guard for categoryId
    function isCategoryObj(val: unknown): val is { id: string } {
      return (
        typeof val === 'object' &&
        val !== null &&
        'id' in val &&
        typeof (val as any).id === 'string'
      );
    }
    const preferences = {
      ...bidRequest,
      clientId: userId,
      creatorId: userId, // required by backend
      productId,
      categoryId: isCategoryObj(bidRequest.categoryId)
        ? bidRequest.categoryId.id
        : bidRequest.categoryId,
    };
    console.log('[BidRequest] Sending preferences:', preferences);

    dispatch({ type: 'stepper/setBidRequest', payload: preferences });
    // Mark this step as completed in Redux (so it will be in completedSteps)
    // if (typeof currentStepIndex === 'number') {
    //   dispatch({ type: 'stepper/markStepCompleted', payload: currentStepIndex });
    // }

    try {
      // קריאה לשרת דרך thunk של Redux
      // @ts-ignore
      const resultAction = await dispatch(saveBidRequest(preferences));
      // @ts-ignore
      if (resultAction.meta && resultAction.meta.requestStatus === 'fulfilled') {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Bid request opened successfully.',
          life: 4000,
        });
        // אפשר לעבור לשלב הבא רק אחרי הצלחה
        setCanGoNext && setCanGoNext(true);
        onComplete && onComplete();
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create bid request. Please try again.',
          life: 4000,
        });
      }
    } catch (error: any) {
      console.error('Error creating bid request:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create bid request. Please try again.',
        life: 4000,
      });
    }
  };


  // Primereact Slider onChange event type is { value: number | [number, number] }
  const handlePriceRangeChange = (e: { value: number | [number, number] }) => {
    if (isReadOnly) return;
    if (Array.isArray(e.value)) {
      setPriceRange({ min: e.value[0], max: e.value[1] });
    }
  };

  const handleDeliveryTimeframeChange = (event: { value: number | [number, number] }) => {
    if (isReadOnly) return;
    const index = Array.isArray(event.value) ? event.value[0] : event.value;
    const selected = deliveryOptions[index];
    if (selected) {
      setDeliveryTimeframe(selected.label);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (isReadOnly) return;
    if (e.key === 'Enter') {
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
      }
    }
  };

  const isFormValid = categoryId && locationPreference && priceRange.min && priceRange.max && deliveryTimeframe && deliveryMethod;
  if (!loading || currentStepIndex !== null) {
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
            onChange={e => !isReadOnly && setCategoryId(e.value)}
            placeholder="Select a category"
            className="w-full"
            disabled={loadingCategories || !!categoriesError || isReadOnly}
          />
        </div>

        <div className="flex flex-col items-center w-full">
          <label htmlFor="location" className="block mb-2 font-medium">Location</label>
          <Dropdown
            id="location"
            value={locationPreference}
            options={locationOptions}
            onChange={e => !isReadOnly && setLocationPreference(e.value)}
            placeholder="Select a location"
            className="w-full"
            disabled={loadingCategories || isReadOnly}
          />
        </div>

        <div className="flex flex-col items-center w-full">
          <label className="block mb-2 font-medium">Price Range ($)</label>
          <Slider
            value={[priceRange.min, priceRange.max]}
            onChange={handlePriceRangeChange}
            range
            min={priceRangeMin}
            max={priceRangeMax}
            step={10}
            className="w-full"
            disabled={isReadOnly}
          />
          <div className="flex justify-between text-sm mt-2 w-full">
            <span>{priceRange.min}</span>
            <span>{priceRange.max}</span>
          </div>
        </div>

        <div className="flex flex-col items-center w-full">
          <label className="block mb-2 font-medium">Rating Preference</label>
          <NormalizedRating
            rating={ratingPreference}
            readOnly={isReadOnly}
            onChange={value => !isReadOnly && setRatingPreference(value)}
            className="w-full"
          />

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
            disabled={isReadOnly}
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
            onChange={e => !isReadOnly && setDeliveryMethod(e.value)}
            className="w-full"
            disabled={isReadOnly}
          />
        </div>

        <Button type="submit" label="Continue" className="mt-6 w-full" disabled={!isFormValid || isReadOnly} />
      </form>
    );
  };
}

export default ManufacturerPreferencesStep;
