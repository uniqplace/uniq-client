// Product utility functions for badge color classes

export type ProductStatus = 'active' | 'sold' | 'inactive';
export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
const DEFAULT = 'bg-gray-100 text-gray-800';
const statusColors: Record<ProductStatus, string> = {
  active: 'bg-green-100 text-green-800',
  sold: 'bg-red-100 text-red-800',
  inactive: DEFAULT,
};
const conditionColors: Record<ProductCondition, string> = {
  new: 'bg-blue-100 text-blue-800',
  like_new: 'bg-green-100 text-green-800',
  good: 'bg-yellow-100 text-yellow-800',
  fair: 'bg-orange-100 text-orange-800',
  poor: 'bg-red-100 text-red-800',
};
export function getStatusColor(status: ProductStatus): string {
  return statusColors[status] ?? DEFAULT;
}
export function getConditionColor(condition: ProductCondition): string {
  return conditionColors[condition] ?? DEFAULT;
}