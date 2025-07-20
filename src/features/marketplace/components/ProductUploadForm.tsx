import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TreeSelect } from 'primereact/treeselect';
// PrimeReact Components
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Chips } from 'primereact/chips';
import { FileUpload, type FileUploadHandlerEvent } from 'primereact/fileupload';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';

// API Hooks
import { useAddProductMutation, useUpdateProductMutation } from '../slices/marketplaceApiSlice';

// Interfaces
interface ProductFormData {
  title: string;
  description: string;
  price: number;
  categories: { [key: string]: boolean }; tags: string[];
  status: 'active' | 'sold' | 'inactive';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  location: string;
}

interface ProductUploadFormProps {
  product?: Partial<ProductFormData> & { _id?: string; images?: string[] };
  onSuccess?: () => void;
}

// Static Options
const categoriesTree = [
  {
    key: 'art',
    label: 'Art',
    children: [
      { key: 'art_painting', label: 'Painting' },
      { key: 'art_sculpture', label: 'Sculpture' },
      { key: 'art_photography', label: 'Photography' },
    ],
  },
  {
    key: 'jewelry',
    label: 'Jewelry',
    children: [
      { key: 'jewelry_necklaces', label: 'Necklaces' },
      { key: 'jewelry_rings', label: 'Rings' },
      { key: 'jewelry_bracelets', label: 'Bracelets' },
    ],
  },
  // ...המשך כמו בדוגמה שלך
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Sold', value: 'sold' },
  { label: 'Inactive', value: 'inactive' },
];

const conditionOptions = [
  { label: 'New', value: 'new' },
  { label: 'Like New', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
  { label: 'Poor', value: 'poor' },
];

// Validation Schema
const schema: yup.ObjectSchema<ProductFormData> = yup.object().shape({
  title: yup.string().required('Title is required').max(100),
  description: yup.string().required('Description is required').max(1000),
  categories: yup
    .object()
    .test(
      'at-least-one',
      'At least one category is required',
      (value) => value && Object.keys(value).length > 0
    )
    .required('At least one category is required'),
      price: yup
    .number()
    .typeError('Price must be a number')
    .required('Price is required')
    .min(0, 'Price must be at least 0'),
  tags: yup.array().of(yup.string().defined()).required(),
  status: yup.string().oneOf(['active', 'sold', 'inactive']).required(),
  condition: yup.string().oneOf(['new', 'like_new', 'good', 'fair', 'poor']).required(),
  location: yup.string().required('Location is required'),
});


// Component
const ProductUploadForm: React.FC<ProductUploadFormProps> = ({ product, onSuccess }) => {
  const isEdit = !!product;
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [addProduct, { isLoading }] = useAddProductMutation();
  React.useEffect(() => {
  if (isEdit && product?.images) {
    console.log('Existing images:', product.images);
    if (Array.isArray(product.images)) {
      setExistingImages(product.images);
    } else if (typeof product.images === 'string') {
      setExistingImages([product.images]);
    } else {
      setExistingImages([]);
    }
  }
}, [isEdit, product]);
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: yupResolver(schema),
    defaultValues: product
      ? {
        ...product,
        tags: product.tags || [],
        status: product.status || 'active',
        condition: product.condition || 'new',
        location: product.location || '',
        categories: {}

      }
      : {
        title: '',
        description: '',
        categories: {},
        price: 0,
        tags: [],
        status: 'active',
        condition: 'new',
        location: '',
      },
  });
console.log("existingImages", existingImages);

  const onSubmit = async (data: ProductFormData) => {
    debugger
    if (!isEdit && images.length === 0 || (isEdit && images.length === 0 && existingImages.length === 0)) {
      setImageError('At least one image is required');
      return;
    }

    try {
      if (isEdit && product?._id) {
        if (images.length > 0) {
          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((v) => formData.append(key, String(v)));
            } else if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });
          existingImages.forEach((url) => formData.append('existingImages', url));
          images.forEach((file) => formData.append('images', file));
          console.log('FormData:', Array.from(formData.entries()));
          await updateProduct(formData).unwrap();
        } else {
          await updateProduct({
            ...data,
            _id: product._id,
            images: images,
          }).unwrap();
        }
      } else {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
          } else {
            formData.append(key, value);
          }
        });
        images.forEach((file) => formData.append('images', file));
        await addProduct(formData).unwrap();
      }
      reset();
      setImages([]);
      setImageError(null);
      setUploadError(null);
      onSuccess?.();
    } catch {
      setUploadError('Failed to upload product. Please try again.');
    }
  };

  const handleUploadImage = useCallback((e: FileUploadHandlerEvent) => {
    const uploadedFiles = e.files as File[];
    setImages(uploadedFiles);
    if (uploadedFiles.length > 0) setImageError(null);
  }, []);

  const renderError = (fieldName: keyof ProductFormData) =>
    errors[fieldName] ? <Message severity="error" text={errors[fieldName]?.message?.toString()} /> : null;

  return (
    <Card title={isEdit ? 'Edit Product' : 'Upload New Product'} className="p-4 w-full md:w-1/1 mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <InputText {...register('title')} placeholder="Title" className={errors.title ? 'p-invalid w-full' : 'w-full'} />
          {renderError('title')}
        </div>

        <div>
          <InputTextarea
            {...register('description')}
            placeholder="Description"
            rows={4}
            className={errors.description ? 'p-invalid w-full' : 'w-full'}
          />
          {renderError('description')}
        </div>

        <div>
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <TreeSelect
                {...field}
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                options={categoriesTree}
                placeholder="Select categories"
                selectionMode="checkbox"
                className={errors.categories ? 'p-invalid w-full' : 'w-full'}
                display="chip"
                filter
              />
            )}
          />
          {renderError('categories')}
        </div>

        <div>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <InputNumber
                value={field.value}
                onValueChange={(e) => field.onChange(e.value)}
                placeholder="Price"
                mode="currency"
                currency="USD"
                locale="en-US"
                className={errors.price ? 'p-invalid w-full' : 'w-full'}
              />
            )}
          />
          {renderError('price')}
        </div>

        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <Chips value={field.value} onChange={(e) => field.onChange(e.value)} placeholder="Tags" />
          )}
        />
        {isEdit && existingImages.length > 0 && (
          <div>
            <label className="block font-semibold mb-1">Existing Images:</label>
            <div className="flex gap-2 flex-wrap">
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt={`product-img-${idx}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={() => {
                      setExistingImages((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <FileUpload
            name="images"
            customUpload
            multiple
            auto={false}
            uploadHandler={handleUploadImage}
            accept="image/*"
            maxFileSize={5_000_000}
            emptyTemplate={<p className="m-0">Drag and drop images here.</p>}
          />
          {imageError && <Message severity="error" text={imageError} />}
        </div>
        <Controller
          name="status"
          control={control}
          render={({ field }) => <SelectButton {...field} options={statusOptions} />}
        />

        <Controller
          name="condition"
          control={control}
          render={({ field }) => (
            <Dropdown
              {...field}
              options={conditionOptions}
              placeholder="Condition"
              className={errors.condition ? 'p-invalid w-full' : 'w-full'}
            />
          )}
        />
        {renderError('condition')}

        <div>
          <InputText {...register('location')} placeholder="Location" className={errors.location ? 'p-invalid w-full' : 'w-full'} />
          {renderError('location')}
        </div>

        <Button
          type="submit"
          label={isEdit ? 'Update Product' : 'Add Product'}
          icon="pi pi-check"
          className="w-fit self-end"
          loading={isEdit ? isUpdating : isLoading}
        />

        {uploadError && <Message severity="error" text={uploadError} />}
      </form>
    </Card>
  );
};

export default ProductUploadForm;
