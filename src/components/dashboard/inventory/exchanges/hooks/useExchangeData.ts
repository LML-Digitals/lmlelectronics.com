'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getStaffs } from '@/components/dashboard/staff/services/staffCrud';
import { getCustomers } from '@/components/dashboard/customers/services/customerCrud';
import { getInventoryItems } from '@/components/dashboard/inventory/items/services/itemsCrud';
import { Customer, Staff, InventoryItem } from '@prisma/client';
import { InventoryItemWithRelations } from '../../items/types/ItemType';

// Define types for the data we'll fetch

export function useExchangeData () {
  // State for the fetched data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [inventoryItems, setInventoryItems] = useState<
    InventoryItemWithRelations[]
  >([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  // Fetch all necessary data
  useEffect(() => {
    async function fetchData () {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch customers
        const customersData = await getCustomers();
        // Fetch staff
        const staffData = await getStaffs();

        // Fetch inventory items
        const itemsData = await getInventoryItems();

        // Update state with fetched data
        setCustomers(customersData);
        setStaff(staffData);
        setInventoryItems(itemsData);
      } catch (err) {
        const errorMessage
          = err instanceof Error ? err.message : 'An unknown error occurred';

        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error loading data',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  return {
    customers,
    staff,
    inventoryItems,
    isLoading,
    error,
  };
}
