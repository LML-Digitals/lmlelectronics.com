'use server';

import prisma from '@/lib/prisma';

export type LocationLink = {
  id: string;
  name: string;
  slug: string;
};

/**
 * Fetches active store locations for the footer links
 */
export async function getActiveLocations(): Promise<LocationLink[]> {
  try {
    const locations = await prisma.storeLocation.findMany({
      where: {
        isActive: true,
        slug: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return locations.map((location) => ({
      id: String(location.id),
      name: location.name,
      slug: location.slug as string,
    }));
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}
