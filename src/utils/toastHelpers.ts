import { Toast } from 'primereact/toast';
import type { RefObject } from 'react';

export function showErrorToast(toastRef: RefObject<Toast | null>, detail: string, summary: string = 'Error', life: number = 4000) {
  toastRef.current?.show({
    severity: 'error',
    summary,
    detail,
    life,
  });
}

export function showSuccessToast(toastRef: RefObject<Toast | null>, detail: string, summary: string = 'Success', life: number = 4000) {
  toastRef.current?.show({
    severity: 'success',
    summary,
    detail,
    life,
  });
}
