'use server';

import prisma from '@/lib/prisma';
import { StoreLocation } from '@prisma/client';

export const getItemStoreLocations = async (): Promise<StoreLocation[]> => {
  try {
    return await prisma.storeLocation.findMany({
      where: {
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    throw new Error('Failed to fetch inventory ItemStorelocations');
  }
};

export const getItemStoreLocationsNames = async (): Promise<
  { name: string }[]
> => {
  try {
    return await prisma.storeLocation.findMany({
      where: {
        isActive: true,
      },
      select: { name: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching Storelocation names:', error);
    throw new Error('Failed to fetch Storelocation names');
  }
};

export const getItemStoreLocationById = async (StorelocationId: number) => {
  try {
    return await prisma.storeLocation.findUnique({
      where: { id: StorelocationId },
    });
  } catch (error) {
    throw new Error('Failed to fetch inventory ItemStorelocations');
  }
};
