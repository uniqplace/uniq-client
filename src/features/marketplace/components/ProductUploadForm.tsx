import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  status: 'active'|'sold'|'inactive';
}

interface Option {
  label: string;
  value: string;
}

const categories: Option[] = [
  { label: 'Art', value: 'art' },
  { label: 'Jewelry', value: 'jewelry' },
  { label: 'Home Decor', value: 'home_decor' },
];

const statusOptions: Option[] = [
  { label: 'Active', value: 'active' },
  { label: 'Sold', value: 'Sold' },
  { label: 'Inactive', value: 'inactive' },
];

const ProductUploadForm: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [addProduct] = useAddProductMutation();

  const {control,register,handleSubmit,formState: { errors },} = useForm<ProductFormData>({
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
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('category', data.category);
  formData.append('price', String(data.price));
  data.tags.forEach(tag => formData.append('tags', tag));
  if (data.customizationOptions) formData.append('customizationOptions', data.customizationOptions);
  formData.append('status', data.status);
  images.forEach((file) => formData.append('images', file));

  try {
    await addProduct(formData).unwrap();
  } catch (error) {
    setImageError('Failed to upload product. Please try again.');
  }
};

  const handleUploadImage = (e: FileUploadHandlerEvent) => {
    const uploadedFiles = e.files as File[];
    setImages(uploadedFiles);
    if (uploadedFiles.length > 0) setImageError(null);
  };

  return (
    <Card title="Upload New Product" className="p-4 w-full md:w-1/1 mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <InputText
            {...register('name', { required: 'Name is required', maxLength: 100 })}
            placeholder="Name"
            className={errors.name ? 'p-invalid w-full' : 'w-full'}
          />
          {errors.name && <Message severity="error" text={errors.name.message} />}
        </div>

        <div>
          <InputTextarea
            {...register('description', { required: 'Description is required', maxLength: 1000 })}
            placeholder="Description"
            rows={4}
            className={errors.description ? 'p-invalid w-full' : 'w-full'}
          />
          {errors.description && <Message severity="error" text={errors.description.message} />}
        </div>

        <div>
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <Dropdown
                {...field}
                options={categories}
                placeholder="Select Category"
                className={errors.category ? 'p-invalid w-full' : 'w-full'}
              />
            )}
          />
          {errors.category && <Message severity="error" text={errors.category.message} />}
        </div>

        <div>
          <Controller
            name="price"
            control={control}
            rules={{ required: 'Price is required', min: { value: 0, message: 'Price must be positive' } }}
            render={({ field }) => (
              <InputNumber
                {...field}
                placeholder="Price"
                mode="currency"
                currency="USD"
                locale="en-US"
                className={errors.price ? 'p-invalid w-full' : 'w-full'}
              />
            )}
          />
          {errors.price && <Message severity="error" text={errors.price.message} />}
        </div>

        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <Chips
              value={field.value}
              onChange={e => field.onChange(e.value)}
              placeholder="Tags"
            />
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
            <InputTextarea
              {...field}
              rows={2}
              placeholder="Customization Options (Optional)"
              className="w-full"
            />
          )}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <SelectButton
              {...field}
              options={statusOptions}
            />
          )}
        />

        <Button type="submit" label="Submit Product" icon="pi pi-check" className="w-fit self-end" />
      </form>
    </Card>
  );
};

export default ProductUploadForm;
