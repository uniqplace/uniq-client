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
import { defaultProductTemplate } from '../utils/defaultProductTemplate';

const useInitProduct = (): { loading: boolean; createNewProduct: () => Promise<void> } => {
    const dispatch = useAppDispatch();
    const userId = useAppSelector((state) => state.user?.id);
    const [loading, setLoading] = useState(false);
    const hasInitialized = useRef(false);
    const isManualCreateInProgress = useRef(false);


    // creating a hardcoded product
    const createNewProduct = async () => {
        if (!userId) return;
        setLoading(true);
        isManualCreateInProgress.current = true;
        const key = getUserProductKey(userId);
        try {
            localStorage.removeItem(key);
            localStorage.removeItem('currentStep');
            dispatch(clearStepper());
            dispatch({ type: 'stepper/setCompletedSteps', payload: Array(stepsConfig.length).fill(false) });

            const hardcodedProduct = { ...defaultProductTemplate };
            const newProduct = await dispatch(createProduct(hardcodedProduct)).unwrap();
            localStorage.setItem(key, newProduct._id);
            const index = stepsConfig.findIndex((s) => s.title === newProduct.CreationStatus);
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
                            const hardcodedProduct = { ...defaultProductTemplate };
                            const newProduct = await dispatch(createProduct(hardcodedProduct)).unwrap();
                            productId = newProduct._id;
                            localStorage.setItem(key, productId);
                            product = { CreationStatus: newProduct.CreationStatus, _id: newProduct._id };
                        } else {
                            throw err;
                        }
                    }
                }
                // 4. Ignore product if it is already completed
                if (product && product.CreationStatus === 'Complete Delivery') {
                    product = null;
                    productId = null;
                }
                // 5. Set step index from productStatus
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
