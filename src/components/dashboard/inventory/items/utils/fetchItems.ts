import { getInventoryItems } from '@/components/dashboard/inventory/items/services/itemsCrud';
import { InventoryItemWithRelations } from '../types/ItemType';

interface FetchItemsResponse {
  items: InventoryItemWithRelations[];
  error: string | null;
}

export async function fetchItems () {
  try {
    const items = await getInventoryItems();

    return { items, error: null };
  } catch (err) {
    return {
      items: [],
      error: 'Check your internet connection.',
    };
  }
}
