import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ManufacturerPreferences {
    categoryId: string | null;
    locationPreference: string | null;
    priceRange: { min: number; max: number };
    deliveryTimeframe: string;
    deliveryMethod: 'pickup' | 'shipping';
}

interface DeployState {
    productId: string | null;
    manufacturerPreferences: ManufacturerPreferences;
}

const initialState: DeployState = {
    productId: null,
    manufacturerPreferences: {
        categoryId: null,
        locationPreference: null,
        priceRange: { min: 0, max: 1000 }, // Default values
        deliveryTimeframe: '7 days',
        deliveryMethod: 'pickup',
    },
};

const deploySlice = createSlice({
    name: 'deploy',
    initialState,
    reducers: {
        setManufacturerPreferences(state, action: PayloadAction<ManufacturerPreferences>) {
            state.manufacturerPreferences = action.payload;
        },
        updatePriceRange(state, action: PayloadAction<{ min: number; max: number }>) {
            state.manufacturerPreferences.priceRange = action.payload;
        },
        setProductId(state, action: PayloadAction<string | null>) {
            state.productId = action.payload;
        },
        updateProductId(state, action: PayloadAction<string | null>) {
            state.productId = action.payload;
        }
    },
});

export const {
    setManufacturerPreferences,
    updatePriceRange,
    setProductId,
    updateProductId
} = deploySlice.actions;
export default deploySlice.reducer;
