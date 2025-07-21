// ===================
// features/marketplace/ProductUploadForm.tsx
// ===================
import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Chips } from 'primereact/chips';
import { SelectButton } from 'primereact/selectbutton';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { TreeSelect } from 'primereact/treeselect';
import ImageUpload from '../../../components/shared/ImageUpload';
import { useAddProductMutation } from '../slices/marketplaceApiSlice';
import { useGetCategoriesTreeQuery } from '../slices/categoriesApiSlice';

interface ProductFormData {
  title: string;
  description: string;
  category: Record<string, any>;
  price: number;
  tags: string[];
  status: 'active' | 'sold' | 'inactive';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  location: string;
}

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

const schema: yup.ObjectSchema<ProductFormData> = yup.object().shape({
  title: yup.string().required().max(100),
  description: yup.string().required().max(1000),
  category: yup.object().test(
    'at-least-one',
    'At least one category is required',
    (value) => value && Object.keys(value).length > 0
  ).required(),
  price: yup.number().typeError('Price must be a number').required().min(0),
  tags: yup.array().of(yup.string().defined()).required(),
  status: yup.string().oneOf(['active', 'sold', 'inactive']).required(),
  condition: yup.string().oneOf(['new', 'like_new', 'good', 'fair', 'poor']).required(),
  location: yup.string().required(),
});

const ProductUploadForm: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [addProduct, { isLoading }] = useAddProductMutation();
  const { data: categoriesTree = [], isLoading: loadingCategories, error: categoriesError } = useGetCategoriesTreeQuery();

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: {},
      price: 0,
      tags: [],
      status: 'active',
      condition: 'new',
      location: '',
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    
    const selectedCategoryKey = Object.keys(data.category || {})[0] || '';
    if (imageUrls.length === 0) {
      setImageError('You must upload images before submitting the product');
      return;
    }

    try {
      const selectedCategories = Object.keys(data.category || {});
      const onlyUrls = imageUrls.filter(url => typeof url === 'string' && url.startsWith('http'));
      const productData = {
        ...data,
        category: selectedCategoryKey,
        images: onlyUrls,
        categories: selectedCategories,
      };
      await addProduct(productData).unwrap();
      reset();
      setImages([]);
      setImageUrls([]);
      setImageError(null);
      setUploadError(null);
    } catch {
      setUploadError('Failed to upload product. Please try again.');
    }
  };

  const renderError = (fieldName: keyof ProductFormData) =>
    errors[fieldName] ? <Message severity="error" text={errors[fieldName]?.message?.toString()} /> : null;

  function addSelectable(nodes: any[]): any[] {
    return nodes.map(node => ({
      ...node,
      selectable: true,
      children: node.children ? addSelectable(node.children) : undefined,
    }));
  }

  if (loadingCategories) {
    return <Card title="Upload New Product"><div>Loading categories...</div></Card>;
  }

  if (categoriesError) {
    return <Card title="Upload New Product"><Message severity="error" text="Error loading categories" /></Card>;
  }

  return (
    <Card title="Upload New Product" className="p-4 w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <InputText {...register('title')} placeholder="Title" className={errors.title ? 'p-invalid w-full' : 'w-full'} />
        {renderError('title')}

        <InputTextarea {...register('description')} placeholder="Description" rows={4} className={errors.description ? 'p-invalid w-full' : 'w-full'} />
        {renderError('description')}

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <TreeSelect
              {...field}
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={addSelectable(categoriesTree)}
              placeholder="Select Category"
              className={errors.category ? 'p-invalid w-full' : 'w-full'}
              filter
              selectionMode="checkbox"
              display="chip"
            />
          )}
        />
        {renderError('category')}

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

        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <Chips value={field.value} onChange={(e) => field.onChange(e.value)} placeholder="Tags" />
          )}
        />

        <ImageUpload
          images={images}
          setImages={setImages}
          imageError={imageError}
          setImageError={setImageError}
          onUploaded={setImageUrls}
          imageUrls={imageUrls}
        />

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

        <InputText {...register('location')} placeholder="Location" className={errors.location ? 'p-invalid w-full' : 'w-full'} />
        {renderError('location')}

        <Button type="submit" label="Submit Product" icon="pi pi-check" className="w-fit self-end" loading={isLoading} />
        {uploadError && <Message severity="error" text={uploadError} />}
      </form>
    </Card>
  );
};

export default ProductUploadForm;
