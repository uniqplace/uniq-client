import { getDeliveryLabel } from '../../../utils/deliveryLabel';
import { calculateDeliveryDate } from '../../../utils/date';
import { getSliderValue } from '../../../utils/slider';
import React, { useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
import { useDispatch } from 'react-redux';
import { saveBidRequest, fetchOpenBidRequestsByProductId } from '../../deployProcess/slices/stepperSlice';
import { useGetAllCategoriesQuery } from '../../marketplace/slices/categoriesApiSlice';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { showErrorToast, showSuccessToast } from '../../../utils/toastHelpers';
import type { Category } from '../../../types';
import { useAppSelector } from '../../../hooks/hooks';
import type { StepProps } from "./Stepper/steps";
import NormalizedRating from '../../../components/shared/NormalizedRating';
import { useBidRequestId } from '../../../hooks/useBidRequestId';

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

function getCategoryIdValue(categoryId: string | { _id: string } | null): string | null {
  if (typeof categoryId === 'object' && categoryId !== null && '_id' in categoryId) {
    return categoryId._id;
  }
  return categoryId ?? null;
}

const ManufacturerPreferencesStep: React.FC<StepProps & { onNextStep?: () => void }> = ({ onComplete, setCanGoNext, productId, currentStepIndex, onNextStep }) => {
  const isInitializing = useRef(false);
  const [isBidOpened, setIsBidOpened] = useState(false);

  // קבלת bidRequest מה-Redux לפי productId מה-props
  const bidRequest = useAppSelector(state => productId ? state.stepper.productsInProgress[productId]?.bidRequest : undefined);

  // Redux stepper state (per productId)
  const stepperState = useAppSelector(state => productId ? state.stepper.productsInProgress[productId] : undefined);
  const loading = stepperState?.loading;
  const completedSteps = stepperState?.completedSteps;
  const currentStepIndexRedux = stepperState?.currentStepIndex;
  // Assuming this step is index 1 (change as needed)
  const thisStepIndex = 1;
  const isStepCompleted = completedSteps?.[thisStepIndex];

  // Readonly state based on step completion
  const isReadOnly = !!isStepCompleted;
  // const isReadOnly = (currentStepIndex ?? -1) > thisStepIndex;


  const [categoryId, setCategoryId] = useState<string | Category | null>(getCategoryIdValue(bidRequest?.categoryId ?? null));
  const [locationPreference, setLocationPreference] = useState<string | null>(bidRequest?.locationPreference ?? null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>(bidRequest?.priceRange ?? { min: 0, max: 1000 });
  const [deliveryTimeframe, setDeliveryTimeframe] = useState<Date>(
    bidRequest?.deliveryTimeframe ? new Date(bidRequest.deliveryTimeframe) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping'>(bidRequest?.deliveryMethod ?? 'pickup');
  const [rating, setRating] = useState<number>(bidRequest?.rating ?? 1);

  React.useEffect(() => {
    if (bidRequest) {
      isInitializing.current = true;
      setCategoryId(getCategoryIdValue(bidRequest.categoryId ?? null));
      setLocationPreference(bidRequest.locationPreference ?? null);
      setPriceRange(bidRequest.priceRange ?? { min: 0, max: 1000 });
      setDeliveryTimeframe(bidRequest.deliveryTimeframe ? new Date(bidRequest.deliveryTimeframe) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setDeliveryMethod(bidRequest.deliveryMethod ?? 'pickup');
      setRating(bidRequest.rating ?? 1);
      setTimeout(() => { isInitializing.current = false; }, 0);
    }
  }, [bidRequest]);
  const dispatch = useDispatch();
  const navigateToNextStep = () => {
    if (typeof currentStepIndex === 'number') {
      const steps = [
        'product-definition',
        'manufacturerPreferences',
        'viewLiveBids',
        'orderAndPayment',
        'tracking',
        'delivery',
      ];
      const nextKey = steps[currentStepIndex + 1];
      if (nextKey && productId) {
        window.location.href = `/create-your-own-product/${productId}/${nextKey}`;
      }
    }
  };

  // Prefill logic: on mount, if no bidRequest in Redux and productId exists, fetch from server
  React.useEffect(() => {
    // Only fetch if bidRequest is empty/null and productId exists
    if (!bidRequest && productId) {
      // @ts-ignore
      dispatch(fetchOpenBidRequestsByProductId(productId));
    }
  }, [dispatch, bidRequest, productId]);

  const toast = useRef<Toast>(null);

  const { data: allCategories, isLoading: loadingCategories, error: categoriesError } = useGetAllCategoriesQuery();

  const categoryOptions = allCategories ? allCategories.data.map((category: Category) => ({ label: category.name, value: category._id })) : [];

  const locationOptions = hardcodedLocations;

  const userId = useAppSelector(state => state.user?.id);

  // Memoized slider value for delivery timeframe
  const sliderValue = React.useMemo(() => {
    return getSliderValue(deliveryOptions, deliveryTimeframe);
  }, [deliveryOptions, deliveryTimeframe]);


  // Save form data to bidRequest in Redux slice on change
  React.useEffect(() => {
    if (!isReadOnly && !isInitializing.current && productId) {
      const localPayload = {
        categoryId: getCategoryIdValue(categoryId),
        locationPreference,
        priceRange,
        deliveryTimeframe: deliveryTimeframe.toISOString(),
        deliveryMethod,
        rating: rating,
      };
      const reduxPayload = {
        categoryId: bidRequest?.categoryId,
        locationPreference: bidRequest?.locationPreference,
        priceRange: bidRequest?.priceRange,
        deliveryTimeframe: bidRequest?.deliveryTimeframe,
        deliveryMethod: bidRequest?.deliveryMethod,
        rating: bidRequest?.rating,
      };
      const isEqual = JSON.stringify(localPayload) === JSON.stringify(reduxPayload);
      if (!isEqual) {
        dispatch({
          type: 'stepper/setBidRequest',
          payload: {
            ...bidRequest,
            ...localPayload,
            productId,
          }
        });
      }
    }
  }, [categoryId, locationPreference, priceRange, deliveryTimeframe, deliveryMethod, rating, isReadOnly, dispatch, bidRequest, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      showErrorToast(toast, 'No productId found. Please start from the first step.');
      return;
    }

    // אין bidRequest? ניצור חדש מהערכים המקומיים
    const baseBidRequest = bidRequest || {
      categoryId: getCategoryIdValue(categoryId),
      locationPreference,
      priceRange,
      deliveryTimeframe: deliveryTimeframe.toISOString(),
      deliveryMethod,
      rating,
      productId,
    };

    // Validate that all required fields are present
    if (!baseBidRequest.categoryId || typeof baseBidRequest.categoryId !== 'string') {
      showErrorToast(toast, 'Category is required');
      return;
    }
    if (!baseBidRequest.locationPreference) {
      showErrorToast(toast, 'Location is required');
      return;
    }
    if (!baseBidRequest.priceRange?.min || !baseBidRequest.priceRange?.max) {
      showErrorToast(toast, 'Price range is required');
      return;
    }
    if (!baseBidRequest.deliveryTimeframe) {
      showErrorToast(toast, 'Delivery timeframe is required');
      return;
    }
    if (!baseBidRequest.deliveryMethod) {
      showErrorToast(toast, 'Delivery method is required');
      return;
    }

    // clientId is required on the server - we will use userId from Redux
    if (!userId) {
      showErrorToast(toast, 'Client ID is required. Please login.');
      return;
    }
    
    const preferences = {
      ...baseBidRequest,
      clientId: userId,
      creatorId: userId,
      productId,
      categoryId: getCategoryIdValue(baseBidRequest.categoryId),
    };

    dispatch({ type: 'stepper/setBidRequest', payload: preferences });

    try {
      // @ts-ignore
      const resultAction = await dispatch(saveBidRequest(preferences));

      // @ts-ignore
      if (resultAction.meta && resultAction.meta.requestStatus === 'fulfilled') {
        showSuccessToast(toast, 'Bid request opened successfully.');
        setCanGoNext && setCanGoNext(true);
        onComplete && onComplete();
        setIsBidOpened(true);
        if (onNextStep) {
          console.log('onNextStep called from ManufacturerPreferencesStep');
          onNextStep(); // מעבר אוטומטי לשלב הבא
        } else {
          console.log('onNextStep not defined, fallback to navigateToNextStep');
          navigateToNextStep();
        }
      } else {
        showErrorToast(toast, 'Failed to create bid request. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating bid request:', error);
      showErrorToast(toast, 'Failed to create bid request. Please try again.');
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
      const days = selected.value;
      setDeliveryTimeframe(calculateDeliveryDate(days));
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
  if (!loading || currentStepIndexRedux !== null) {
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
            value={getCategoryIdValue(categoryId)}
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
            rating={rating}
            readOnly={isReadOnly}
            onChange={(value:number) => !isReadOnly && setRating(value)}
            className="w-full"
          />

          <div className="text-sm mt-2 text-center">{rating} Stars</div>
        </div>

        <div className="flex flex-col items-center w-full">
          <label className="block mb-2 font-medium">Delivery Timeframe</label>
          <Slider
            value={sliderValue}
            onChange={handleDeliveryTimeframeChange}
            min={0}
            max={deliveryOptions.length - 1}
            step={1}
            className="w-full"
            disabled={isReadOnly}
          />
          <div className="text-sm mt-2 text-center">{getDeliveryLabel(deliveryTimeframe)}</div>
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

        <Button type="submit" label="Open Bid Request" className="mt-6 w-full" disabled={!isFormValid || isReadOnly} />
      </form>
    );
  };

  React.useEffect(() => {
    // אם השלב הושלם או שיש מכרז פתוח, נאפשר מעבר לשלב הבא
    if (setCanGoNext && (isStepCompleted || (bidRequest && bidRequest.productId))) {
      setCanGoNext(true);
    }
  }, [setCanGoNext, isStepCompleted, bidRequest, currentStepIndex]);

  if (isReadOnly && setCanGoNext) {
    setCanGoNext(true);
  }
}

export default ManufacturerPreferencesStep;
