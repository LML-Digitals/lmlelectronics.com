import { getInventoryTransfers } from '@/components/dashboard/inventory/transfers/services/internalTransfersCrud';

export async function fetchInternalTransfers() {
  try {
    const transfers = await getInventoryTransfers();
    return { transfers, error: null };
  } catch (err) {
    return { transfers: [], error: 'Check your internet connection.' };
  }
}
