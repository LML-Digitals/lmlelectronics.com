import { getReturnedItems } from '@/components/dashboard/inventory/returns/services/returnItemCrud';

export async function fetchReturnedItems() {
  try {
    const returnedItems = await getReturnedItems();
    return { returnedItems, error: null };
  } catch (err) {
    return { returnedItems: null, error: 'Check your internet connection.' };
  }
}
