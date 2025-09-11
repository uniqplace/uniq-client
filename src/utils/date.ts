/**
 * Formats a delivery timeframe value as a date string in the given locale.
 * @param date string | Date
 * @param locale string (default: 'he-IL')
 * @returns formatted date string or '-'
 */
export function formatDeliveryTimeframe(date: string | Date | undefined, locale: string = 'he-IL'): string {
  if (!date) return '-';
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString(locale) : '-';
}
/**
 * Calculates a future date by adding the given number of days to today.
 * @param days Number of days to add
 * @returns Date object representing the estimated delivery date
 */
export function calculateDeliveryDate(days: number): Date {
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + days);
  return estimatedDate;
}

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString();
