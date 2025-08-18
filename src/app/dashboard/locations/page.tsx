'use client';

import { useState, useEffect } from 'react';
import LocationsTable from '@/components/locations/LocationsTable';
import { StoreLocation } from '@prisma/client';
import { getStoreLocations } from '@/components/locations/services/storeLocationCrud';

export default function LocationsPage () {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getStoreLocations();

        setLocations(response);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Check your internet connection.');
      }
    };

    fetchLocations();
  }, []);

  return (
    <div>
      <div className="flex flex-col justify-center gap-4 sm:gap-6 lg:gap-8">
        {error ? (
          <p className="text-red-500 text-center text-sm sm:text-base">{error}</p>
        ) : (
          <LocationsTable locations={locations} />
        )}
      </div>
    </div>
  );
}
