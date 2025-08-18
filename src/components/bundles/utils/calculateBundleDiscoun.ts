import type { CustomBundleRepairType } from '../types.ts/bundle';

export function calculateBundleDiscount (selectedRepairs: CustomBundleRepairType[]): number {
  const repairCount = selectedRepairs.length;

  if (repairCount >= 3) {
    return 0.25; // 25% discount for 3 or more repairs
  } else if (repairCount === 2) {
    return 0.15; // 15% discount for 2 repairs
  } else {
    return 0; // No discount for 1 or 0 repairs
  }
}
