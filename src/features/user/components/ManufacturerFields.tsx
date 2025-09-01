// import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
// import { InputText } from 'primereact/inputtext';
// import { Button } from 'primereact/button';
// import { Dropdown } from 'primereact/dropdown';
// import type { DropdownChangeEvent } from 'primereact/dropdown';
// import { useGetAllCategoriesQuery } from '../../marketplace/slices/categoriesApiSlice';
// import { useSelector } from 'react-redux';
// import { useGetManufacturerProfileByUserIdQuery } from '../slices/manufacturerApiSlice';


// export interface ManufacturerFieldsRef {
//   validate: () => boolean;
// }

// interface ManufacturerFieldsProps {
//   servicesOffered: string[];
//   setServicesOffered: React.Dispatch<React.SetStateAction<string[]>>;
//   categories: string[];
//   setCategories: React.Dispatch<React.SetStateAction<string[]>>;
//   location: string;
//   setLocation: React.Dispatch<React.SetStateAction<string>>;
//   availableFrom: string;
//   setAvailableFrom: React.Dispatch<React.SetStateAction<string>>;
//   handleItemChange: (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => void;
//   handleAddItem: (setter: React.Dispatch<React.SetStateAction<string[]>>) => void;
//   handleRemoveItem: (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => void;
//   disabled?: boolean;
// }


// const ManufacturerFields = forwardRef<ManufacturerFieldsRef, ManufacturerFieldsProps>(
//   (
//     {
//       servicesOffered,
//       setServicesOffered,
//       categories,
//       setCategories,
//       location,
//       setLocation,
//       availableFrom,
//       setAvailableFrom,
//       handleItemChange,
//       handleAddItem,
//       handleRemoveItem,
//       disabled = false,
//     },
//     ref
//   ) => {
//     const [errors, setErrors] = useState({
//       services: '',
//       categories: '',
//       location: '',
//       availableFrom: '',
//     });
//     const user = useSelector((state: any) => state.user);
//     const manufacturerData = useSelector((state: any) => state.manufacturer); // Use state.manufacturer directly
//     const { data: manufacturerProfile } = useGetManufacturerProfileByUserIdQuery(user.i
//     ); // Use hook at the top level
//     console.log('manufacturerData ', manufacturerData);
//     useEffect(() => {
//       if (disabled) return; // Skip if the form is disabled

//       console.log('ManufacturerFields ', manufacturerProfile);

//       if (!manufacturerProfile) return;

//       setServicesOffered(user.servicesOffered || []); // Update services offered
//       setCategories(manufacturerProfile.categories || []); // Update categories
//       setLocation(manufacturerProfile.location || ''); // Map and update location
//       setAvailableFrom(manufacturerProfile.availableFrom?.split('T')[0] || ''); // Format and update availableFrom
//     }, [manufacturerProfile, setCategories, setLocation, setAvailableFrom, disabled]);

//     // Main Israeli cities in Hebrew for dropdown
//     const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
//     const categoryOptions = (categoriesData?.data || []).map((cat: any) => ({ label: cat.name, value: cat.name }));
//     const mainCities = [
//       { label: 'תל אביב', value: 'tel_aviv' },
//       { label: 'ירושלים', value: 'jerusalem' },
//       { label: 'חיפה', value: 'haifa' },
//       { label: 'באר שבע', value: 'beer_sheva' },
//       { label: 'ראשון לציון', value: 'rishon_letzion' },
//       { label: 'פתח תקווה', value: 'petah_tikva' },
//       { label: 'אשדוד', value: 'ashdod' },
//       { label: 'נתניה', value: 'netanya' },
//       { label: 'חולון', value: 'holon' },
//       { label: 'בני ברק', value: 'bnei_brak' }
//     ];
//     const [showErrors, setShowErrors] = useState(false);

//     const validate = () => {
//       const newErrors: typeof errors = { services: '', categories: '', location: '', availableFrom: '' };
//       if (!servicesOffered.some(s => s.trim())) newErrors.services = 'At least one service is required';
//       if (categories.length === 0 || !categories[0] || !categories[0].trim()) newErrors.categories = 'Category is required';
//       if (!location.trim()) newErrors.location = 'Location is required';
//       if (!availableFrom) newErrors.availableFrom = 'Available from date is required';
//       setErrors(newErrors);
//       const isValid = Object.values(newErrors).every(e => !e);
//       setShowErrors(!isValid);
//       return isValid;
//     };

//     React.useEffect(() => {
//       if (showErrors) {
//         const newErrors: typeof errors = { services: '', categories: '', location: '', availableFrom: '' };
//         if (!servicesOffered.some(s => s.trim())) newErrors.services = 'At least one service is required';
//         if (categories.length === 0 || !categories[0] || !categories[0].trim()) newErrors.categories = 'Category is required';
//         if (!location.trim()) newErrors.location = 'Location is required';
//         if (!availableFrom) newErrors.availableFrom = 'Available from date is required';
//         setErrors(newErrors);
//         const isValid = Object.values(newErrors).every(e => !e);
//         if (isValid) {
//           setShowErrors(false);
//         }
//       }
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [servicesOffered, categories, location, availableFrom]);

//     useImperativeHandle(ref, () => ({
//       validate
//     }));

//     return (
//       <div
//         className="w-full bg-white border-b border-gray-200 p-6 md:p-10 mt-8"
//         style={{ direction: 'rtl', borderRadius: 0, boxShadow: 'none', maxWidth: '100%' }}
//       >
//         <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Manufacturer Details</h2>
//         <div className="field mb-8 border border-gray-200 rounded-lg p-6">
//           <label className="block text-900 font-semibold mb-3 text-lg">Services / Facilities</label>
//           {servicesOffered?.map((service, idx) => (
//             <div key={idx} className="flex items-center gap-2 mb-3">
//               <InputText
//                 value={service || ''} // Ensure value is always a string
//                 maxLength={500}
//                 onChange={e => handleItemChange(idx, e.target.value, setServicesOffered)}
//                 placeholder="e.g. CNC Machining, Laser Cutting"
//                 className="w-full p-inputtext-lg"
//                 disabled={disabled}
//               />
//               <Button icon="pi pi-minus" className="p-button-rounded p-button-danger p-button-sm" onClick={() => handleRemoveItem(idx, setServicesOffered)} disabled={disabled} tooltip="Remove" />
//             </div>
//           ))}
//           <Button label="Add Service" icon="pi pi-plus" className="p-button-text p-button-success mb-2" onClick={() => handleAddItem(setServicesOffered)} disabled={disabled} />
//           {showErrors && errors.services && <div className="text-red-500 text-sm mt-1">{errors.services}</div>}
//         </div>
//         <div className="field mb-8 border border-gray-200 rounded-lg p-6">
//           <label className="block text-900 font-semibold mb-3 text-lg">Categories</label>
//           <div className="flex items-center gap-2 mb-3">
//             <Dropdown
//               value={categories?.[0] || ''} // Ensure value is always a string
//               onChange={(e: DropdownChangeEvent) => setCategories(cats => {
//                 const arr = [...cats];
//                 arr[0] = e.value;
//                 return arr;
//               })}
//               options={categoryOptions}
//               optionLabel="label"
//               optionValue="value"
//               placeholder={categoriesLoading ? 'Loading...' : 'Select category'}
//               disabled={disabled || categoriesLoading}
//               className="w-full p-inputtext-lg"
//             />
//           </div>
//           {categories?.slice(1).map((cat, idx) => (
//             <div key={idx + 1} className="flex items-center gap-2 mb-3">
//               <Dropdown
//                 value={cat}
//                 onChange={(e: DropdownChangeEvent) => setCategories(cats => cats.map((c, i) => i === idx + 1 ? e.value : c))}
//                 options={categoryOptions}
//                 optionLabel="label"
//                 optionValue="value"
//                 placeholder={categoriesLoading ? 'Loading...' : categories?.[idx + 1] || 'Select category'}
//                 disabled={disabled || categoriesLoading}
//                 className="w-full p-inputtext-lg"
//               />
//               <Button icon="pi pi-minus" className="p-button-rounded p-button-danger p-button-sm" onClick={() => setCategories(cats => cats.filter((_, i) => i !== idx + 1))} disabled={disabled} tooltip="Remove" />
//             </div>
//           ))}
//           <Button label="Add Category" icon="pi pi-plus" className="p-button-text p-button-success mb-2" onClick={() => setCategories(cats => [...cats, ''])} disabled={disabled} />
//           {showErrors && errors.categories && <div className="text-red-500 text-sm mt-1">{errors.categories}</div>}
//         </div>
//         <div className="field mb-8 border border-gray-200 rounded-lg p-6">
//           <label className="block text-900 font-semibold mb-3 text-lg">City</label>
//           <Dropdown
//             value={location || ''} // Ensure value is always a string
//             onChange={(e: DropdownChangeEvent) => setLocation(e.value)}
//             options={mainCities}
//             optionLabel="label"
//             optionValue="value"
//             className="w-full p-inputtext-lg"
//             placeholder="Select city"
//             disabled={disabled}
//           />
//           {showErrors && errors.location && <div className="text-red-500 text-sm mt-1">{errors.location}</div>}
//         </div>
//         <div className="field mb-4 border border-gray-200 rounded-lg p-6">
//           <label className="block text-900 font-semibold mb-3 text-lg">Available From</label>
//           <input
//             type="date"
//             value={availableFrom || ''} // Ensure value is always a string
//             onChange={e => setAvailableFrom(e.target.value)}
//             className="w-full p-inputtext p-inputtext-lg"
//             disabled={disabled}
//           />
//           {showErrors && errors.availableFrom && <div className="text-red-500 text-sm mt-1">{errors.availableFrom}</div>}
//         </div>
//       </div>
//     );
//   }
// );
// export default ManufacturerFields;



import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import type { DropdownChangeEvent } from 'primereact/dropdown';
import { useGetAllCategoriesQuery } from '../../marketplace/slices/categoriesApiSlice';

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
  handleItemChange: (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => void;
  handleAddItem: (setter: React.Dispatch<React.SetStateAction<string[]>>) => void;
  handleRemoveItem: (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => void;
  disabled?: boolean;
}

const ManufacturerFields = forwardRef<ManufacturerFieldsRef, ManufacturerFieldsProps>(({
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
  disabled = false
}, ref) => {

  const [errors, setErrors] = useState({ services: '', categories: '', location: '', availableFrom: '' });
  const [showErrors, setShowErrors] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const categoryOptions = (categoriesData?.data || []).map((cat: any) => ({ label: cat.name, value: cat.name }));

  const mainCities = [
    { label: 'תל אביב', value: 'tel_aviv' },
    { label: 'ירושלים', value: 'jerusalem' },
    { label: 'חיפה', value: 'haifa' },
    { label: 'באר שבע', value: 'beer_sheva' },
    { label: 'ראשון לציון', value: 'rishon_letzion' },
    { label: 'פתח תקווה', value: 'petah_tikva' },
    { label: 'אשדוד', value: 'ashdod' },
    { label: 'נתניה', value: 'netanya' },
    { label: 'חולון', value: 'holon' },
    { label: 'בני ברק', value: 'bnei_brak' }
  ];

  const validate = () => {
    const newErrors: typeof errors = { services: '', categories: '', location: '', availableFrom: '' };
    if (!servicesOffered.some(s => s.trim())) newErrors.services = 'At least one service is required';
    if (!categories.length || !categories[0]?.trim()) newErrors.categories = 'Category is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!availableFrom) newErrors.availableFrom = 'Available from date is required';
    setErrors(newErrors);
    const isValid = Object.values(newErrors).every(e => !e);
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
              onChange={e => handleItemChange(idx, e.target.value, setServicesOffered)}
              placeholder="e.g. CNC Machining"
              disabled={disabled}
            />
            <Button icon="pi pi-minus" onClick={() => handleRemoveItem(idx, setServicesOffered)} disabled={disabled} />
          </div>
        ))}
        <Button label="Add Service" icon="pi pi-plus" onClick={() => handleAddItem(setServicesOffered)} disabled={disabled} />
        {showErrors && errors.services && <div className="text-red-500 text-sm mt-1">{errors.services}</div>}
      </div>

      {/* Categories */}
      <div className="field mb-8 border border-gray-200 rounded-lg p-6">
        <label className="block text-900 font-semibold mb-3 text-lg">Categories</label>
        <Dropdown
          value={categories[0] || ''}
          onChange={(e: DropdownChangeEvent) => setCategories([e.value, ...categories.slice(1)])}
          options={categoryOptions}
          placeholder={categoriesLoading ? 'Loading...' : 'Select category'}
          disabled={disabled || categoriesLoading}
        />
        {categories.slice(1).map((cat, idx) => (
          <div key={idx + 1} className="flex items-center gap-2 mt-2">
            <Dropdown
              value={cat}
              onChange={(e: DropdownChangeEvent) => setCategories(categories.map((c, i) => i === idx + 1 ? e.value : c))}
              options={categoryOptions}
              disabled={disabled || categoriesLoading}
            />
            <Button icon="pi pi-minus" onClick={() => setCategories(categories.filter((_, i) => i !== idx + 1))} disabled={disabled} />
          </div>
        ))}
        <Button label="Add Category" icon="pi pi-plus" onClick={() => setCategories([...categories, ''])} disabled={disabled} />
        {showErrors && errors.categories && <div className="text-red-500 text-sm mt-1">{errors.categories}</div>}
      </div>

      {/* Location */}
      <div className="field mb-8 border border-gray-200 rounded-lg p-6">
        <label className="block text-900 font-semibold mb-3 text-lg">City</label>
        <Dropdown value={location} onChange={(e: DropdownChangeEvent) => setLocation(e.value)} options={mainCities} disabled={disabled} />
        {showErrors && errors.location && <div className="text-red-500 text-sm mt-1">{errors.location}</div>}
      </div>

      {/* Available From */}
      <div className="field mb-4 border border-gray-200 rounded-lg p-6">
        <label className="block text-900 font-semibold mb-3 text-lg">Available From</label>
        <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} disabled={disabled} className="w-full p-inputtext" />
        {showErrors && errors.availableFrom && <div className="text-red-500 text-sm mt-1">{errors.availableFrom}</div>}
      </div>
    </div>
  );
});

export default ManufacturerFields;
