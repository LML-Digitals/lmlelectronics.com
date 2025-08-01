'use client';

import { getCategories, getSuppliers, getTags } from '../services/itemsCrud';
import { getItemStoreLocations } from '@/components/dashboard/inventory/location/services/itemLocationCrud';
import { useEffect, useState } from 'react';

type CategoryWithChildren = {
  id: string;
  name: string;
  children: CategoryWithChildren[];
};

// Helper function to ensure children property exists
function normalizeCategoryData(categories: any[]): CategoryWithChildren[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    children: category.children ? normalizeCategoryData(category.children) : [],
  }));
}

export function useInventoryData() {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>(
    []
  );
  const [locations, setLocations] = useState<{ id: number; name: string }[]>(
    []
  );
  const [tags, setTags] = useState<{ id: string; name: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const results = await Promise.all([
          getCategories(),
          getSuppliers(),
          getItemStoreLocations(),
          getTags(),
        ]);

        if (!isMounted) return;

        const [categoriesData, suppliersData, locationsData, tagsData] =
          results;

        setCategories(normalizeCategoryData(categoriesData || []));
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
        setLocations(Array.isArray(locationsData) ? locationsData : []);
        setTags(Array.isArray(tagsData) ? tagsData : []);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching inventory data:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to fetch data'
        );
        setCategories([]);
        setSuppliers([]);
        setLocations([]);
        setTags([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    categories,
    suppliers,
    locations,
    tags,
    isLoading,
    error,
  };
}
