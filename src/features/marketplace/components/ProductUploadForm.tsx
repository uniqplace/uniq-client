import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
import { TreeSelect } from 'primereact/treeselect';
import {
  useAddProductMutation
} from '../slices/marketplaceApiSlice';
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
  title: yup.string().required('Title is required').max(100),
  description: yup.string().required('Description is required').max(1000),
  category: yup.object().test(
    'at-least-one',
    'At least one category is required',
    (value) => value && Object.keys(value).length > 0
  ).required('Category is required'), price: yup.number().typeError('Price must be a number').required('Price is required').min(0, 'Price must be positive'),
  tags: yup.array().of(yup.string().defined()).required(),
  status: yup.string().oneOf(['active', 'sold', 'inactive']).required(),
  condition: yup.string().oneOf(['new', 'like_new', 'good', 'fair', 'poor']).required(),
  location: yup.string().required('Location is required'),
});

const ProductUploadForm: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [addProduct, { isLoading: isAddingProduct }] = useAddProductMutation();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { data: categoriesTree = [], isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesTreeQuery();

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
    if (images.length === 0) {
      setImageError('At least one image is required');
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else {
        formData.append(key, value);
      }
    });
    images.forEach((file) => formData.append('images', file));
    const selectedCategories = Object.keys(data.category || {});
    selectedCategories.forEach((catId) => formData.append('categories', catId));
    try {
      await addProduct(formData).unwrap();
      reset();
      setImages([]);
      setImageError(null);
      setUploadError(null);
    } catch (err) {
      console.error("Failed to upload product:", err);
      setUploadError('Failed to upload product. Please try again.');
    }
  };

  const handleUploadImage = useCallback((e: FileUploadHandlerEvent) => {
    const uploadedFiles = e.files as File[];
    setImages(uploadedFiles);
    if (uploadedFiles.length > 0) setImageError(null);
  }, []);
  function addSelectable(nodes: any[]): any[] {
    return nodes.map(node => ({
      ...node,
      selectable: true,
      children: node.children ? addSelectable(node.children) : undefined,
    }));
  }
  const renderError = (fieldName: keyof ProductFormData) =>
    errors[fieldName] ? <Message severity="error" text={errors[fieldName]?.message?.toString()} /> : null;

  if (categoriesLoading) {
    return (
      <Card title="Upload New Product" className="p-4 w-full md:w-1/1 mx-auto">
        <div>Loading categories...</div>
      </Card>
    );
  }

  if (categoriesError) {
    return (
      <Card title="Upload New Product" className="p-4 w-full md:w-1/1 mx-auto">
        <Message severity="error" text="Error loading categories" />
      </Card>
    );
  }

  return (
    <Card title="Upload New Product" className="p-4 w-full md:w-1/1 mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <InputText {...register('title')} placeholder="Title" className={errors.title ? 'p-invalid w-full' : 'w-full'} />
          {renderError('title')}
        </div>

        <div>
          <InputTextarea {...register('description')} placeholder="Description" rows={4} className={errors.description ? 'p-invalid w-full' : 'w-full'} />
          {renderError('description')}
        </div>

        <div>
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
            <Dropdown {...field} options={conditionOptions} placeholder="Condition" className={errors.condition ? 'p-invalid w-full' : 'w-full'} />
          )}
        />
        {renderError('condition')}

        <div>
          <InputText {...register('location')} placeholder="Location" className={errors.location ? 'p-invalid w-full' : 'w-full'} />
          {renderError('location')}
        </div>

        <Button type="submit" label="Submit Product" icon="pi pi-check" className="w-fit self-end" loading={isAddingProduct} />
        {uploadError && <Message severity="error" text={uploadError} />}
      </form>
    </Card>
  );
};

export default ProductUploadForm;
