import { useEffect, useRef, useState } from 'react';
import {
    createProduct,
    fetchProductByUserID,
    fetchProductStatus,
    setCurrentStepIndex,
    clearStepper,
} from '../features/deployProcess/slices/stepperSlice';
import { stepsConfig } from '../features/deployProcess/components/Stepper/steps';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { getUserProductKey } from '../utils/productStorageKey';

const useInitProduct = (): { loading: boolean; createNewProduct: () => Promise<void> } => {
    const dispatch = useAppDispatch();
    const userId = useAppSelector((state) => state.user?.id);
    const [loading, setLoading] = useState(false);
    const hasInitialized = useRef(false);
    // Flag to prevent useEffect from running after manual creation
    const isManualCreateInProgress = useRef(false);


    // Expose a function to create a new product (manual only)
    const createNewProduct = async () => {
        if (!userId) return;
        setLoading(true);
        isManualCreateInProgress.current = true;
        const key = getUserProductKey(userId);
        try {
            // 0. Clear previous product from Redux and localStorage
            console.log('[createNewProduct] Removing previous product from localStorage and Redux', { key });
            localStorage.removeItem(key);
            localStorage.removeItem('currentStep');
            dispatch(clearStepper());
            dispatch({ type: 'stepper/setCompletedSteps', payload: Array(stepsConfig.length).fill(false) });

            let product, productId, attempts = 0;
            do {
                console.log(`[createNewProduct] Attempt #${attempts + 1}: Creating new product...`);
                const newProduct = await dispatch(createProduct()).unwrap();
                productId = newProduct._id;
                console.log(`[createNewProduct] New product created`, { productId, newProduct });
                localStorage.setItem(key, productId);
                product = await dispatch(fetchProductStatus(productId)).unwrap();
                console.log(`[createNewProduct] Fetched product status`, { product });
                if (product.CreationStatus === 'Complete Delivery') {
                    console.warn(`[createNewProduct] Product returned as 'Complete Delivery', deleting...`, { productId });
                    try {
                        const deleteRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/create-product/${productId}`, {
                            method: 'DELETE',
                            credentials: 'include',
                        });
                        console.log(`[createNewProduct] Deleted completed product`, { productId, deleteRes });
                    } catch (e) {
                        console.warn('Failed to delete completed product', e);
                    }
                    localStorage.removeItem(key);
                }
                attempts++;
                if (attempts > 3) {
                    console.error('[createNewProduct] Too many attempts to create a fresh product, aborting.');
                    throw new Error('Failed to create a fresh product');
                }
            } while (product.CreationStatus === 'Complete Delivery');

            const index = stepsConfig.findIndex((s) => s.title === product.CreationStatus);
            console.log('[createNewProduct] Setting currentStepIndex', { index, CreationStatus: product.CreationStatus });
            dispatch(setCurrentStepIndex(index !== -1 ? index : 0));
        } catch (err) {
            console.error('Error creating new product:', err);
        } finally {
            setLoading(false);
            setTimeout(() => { isManualCreateInProgress.current = false; }, 500);
        }
    };

    useEffect(() => {
        if (!userId) {
            return;
        }
        if (hasInitialized.current) {
            return;
        }
        // Prevent useEffect from running if manual creation is in progress
        if (isManualCreateInProgress.current) {
            return;
        }
        let isMounted = true;
        const initializeProduct = async () => {
            hasInitialized.current = true;
            setLoading(true);
            const key = getUserProductKey(userId);
            try {
                let productId = localStorage.getItem(key);
                let product: { CreationStatus: string; _id?: string } | null = null;
                // 1. Try localStorage
                if (productId) {
                    try {
                        product = await dispatch(fetchProductStatus(productId)).unwrap();
                    } catch (err: any) {
                        if (
                            err?.status === 404 ||
                            (typeof err?.message === 'string' && err.message.includes('Product not found'))
                        ) {
                            localStorage.removeItem(key);
                            productId = null;
                        } else {
                            throw err;
                        }
                    }
                }
                // 2. If not in localStorage or invalid, try to fetch existing product for user from server
                if (!productId) {
                    try {
                        product = await dispatch(fetchProductByUserID(userId)).unwrap();
                        if (product && product._id) {
                            productId = product._id;
                            if (typeof productId === 'string') {
                                localStorage.setItem(key, productId);
                            }
                        }
                    } catch (err: any) {
                        // Improved 404 detection for all error shapes
                        console.error('fetchProductByUserID error:', err);
                        const is404 =
                            (typeof err === 'object' && err !== null && 'status' in err && err.status === 404) ||
                            (typeof err === 'string' && (err.includes('404') || err.includes('Product not found'))) ||
                            (typeof err?.message === 'string' && (err.message.includes('404') || err.message.includes('Product not found')));
                        if (is404) {
                            // If not found anywhere, create new product automatically
                            const newProduct = await dispatch(createProduct()).unwrap();
                            productId = newProduct._id;
                            localStorage.setItem(key, productId);
                            product = { CreationStatus: newProduct.CreationStatus, _id: newProduct._id };
                        } else {
                            throw err;
                        }
                    }
                }
                // Ignore product if it is already completed
                if (product && product.CreationStatus === 'Complete Delivery') {
                    product = null;
                    productId = null;
                }
                // 3. Set step index from productStatus
                if (product) {
                    if (!isMounted) {
                        setLoading(false);
                        return;
                    }
                    const index = stepsConfig.findIndex(
                        (s) => s.title === product.CreationStatus
                    );
                    dispatch(setCurrentStepIndex(index !== -1 ? index : 0));
                }
            } catch (err) {
                console.error('Error initializing product:', err);
            } finally {
                setLoading(false);
            }
        };
        initializeProduct();
        return () => {
            isMounted = false;
        };
    }, [dispatch, userId]);

    return { loading, createNewProduct };
};

export default useInitProduct;
