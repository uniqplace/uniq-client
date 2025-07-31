import { useEffect, useRef, useState } from 'react';
import {
    createProduct,
    fetchProductByUserID,
    fetchProductStatus,
    setCurrentStepIndex,
} from '../features/deployProcess/slices/stepperSlice';
import { stepsConfig } from '../features/deployProcess/components/Stepper/steps';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { getUserProductKey } from '../utils/productStorageKey';

const useInitProduct = (): { loading: boolean } => {
    const dispatch = useAppDispatch();
    const userId = useAppSelector((state) => state.user?.id);
    console.log('userId from Redux:', userId);
    const [loading, setLoading] = useState(false);
    const hasInitialized = useRef(false);



    // // Reset hasInitialized when userId changes (e.g., after logout/login)
    // useEffect(() => {
    //     hasInitialized.current = false;
    // }, [userId]);

    useEffect(() => {
        console.log('[useInitProduct] useEffect triggered', { userId });

        if (!userId) {
            console.log('User ID is not set yet');
            return;
        }

        if (hasInitialized.current) {
            console.log('[useInitProduct] Already initialized, skipping');
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
                    console.log('Found productId in localStorage:', productId);
                    try {
                        product = await dispatch(fetchProductStatus(productId)).unwrap();
                    } catch (err: any) {
                        // If not found in server, remove from localStorage and continue
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
                    console.log('No productId found in localStorage, fetching by userId:', userId);
                    try {
                        // Fetch product by userId (returns full product object or throws 404/null if none)
                        product = await dispatch(fetchProductByUserID(userId)).unwrap();
                        if (product && product._id) {
                            // Use the open product from server
                            productId = product._id;
                            if (typeof productId === 'string') {
                                localStorage.setItem(key, productId);
                            }
                        }
                    } catch (err: any) {
                        // If not found, create new product
                        if (

                            err?.status === 404 ||
                            (typeof err?.message === 'string' && err.includes('Product not found') || err.includes('404'))
                        ) {
                            console.log('No open product found, creating new product');
                            const newProduct = await dispatch(createProduct()).unwrap();
                            productId = newProduct._id;
                            localStorage.setItem(key, productId);
                            product = { CreationStatus: newProduct.CreationStatus, _id: newProduct._id };
                        } else {
                            throw err;
                        }
                    }
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

    return { loading };
};

export default useInitProduct;
