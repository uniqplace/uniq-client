// Utility to calculate day difference between two dates (normalized to midnight)
export function getDayDifference(from: Date, to: Date): number {
  const fromNormalized = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toNormalized = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.ceil((toNormalized.getTime() - fromNormalized.getTime()) / (1000 * 60 * 60 * 24));
}
