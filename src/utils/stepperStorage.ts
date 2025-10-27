export const LOCAL_STORAGE_KEY = 'stepperProductsInProgress';

export function saveProductsInProgressToStorage(productsInProgress: Record<string, any>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(productsInProgress));
  } catch (e) {
    // Handle error silently
  }
}

export function loadProductsInProgressFromStorage(): Record<string, any> {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    // Handle error silently
  }
  return {};
}