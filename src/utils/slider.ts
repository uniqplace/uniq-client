import { getDayDifference } from './dateDiff';
/**
 * Returns the slider index for a given delivery date, based on deliveryOptions and getDayDifference.
 * @param deliveryOptions Array of delivery options (with .value as days)
 * @param deliveryTimeframe Date to compare
 * @returns Index in deliveryOptions array
 */
export function getSliderValue(deliveryOptions: { value: number }[], deliveryTimeframe: Date): number {
  // getDayDifference should be imported from utils/dateDiff
  // For now, assume deliveryTimeframe is a valid Date
  const today = new Date();
  const diffDays = getDayDifference(today, deliveryTimeframe);
  const idx = deliveryOptions.findIndex(opt => opt.value === diffDays);
  return idx >= 0 ? idx : 6; // default to 7 days if not found
}
