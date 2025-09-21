import React, { useState } from 'react';
import { useGetUserProductsQuery } from '../features/marketplace/slices/productApiSlice';
import { useAppSelector } from '../hooks/hooks';
import ProductUploadForm from '../features/marketplace/components/ProductUploadForm';
import { Button } from 'primereact/button';
import ProductCard from '../features/marketplace/components/ProductCard';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';

const CreatorProductPage: React.FC = () => {
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const creatorId = useAppSelector(state => state.user?.id || state.user?.manufacturerId || '');
    const { data: products, isLoading, error } = useGetUserProductsQuery({
        creator: creatorId,
        category: '',
        subCategories: [],
        priceRange: [0, 1000],
        searchTerm: '',
    });

    const aiProducts = products?.filter(p => p.createdByAI) || [];
    const manualProducts = products?.filter(p => !p.createdByAI) || [];

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
                    closeIcon={<i className="pi pi-times" style={{ fontSize: '1.5rem' }} />}
                >
                    <ProductUploadForm />
                </Dialog>
            </div>
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
            <TabView activeIndex={activeTab} onTabChange={e => setActiveTab(e.index)}>
                <TabPanel header={<span style={{ opacity: activeTab === 0 ? 1 : 0.5 }}>Manually Uploaded Products</span>}>
                    {isLoading ? (
                        <p>Loading products...</p>
                    ) : error ? (
                        <p>Error loading products</p>
                    ) : manualProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {manualProducts.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    editable={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>No manually uploaded products found.</p>
                    )}
                </TabPanel>
                <TabPanel header={<span style={{ opacity: activeTab === 1 ? 1 : 0.5 }}>AI Generated Products</span>}>
                    {isLoading ? (
                        <p>Loading products...</p>
                    ) : error ? (
                        <p>Error loading products</p>
                    ) : aiProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {aiProducts.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    editable={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>No AI generated products found.</p>
                    )}
                </TabPanel>
            </TabView>
        </div>
    );
};

export default CreatorProductPage;