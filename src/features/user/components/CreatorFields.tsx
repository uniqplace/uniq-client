import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { setCreatorProfile } from '../slices/userSlice';
import { useGetAllCategoriesQuery } from '../../marketplace/slices/categoriesApiSlice';
import type { CreatorProfile } from '../../../types';

const mainCities = [
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

const CreatorFields: React.FC<{ initialData?: CreatorProfile | null; disabled?: boolean }> = ({ initialData, disabled = false }) => {
  const dispatch = useDispatch();

  const [location, setLocation] = useState(initialData?.location || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  // Type guard to check if an object is a Category with an _id property
  function isCategory(obj: any): obj is { _id: string } {
    return obj && typeof obj === 'object' && typeof obj._id === 'string';
  }

  const [categories, setCategories] = useState<string[]>(
    Array.isArray(initialData?.categories) && initialData.categories.length > 0
      ? typeof initialData.categories[0] === 'string'
        ? initialData.categories as string[]
        : (initialData.categories as any[]).filter(isCategory).map((cat) => cat._id)
      : ['']
  );
  const [errors, setErrors] = useState({ location: '', phone: '', categories: '' });
  const [touched, setTouched] = useState({ location: false, phone: false, categories: false });

  // Fetch all categories from server
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const allCategoryOptions = (categoriesData?.data || []).map((cat: any) => ({ label: cat.name, value: cat._id }));

  const validate = (): boolean => {
    const newErrors = { location: '', phone: '', categories: '' };
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!/^[0-9]{10}$/.test(phone)) newErrors.phone = 'Invalid phone number';
    if (!categories.length || !categories[0]) newErrors.categories = 'At least one category is required';
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleBlur = (field: 'location' | 'phone' | 'categories') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (validate()) {
      const filteredCategories = categories.filter(Boolean);
      dispatch(
        setCreatorProfile({
          userId: '',
          name: initialData?.name || '',
          location,
          phone,
          rating: initialData?.rating || 0,
          ratingCount: initialData?.ratingCount || 0,
          categories: filteredCategories,
        })
      );
    }
  };

  // Add a new empty category dropdown only if all current are selected
  const handleAddCategory = () => {
    if (categories.length < allCategoryOptions.length && categories.every(Boolean)) {
      setCategories([...categories, '']);
    }
  };

  // Remove a category dropdown
  const handleRemoveCategory = (idx: number) => {
    setCategories(categories.filter((_, i) => i !== idx));
  };

  // Update a specific category
  const handleCategoryChange = (idx: number, value: string) => {
    setCategories(categories.map((cat, i) => (i === idx ? value : cat)));
  };

  // Filter out already selected categories for each dropdown
  const getAvailableOptions = (idx: number) => {
    const selected = categories.filter((_, i) => i !== idx);
    return allCategoryOptions.filter(opt => !selected.includes(opt.value));
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 p-6 md:p-10 mt-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Creator Details</h2>
      {/* Categories */}
      <div className="field mb-8 border border-gray-200 rounded-lg p-6">
        <label className="block text-900 font-semibold mb-3 text-lg">Categories</label>
        {categories.map((cat, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Dropdown
              value={cat}
              options={getAvailableOptions(idx)}
              onChange={e => handleCategoryChange(idx, e.value)}
              onBlur={() => handleBlur('categories')}
              disabled={disabled || categoriesLoading}
              placeholder={categoriesLoading ? 'Loading...' : 'Select category'}
              className={touched.categories && errors.categories ? 'p-invalid w-full' : 'w-full'}
            />
            {categories.length > 1 && (
              <Button icon="pi pi-minus" onClick={() => handleRemoveCategory(idx)} disabled={disabled} />
            )}
          </div>
        ))}
        <Button
          label="Add Category"
          icon="pi pi-plus"
          onClick={handleAddCategory}
          disabled={
            disabled ||
            categories.length >= allCategoryOptions.length ||
            categories.some((cat) => !cat)
          }
        />
        {touched.categories && errors.categories && (
          <div className="text-red-500 text-sm mt-1">{errors.categories}</div>
        )}
      </div>

      {/* Location */}
      <div className="field mb-8 border border-gray-200 rounded-lg p-6">
        <label className="block text-900 font-semibold mb-3 text-lg">City</label>
        <Dropdown
          value={location}
          options={mainCities}
          onChange={(e) => setLocation(e.value)}
          onBlur={() => handleBlur('location')}
          disabled={disabled}
          className={touched.location && errors.location ? 'p-invalid w-full' : 'w-full'}
          placeholder="Select a city"
        />
        {touched.location && errors.location && (
          <div className="text-red-500 text-sm mt-1">{errors.location}</div>
        )}
      </div>

      {/* Phone Number */}
      <div className="field mb-8 border border-gray-200 rounded-lg p-6">
        <label className="block text-900 font-semibold mb-3 text-lg">Phone Number</label>
        <InputText
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => handleBlur('phone')}
          disabled={disabled}
          className={touched.phone && errors.phone ? 'p-invalid w-full' : 'w-full'}
          placeholder="Enter your phone number"
        />
        {touched.phone && errors.phone && (
          <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
        )}
      </div>
    </div>
  );
};

export default CreatorFields;
