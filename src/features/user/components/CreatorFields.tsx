import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { setCreatorProfile } from '../slices/userSlice';
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
  const [errors, setErrors] = useState({ location: '', phone: '' });
  const [touched, setTouched] = useState({ location: false, phone: false });

  const validate = (): boolean => {
    const newErrors = { location: '', phone: '' };

    if (!location.trim()) newErrors.location = 'Location is required';
    if (!/^\d{10}$/.test(phone)) newErrors.phone = 'Invalid phone number';

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleBlur = (field: 'location' | 'phone') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (validate()) {
      dispatch(
        setCreatorProfile({
          userId: '',
          name: initialData?.name || '',
          location,
          phone,
          rating: initialData?.rating || 0,
          ratingCount: initialData?.ratingCount || 0,
        })
      );
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 p-6 md:p-10 mt-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Creator Details</h2>

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
