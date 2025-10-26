import type { Product } from '../types';

export const getAiProducts = (products: Product[] | undefined): Product[] => {
  return products?.filter(
    (p: Product) => p.createdByAI === true || String(p.createdByAI) === 'true'
  ) || [];
};

export const getManualProducts = (products: Product[] | undefined): Product[] => {
  return products?.filter(
    (p: Product) => p.createdByAI === false || String(p.createdByAI) === 'false' || !p.createdByAI
  ) || [];
};