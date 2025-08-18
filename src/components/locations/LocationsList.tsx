'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreLocation } from '@prisma/client';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import { getStoreLocations } from './services/storeLocationCrud';

type DayHours = {
  open: string;
  close: string;
  isClosed: boolean;
};

export function isStoreOpen (hours: Record<string, DayHours>): boolean {
  if (!hours) { return false; }

  const now = new Date();
  const today = now
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();

  const todayHours = hours[today];

  if (!todayHours || todayHours.isClosed) { return false; }

  // Convert current time to minutes since midnight for easier comparison
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Convert store hours to minutes since midnight
  const [openHour, openMinute] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);
  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;

  // Handle cases where closing time is past midnight
  if (closeTimeInMinutes < openTimeInMinutes) {
    // Store closes after midnight
    if (currentTimeInMinutes >= openTimeInMinutes) {
      // Current time is after opening time on the same day
      return true;
    } else if (currentTimeInMinutes <= closeTimeInMinutes) {
      // Current time is before closing time on the next day
      return true;
    }

    return false;
  }

  // Normal case where closing time is on the same day
  return (
    currentTimeInMinutes >= openTimeInMinutes
    && currentTimeInMinutes <= closeTimeInMinutes
  );
}

export default function LocationsList () {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations () {
      try {
        const data = await getStoreLocations();

        console.log('Active locations loaded:', data.length);
        console.log('Location names:', data.map(loc => loc.name));
        setLocations(data);
      } catch (err) {
        setError('Failed to load locations. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  if (loading) { return <div className="text-center py-10">Loading locations...</div>; }
  if (error) { return <div className="text-center py-10 text-red-500">{error}</div>; }

  return (
    <div className="mt-20">
      <h2 className="text-3xl font-bold text-center mb-7">Our Locations</h2>
      <div className="flex justify-center px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full justify-items-center">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LocationCard ({ location }: { location: StoreLocation }) {
  return (
    <Link href={`/locations/${location.slug || location.id}`}>
      <div className="bg-white border border-secondary rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer flex flex-col items-center p-8 h-full">
        <div className="flex justify-center items-center mb-6 w-48 h-48 relative">
          <Image
            src={
              typeof location.images === 'string'
                ? JSON.parse(location.images)[0] || '/placeholder-store.jpg'
                : Array.isArray(location.images) && location.images.length > 0
                  ? location.images[0]
                  : '/placeholder-store.jpg'
            }
            alt={location.name}
            fill
            className="object-contain rounded-xl"
            style={{ position: 'absolute' }}
          />
        </div>
        <h2 className="text-lg font-bold text-center text-gray-800 mt-auto">
          {location.name}
        </h2>
      </div>
    </Link>
  );
}
