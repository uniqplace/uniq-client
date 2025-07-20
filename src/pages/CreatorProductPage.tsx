import React, { useState } from 'react';
import { useGetUserProductsQuery } from '../features/marketplace/slices/marketplaceApiSlice';
import ProductUploadForm from '../features/marketplace/components/ProductUploadForm';
import { Button } from 'primereact/button';
import ProductCard from '../features/marketplace/components/ProductCard';
import { Dialog } from 'primereact/dialog';
import SearchBar from '../features/marketplace/components/SearchBar';
import type { Product } from '../types';

const CreatorProductPage: React.FC = () => {
    const [showUploadForm, setShowUploadForm] = useState(false);
    const { data: products, isLoading, error } = useGetUserProductsQuery();
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Creator's Products</h1>
                <Button
                    label="Add Product"
                    icon="pi pi-plus"
                    onClick={() => setShowUploadForm(true)}
                />

                <Dialog
                    header="Add Product"
                    visible={showUploadForm}
                    style={{ width: '50vw' }}
                    onHide={() => setShowUploadForm(false)}
                >
                    <ProductUploadForm />
                </Dialog>
            </div>
            <Dialog
                header="Edit Product"
                visible={!!editProduct}
                style={{ width: '50vw' }}
                onHide={() => setEditProduct(null)}
            >
                {editProduct && (
                    <ProductUploadForm
                        product={{ ...editProduct, images: editProduct.images || []}}
                        onSuccess={() => setEditProduct(null)}
                    />
                )}
            </Dialog>
            {showUploadForm && (
                <div className="mb-8">
                    <ProductUploadForm />
                    <Button
                        label="Close"
                        icon="pi pi-times"
                        className="mt-2"
                        onClick={() => setShowUploadForm(false)}
                    />
                </div>
            )}

            <div className="mb-4">
                <SearchBar />
            </div>

            {isLoading ? (
                <p>Loading products...</p>
            ) : error ? (
                <p>Error loading products</p>
            ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {products.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onUpdateMode={setEditProduct}
                        />
                    ))}
                </div>
            ) : (
                <p>No products found.</p>
            )}
        </div>
    );
};

export default CreatorProductPage;