import React, { useState, useEffect } from 'react';
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
import { useAddProductMutation, useUpdateProductMutation } from '../slices/marketplaceApiSlice';
import { useGetCategoriesTreeQuery } from '../slices/categoriesApiSlice';
import type { Product } from '../../../types';
import { useDeleteImagesMutation } from '../../../api/apiSlice';
import FilesUpload from '../../../components/shared/FilesUpload';

interface ProductFormData {
  title: string;
  description: string;
  categories: { [key: string]: true }; // TreeSelect value: object of selected subCategory ids
  price: number;
  tags: string[];
  status: 'draft' | 'published' | 'hidden';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  location: string;
}

interface ProductUploadFormProps {
  product?: Product;
  onClose?: () => void;
}

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Hidden', value: 'hidden' },
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
  categories: yup.object().test(
    'at-least-one',
    'At least one category is required',
    (value) => value && Object.keys(value).length > 0
  ).required(),
  price: yup.number().typeError('Price must be a number').required().min(0),
  tags: yup.array().of(yup.string().defined()).required(),
  status: yup.string().oneOf(['draft', 'published', 'hidden']).required(),
  condition: yup.string().oneOf(['new', 'like_new', 'good', 'fair', 'poor']).required(),
  location: yup.string().required(),
});

function getDefaultCategories(product?: Product): { [key: string]: true } {
  if (!product || !Array.isArray(product.subCategories)) return {};
  return Object.fromEntries(
    product.subCategories.map((cat: any) => [typeof cat === 'string' ? cat : cat._id, true])
  );
}


const ProductUploadForm: React.FC<ProductUploadFormProps> = ({ product, onClose }) => {
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images ?? []);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { data: categoriesTree, isLoading: loadingCategories, error: categoriesError } = useGetCategoriesTreeQuery();
  const [addProduct, { isLoading: isAdding }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteImages] = useDeleteImagesMutation();

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
          title: product.title,
          description: product.description,
          categories: getDefaultCategories(product),
          price: product.price,
          tags: product.tags,
          status: product.status,
          condition: product.condition,
          location: product.location,
        }
      : {
          title: '',
          description: '',
          categories: {},
          price: 0,
          tags: [],
          status: 'draft',
          condition: 'new',
          location: '',
        },
  });

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        description: product.description,
        categories: getDefaultCategories(product),
        price: product.price,
        tags: product.tags,
        status: product.status,
        condition: product.condition,
        location: product.location,
      });
      setImageUrls(product.images ?? []);
      setImages([]);
    }
  }, [product, categoriesTree, reset]);

  const handleRemoveImageUrl = async (url: string) => {
    try {
      await deleteImages([url]);
      setImageUrls((prev) => prev.filter((img) => img !== url));
    } catch {
      setImageError('Failed to delete image from server');
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (imageUrls.length === 0) {
      setImageError('You must upload at least one image');
      return;
    }

    try {
      const selectedCategories = Object.keys(data.categories || {});
      // Send all as subCategories objects
      const subCategories = selectedCategories.map(key => ({
        _id: key.replace(/^sub_/, ''),
        name: '',
        type: 'subCategory',
        category: '',
      }));

      // Build productData without categories
      const { categories, ...rest } = data;
      const productData = {
        ...rest,
        subCategories,
        images: imageUrls,
      };

      if (product) {
        await updateProduct({ _id: product._id, ...productData }).unwrap();
      } else {
        await addProduct(productData).unwrap();
      }

      reset();
      setImages([]);
      setImageUrls([]);
      setImageError(null);
      setUploadError(null);
      if (onClose) onClose();
    } catch {
      setUploadError('Failed to save product. Please try again.');
    }
  };

  const renderError = (fieldName: keyof ProductFormData) =>
    errors[fieldName] ? <Message severity="error" text={errors[fieldName]?.message?.toString()} /> : null;

  if (loadingCategories) {
    return <Card title={product ? "Edit Product" : "Upload New Product"}><div>Loading categories...</div></Card>;
  }

  if (categoriesError) {
    return <Card title={product ? "Edit Product" : "Upload New Product"}><Message severity="error" text="Error loading categories" /></Card>;
  }

  return (
    <Card title={product ? "Edit Product" : "Upload New Product"} className="p-4 w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <InputText {...register('title')} placeholder="Title" className={errors.title ? 'p-invalid w-full' : 'w-full'} />
        {renderError('title')}

        <InputTextarea {...register('description')} placeholder="Description" rows={4} className={errors.description ? 'p-invalid w-full' : 'w-full'} />
        {renderError('description')}

        <Controller
          name="categories"
          control={control}
          render={({ field }) => (
            <TreeSelect
              {...field}
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={categoriesTree}
              placeholder="Select Categories"
              className={errors.categories ? 'p-invalid w-full' : 'w-full'}
              filter
              selectionMode="checkbox"
              display="chip"
            />
          )}
        />
        {renderError('categories')}

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

        {imageUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {imageUrls.map((url, idx) => (
              <div key={url} style={{ position: 'relative' }}>
                <img src={url} alt={`product-img-${idx}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                <Button
                  type="button"
                  icon="pi pi-times"
                  className="p-button-rounded p-button-danger p-button-sm"
                  style={{ position: 'absolute', top: 2, right: 2 }}
                  onClick={() => handleRemoveImageUrl(url)}
                  tooltip="Remove"
                />
              </div>
            ))}
          </div>
        )}

        <FilesUpload
          files={images}
          setFiles={setImages}
          fileError={imageError}
          setFileError={setImageError}
          onUploaded={(urls) => setImageUrls((prev) => [...prev, ...urls])}
          fileUrls={imageUrls}
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

        <div className="flex gap-2 justify-end">
          <Button type="submit" label={product ? "Save Changes" : "Submit Product"} icon="pi pi-check" loading={isAdding || isUpdating} />
          {onClose && (
            <Button type="button" label="Cancel" icon="pi pi-times" className="p-button-secondary" onClick={onClose} />
          )}
        </div>
        {uploadError && <Message severity="error" text={uploadError} />}
      </form>
    </Card>
  );
};

export default ProductUploadForm;