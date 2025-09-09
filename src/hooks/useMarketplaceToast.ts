import { useEffect } from 'react';
import type { Toast } from 'primereact/toast';

export function useMarketplaceToast(productsData: any, isLoading: boolean, isFetching: boolean, toastRef: React.RefObject<Toast | null>) {
  useEffect(() => {
    if (!isFetching && !isLoading && productsData && productsData.message && productsData.success === false) {
      toastRef.current?.show({
        severity: 'info',
        summary: 'Note!',
        detail: productsData.message,
        life: 3000,
      });
    }
  }, [productsData, isLoading, isFetching, toastRef]);
}
