'use client';

import ItemsTable from '@/components/dashboard/inventory/items/ItemsTable';
import { getInventoryItems } from '@/components/dashboard/inventory/items/services/itemsCrud';
import { useEffect, useState, useTransition, useCallback } from 'react';
import { InventoryItemWithRelations } from '@/components/dashboard/inventory/items/types/ItemType';
import { Button } from '@/components/ui/button';

export default function Items () {
  const [items, setItems] = useState<InventoryItemWithRelations[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadItems = async () => {
    try {
      const data = await getInventoryItems();

      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div>
      <div>
        {error ? (
          <div className="text-center p-4">
            <p className="text-red-500">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                loadItems();
              }}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : (
          <ItemsTable items={items} onRefresh={loadItems} />
        )}
      </div>
    </div>
  );
}
