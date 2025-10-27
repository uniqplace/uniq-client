// Utility function to clear products in progress
import type { AppDispatch } from '../store';

export const clearProductsInProgress = (dispatch: AppDispatch) => {
  dispatch({ type: 'CLEAR_PRODUCTS_IN_PROGRESS' });
};