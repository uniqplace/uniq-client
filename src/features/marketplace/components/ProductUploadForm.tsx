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
import { useAddProductMutation } from '../slices/marketplaceApiSlice';

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  tags: string[];
  customizationOptions?: string;
  status: 'active' | 'sold' | 'inactive';
}

const categories = [
  { label: 'Art', value: 'art' },
  { label: 'Jewelry', value: 'jewelry' },
  { label: 'Home Decor', value: 'home_decor' },
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Sold', value: 'sold' },
  { label: 'Inactive', value: 'inactive' },
];

const schema: yup.ObjectSchema<ProductFormData> = yup.object().shape({
  name: yup.string().required('Name is required').max(100),
  description: yup.string().required('Description is required').max(1000),
  category: yup.string().required('Category is required'),
  price: yup.number().typeError('Price must be a number').required('Price is required').min(0, 'Price must be positive'),
  tags: yup.array().of(yup.string().defined()).required(),
  customizationOptions: yup.string().optional(),
  status: yup.string().oneOf(['active', 'sold', 'inactive']).required(),
});

const ProductUploadForm: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [addProduct, { isLoading }] = useAddProductMutation();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: 0,
      tags: [],
      customizationOptions: '',
      status: 'active',
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

    try {
      await addProduct(formData).unwrap();
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
    <Card title="Upload New Product" className="p-4 w-full md:w-1/1 mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <InputText {...register('name')} placeholder="Name" className={errors.name ? 'p-invalid w-full' : 'w-full'} />
          {renderError('name')}
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
              <Dropdown {...field} options={categories} placeholder="Select Category" className={errors.category ? 'p-invalid w-full' : 'w-full'} />
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
          name="customizationOptions"
          control={control}
          render={({ field }) => (
            <InputTextarea {...field} rows={2} placeholder="Customization Options (Optional)" className="w-full" />
          )}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => <SelectButton {...field} options={statusOptions} />}
        />

        <Button type="submit" label="Submit Product" icon="pi pi-check" className="w-fit self-end" loading={isLoading} />
        {uploadError && <Message severity="error" text={uploadError} />}
      </form>
    </Card>
  );
};

export default ProductUploadForm;
