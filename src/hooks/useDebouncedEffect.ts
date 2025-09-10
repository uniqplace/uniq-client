import { useEffect, useRef } from 'react';

/**
 * Custom hook for debounced effect (delayed execution of a callback when dependencies change).
 * @param effect The effect callback to run
 * @param deps Dependency array
 * @param delay Delay in milliseconds
 */
export function useDebouncedEffect(effect: () => void | (() => void), deps: any[], delay: number) {
    const cleanupRef = useRef<void | (() => void)>(undefined);

    useEffect(() => {
        const handler = setTimeout(() => {
            cleanupRef.current = effect();
        }, delay);
        return () => {
            clearTimeout(handler);
            if (typeof cleanupRef.current === 'function') {
                cleanupRef.current();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, delay]);
}
