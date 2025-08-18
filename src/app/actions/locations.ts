'use server';

import prisma from '@/lib/prisma';
import { StoreLocation } from '@prisma/client';

export type LocationsResult = {
  success: boolean;
  locations?: StoreLocation[];
  message?: string;
};

export async function getStoreLocations (): Promise<LocationsResult> {
  try {
    const locations = await prisma.storeLocation.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      locations,
    };
  } catch (error) {
    console.error('Error fetching locations:', error);

    return {
      success: false,
      message: 'Failed to fetch locations',
    };
  }
}
