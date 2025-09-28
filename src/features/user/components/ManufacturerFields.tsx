import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import type { DropdownChangeEvent } from 'primereact/dropdown';
import { useGetAllCategoriesQuery } from '../../marketplace/slices/categoriesApiSlice';
import { useAppSelector } from '../../../hooks/hooks';
import { Calendar } from 'primereact/calendar';

export interface ManufacturerFieldsRef {
  validate: () => boolean;
}

interface ManufacturerFieldsProps {
  servicesOffered: string[];
  setServicesOffered: React.Dispatch<React.SetStateAction<string[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  availableFrom: string;
  setAvailableFrom: React.Dispatch<React.SetStateAction<string>>;
  handleItemChange: (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => void;
  handleAddItem: (setter: React.Dispatch<React.SetStateAction<string[]>>) => void;
  handleRemoveItem: (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => void;
  disabled?: boolean;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
}

const ManufacturerFields = forwardRef<ManufacturerFieldsRef, ManufacturerFieldsProps>(
  (
    {
      servicesOffered,
      setServicesOffered,
      categories,
      setCategories,
      location,
      setLocation,
      availableFrom,
      setAvailableFrom,
      handleItemChange,
      handleAddItem,
      handleRemoveItem,
      disabled = false,
      phone,
      setPhone,
    },
    ref
  ) => {
    const [errors, setErrors] = useState({
      services: '',
      categories: '',
      location: '',
      availableFrom: '',
      phone: '', // Add phone to errors state
    });
    const [showErrors, setShowErrors] = useState(false);

    const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();

    const categoryOptions = (categoriesData?.data || []).map((cat: any) => ({
      label: cat.name,
      value: cat._id,
    }));

    const profile = useAppSelector(state => state.manufacturer.profile);
    // if (!profile) {
    // return <div>Loading manufacturer profile...</div>;
    // }

    useEffect(() => {
      // Update states with existing values
      setServicesOffered(profile?.servicesOffered || []);
      if (Array.isArray(profile?.categories) && profile.categories.length > 0) {
        if (typeof profile.categories[0] === 'string') {
          setCategories(profile.categories as string[]);
        } else {
          setCategories((profile.categories as { _id: string }[]).map((cat) => cat._id));
        }
      } else {
        setCategories([]);
      }
      setLocation(profile?.location || '');
      setAvailableFrom(
        profile?.availableFrom && /^\d{4}-\d{2}-\d{2}$/.test(profile.availableFrom.split('T')[0])
          ? profile.availableFrom.split('T')[0]
          : ''
      );
      setPhone(profile?.phone || '');
    }, [profile]);

    const updateCategory = (index: number, value: string) => {
      setCategories(categories.map((c, i) => (i === index ? value : c)));
    };

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

    const validate = () => {
      const newErrors: typeof errors = {
        services: '',
        categories: '',
        location: '',
        availableFrom: '',
        phone: '', // Validate phone number
      };
      if (!servicesOffered.some((s) => s.trim())) newErrors.services = 'At least one service is required';
      if (!categories.length || !categories[0]) newErrors.categories = 'Category is required';
      if (!location.trim()) newErrors.location = 'Location is required';
      if (!availableFrom) newErrors.availableFrom = 'Available from date is required';
      if (!phone.trim() || !/^\d{10}$/.test(phone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }

      setErrors(newErrors);
      const isValid = Object.values(newErrors).every((e) => !e);
      setShowErrors(!isValid);
      return isValid;
    };

    useImperativeHandle(ref, () => ({ validate }));

    return (
      <div className="w-full bg-white border-b border-gray-200 p-6 md:p-10 mt-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Manufacturer Details</h2>

        {/* Services */}
        <div className="field mb-8 border border-gray-200 rounded-lg p-6">
          <label className="block text-900 font-semibold mb-3 text-lg">Services / Facilities</label>
          {servicesOffered?.map((service, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-3">
              <InputText
                value={service}
                onChange={(e) => handleItemChange(idx, e.target.value, setServicesOffered)}
                placeholder="e.g. CNC Machining"
                disabled={disabled}
              />
              <Button
                icon="pi pi-minus"
                onClick={() => handleRemoveItem(idx, setServicesOffered)}
                disabled={disabled}
              />
            </div>
          ))}
          <Button
            label="Add Service"
            icon="pi pi-plus"
            onClick={() => handleAddItem(setServicesOffered)}
            disabled={disabled}
          />
          {showErrors && errors.services && (
            <div className="text-red-500 text-sm mt-1">{errors.services}</div>
          )}
        </div>

        {/* Categories */}
        <div className="field mb-8 border border-gray-200 rounded-lg p-6">
          <label className="block text-900 font-semibold mb-3 text-lg">Categories</label>
          <Dropdown
            value={categories[0] || ''}
            onChange={(e: DropdownChangeEvent) => updateCategory(0, e.value)}
            options={categoryOptions}
            placeholder={categoriesLoading ? 'Loading...' : 'Select category'}
            disabled={disabled || categoriesLoading}
          />
          {categories.slice(1).map((cat, idx) => (
            <div key={cat + idx} className="flex items-center gap-2 mt-2">
              <Dropdown
                value={cat}
                onChange={(e: DropdownChangeEvent) => updateCategory(idx + 1, e.value)}
                options={categoryOptions}
                disabled={disabled || categoriesLoading}
              />
              <Button
                icon="pi pi-minus"
                onClick={() => setCategories(categories.filter((_, i) => i !== idx + 1))}
                disabled={disabled}
              />
            </div>
          ))}
          <Button
            label="Add Category"
            icon="pi pi-plus"
            onClick={() => setCategories([...categories, ''])}
            disabled={disabled}
          />
          {showErrors && errors.categories && (
            <div className="text-red-500 text-sm mt-1">{errors.categories}</div>
          )}
        </div>

        {/* Location */}
        <div className="field mb-8 border border-gray-200 rounded-lg p-6">
          <label className="block text-900 font-semibold mb-3 text-lg">City</label>
          <Dropdown
            value={location}
            onChange={(e: DropdownChangeEvent) => setLocation(e.value)}
            options={mainCities}
            disabled={disabled}
          />
          {showErrors && errors.location && (
            <div className="text-red-500 text-sm mt-1">{errors.location}</div>
          )}
        </div>
        {/* Available From */}
        <div className="field mb-4 border border-gray-200 rounded-lg p-6">
          <label className="block text-900 font-semibold mb-3 text-lg">Available From</label>

          <Calendar
            value={availableFrom ? new Date(availableFrom) : null} // מוודא שיש תאריך
            onChange={(e) => setAvailableFrom(e.value ? (e.value as Date).toISOString().split('T')[0] : '')} // שמירה בפורמט YYYY-MM-DD
            showIcon
            disabled={disabled}
            className="w-full"
            minDate={new Date()}
            dateFormat="yy-mm-dd"
            placeholder="Select a date"
          />

          {showErrors && errors.availableFrom && (
            <div className="text-red-500 text-sm mt-1">{errors.availableFrom}</div>
          )}
        </div>

        {/* Phone Number */}
        <div className="field mb-8 border border-gray-200 rounded-lg p-6">
          <label className="block text-900 font-semibold mb-3 text-lg">Phone Number</label>
          <InputText
            value={phone ?? ''} // Ensure default value is an empty string
            onChange={(e) => {
              const newPhone = e.target.value;
              setPhone(newPhone);
              if (!/^\d{10}$/.test(newPhone)) {
                setErrors((prev) => ({
                  ...prev,
                  phone: 'Please enter a valid 10-digit phone number.',
                }));
              } else {
                setErrors((prev) => ({
                  ...prev,
                  phone: '',
                }));
              }
            }}
            placeholder="Enter your phone number"
            disabled={disabled}
            className="w-full"
          />
          {showErrors && errors.phone && (
            <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
          )}
        </div>
      </div>
    );
  }
);

export default ManufacturerFields;
