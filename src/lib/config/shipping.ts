
import {
  calculateShippingCost,
} from '@/components/dashboard/shipping/services/shippingService';

export async function calculateShipping (state: string): Promise<number> {
  try {
    const data = await calculateShippingCost(state);

    if (data.success) {
      return data.shippingCost ?? 0;
    }

    throw new Error(data.error ?? 'Failed to get shipping rate');
  } catch (error) {
    console.error('Error calculating shipping:', error);
    throw error;
  }
}
