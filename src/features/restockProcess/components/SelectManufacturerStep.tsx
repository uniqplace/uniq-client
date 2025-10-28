import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { useGetProductManufacturersHistoryQuery } from '../../marketplace/slices/productApiSlice';
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { Avatar } from 'primereact/avatar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import type { ProductManufacturer } from '../../../types';

interface SelectManufacturerStepProps {
    productId: string;
    onSelect: (manufacturer: ProductManufacturer) => void;
    onOpenBid: () => void;
}

const SelectManufacturerStep: React.FC<SelectManufacturerStepProps> = ({ productId, onSelect, onOpenBid }) => {
    const { data: manufacturers = [], isLoading, error } = useGetProductManufacturersHistoryQuery(productId);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [historyDialog, setHistoryDialog] = useState<{ open: boolean, purchases: any[] }>({ open: false, purchases: [] });

    if (isLoading) return <div className="flex justify-center items-center py-8"><ProgressSpinner /></div>;
    if (error) return <div className="flex justify-center py-4"><Message severity="error" text="Error loading manufacturers." /></div>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Select a Manufacturer</h2>
            {manufacturers.length === 0 && (
                <div className="mb-4">No suitable manufacturers found for this product.</div>
            )}
            <ListBox
                value={selectedId}
                options={manufacturers.map((m: ProductManufacturer) => {
                    const man = typeof m.manufacturerId === 'object' ? m.manufacturerId : { _id: m.manufacturerId, name: m.manufacturerId, location: '' };
                    // Get last purchase info
                    const lastPurchase = m.purchases && m.purchases.length > 0 ? m.purchases[m.purchases.length - 1] : null;
                    const totalUnits = m.purchases ? m.purchases.reduce((sum, p) => sum + (p.quantity || 0), 0) : 0;
                    return {
                        label: `${man.name} (${man.location})`,
                        value: man._id,
                        original: m,
                        lastPurchase,
                        review: lastPurchase?.review,
                        totalUnits,
                    };
                })}
                onChange={e => {
                    setSelectedId(e.value);
                    const selected = manufacturers.find((m: ProductManufacturer) => {
                        const man = typeof m.manufacturerId === 'object' ? m.manufacturerId : { _id: m.manufacturerId };
                        return man._id === e.value;
                    });
                    if (selected) {
                        onSelect(selected);
                    }
                }}
                optionLabel="label"
                className="mb-4 w-full"
                itemTemplate={option => {
                    const man = typeof option.original.manufacturerId === 'object' ? option.original.manufacturerId : { name: option.original.manufacturerId };
                    const avatarUrl = man.avatarUrl;
                    return (
                        <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between w-full gap-2">
                                <span className="flex items-center gap-3">
                                    {avatarUrl ? (
                                        <Avatar image={avatarUrl} shape="circle" size="large" />
                                    ) : (
                                        <Avatar icon="pi pi-user" shape="circle" size="large" />
                                    )}
                                    <span>{option.label}</span>
                                </span>
                                <span className="flex gap-2">
                                    <Button
                                        label="Chat"
                                        icon="pi pi-comments"
                                        className="p-button-sm p-button-info"
                                        onClick={e => {/* open chat logic here */ e.stopPropagation(); }}
                                    />
                                </span>
                            </div>
                            {/* Last order info */}
                            {option.lastPurchase && (
                                <div className="bg-blue-50 rounded-lg p-3 mt-2 flex flex-col md:flex-row md:items-center md:gap-6 gap-2 border border-blue-200">
                                    <div className="flex items-center gap-2 text-base text-blue-900 font-medium">
                                        <i className="pi pi-calendar"></i>
                                        <span>Last order: {new Date(option.lastPurchase.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-base text-green-800 font-medium">
                                        <i className="pi pi-dollar"></i>
                                        <span>Price: {option.lastPurchase.unitPrice}₪</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-base text-cyan-800 font-medium">
                                        <i className="pi pi-box"></i>
                                        <span>Total units: {option.totalUnits}</span>
                                    </div>
                                    {option.review && (
                                        <div className="flex items-center gap-2 text-base text-yellow-700 font-medium">
                                            <i className="pi pi-star"></i>
                                            <span>Review: "{option.review}"</span>
                                        </div>
                                    )}
                                    <div className="flex-1 flex justify-end">
                                        <Button
                                            label="Show History"
                                            icon="pi pi-history"
                                            className="p-button-outlined p-button-info p-button-md ml-2"
                                            onClick={ev => { ev.stopPropagation(); setHistoryDialog({ open: true, purchases: option.original.purchases }); }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }}
            />
            <Button
                label="Open Bid Request"
                icon="pi pi-plus"
                className="p-button-warning w-full"
                onClick={onOpenBid}
            />
            <Dialog
                header="Purchase History"
                visible={historyDialog.open}
                style={{ width: '400px' }}
                onHide={() => setHistoryDialog({ open: false, purchases: [] })}
                modal
            >
                <div className="space-y-2">
                    {historyDialog.purchases.length === 0 ? (
                        <div>No purchase history.</div>
                    ) : (
                        historyDialog.purchases.map((p, idx) => (
                            <div key={idx} className="border-b pb-2">
                                <div>Date: {new Date(p.date).toLocaleDateString()}</div>
                                <div>Quantity: {p.quantity}</div>
                                <div>Unit Price: {p.unitPrice}₪</div>
                                {p.review && <div>Review: "{p.review}"</div>}
                            </div>
                        ))
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default SelectManufacturerStep;
