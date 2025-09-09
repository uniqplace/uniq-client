import type { SubCategory } from '../types';

export function groupSubCategoriesByType(subCategories: SubCategory[]): { [type: string]: SubCategory[] } {
    return subCategories.reduce((acc, sub) => {
        if (!acc[sub.type]) acc[sub.type] = [];
        acc[sub.type].push(sub);
        return acc;
    }, {} as { [type: string]: SubCategory[] });
}
