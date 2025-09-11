// Utility for delivery label
import { getDayDifference } from './dateDiff';

export function getDeliveryLabel(date: Date): string {
  const diffDays = getDayDifference(new Date(), date);
  if (diffDays >= 1 && diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  } else if (diffDays >= 30 && diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months === 1 ? '' : 's'}`;
  } else {
    return date.toLocaleDateString('en-US');
  }
}
