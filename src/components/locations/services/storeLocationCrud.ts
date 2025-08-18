'use server';
import prisma from '@/lib/prisma';
import { StoreLocation } from '@prisma/client';
import { getStoreLocations as getStoreLocationsAction } from '@/app/actions/locations';

export async function getStoreLocations () {
  try {
    const result = await getStoreLocationsAction();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch store locations');
    }

    return result.locations || [];
  } catch (error) {
    console.error('Error fetching store locations:', error);
    throw error;
  }
}

export async function getStoreLocationBySlug (slug: string) {
  try {
    const location = await prisma.storeLocation.findUnique({
      where: { slug },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    return location;
  } catch (error) {
    console.error('Error fetching location:', error);
    throw new Error('Failed to fetch location');
  }
}

export async function createStoreLocation (data: Partial<StoreLocation>) {
  try {
    // Generate slug from name
    const slug = data.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingLocation = await prisma.storeLocation.findUnique({
      where: { slug },
    });

    if (existingLocation) {
      return { error: 'A location with this name already exists' };
    }

    // Omit the `id` field from the data object
    const { id, ...dataWithoutId } = data;

    // Extract JSON fields to parse them correctly
    const { hours, images, socialMedia, listings, availability, ...restData }
      = dataWithoutId;

    // Create location with properly parsed JSON fields
    const location = await prisma.storeLocation.create({
      data: {
        ...restData,
        slug,
        name: data.name!,
        address: data.address ?? '',
        streetAddress: data.streetAddress ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        zip: data.zip ?? '',
        countryCode: data.countryCode ?? 'US',
        phone: data.phone ?? '',
        email: data.email ?? '',
        hours: typeof hours === 'string' ? JSON.parse(hours) : hours,
        images: typeof images === 'string' ? JSON.parse(images) : images,
        socialMedia:
          typeof socialMedia === 'string'
            ? JSON.parse(socialMedia)
            : socialMedia,
        listings:
          typeof listings === 'string' ? JSON.parse(listings) : listings,
        availability:
          typeof availability === 'string'
            ? JSON.parse(availability)
            : availability,
      },
    });

    return { location };
  } catch (error) {
    console.error('Error creating location:', error);

    return { error: 'Failed to create location' };
  }
}

export async function updateStoreLocation (
  id: number,
  data: Partial<StoreLocation>,
) {
  try {
    // Generate new slug if name is changed
    let slug = data.slug;

    if (data.name) {
      const newSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (newSlug !== slug) {
        // Check if new slug already exists
        const existingLocation = await prisma.storeLocation.findUnique({
          where: { slug: newSlug },
        });

        if (existingLocation) {
          throw new Error('A location with this name already exists');
        }
        slug = newSlug;
      }
    }

    // Remove the id from data to avoid including it in the update
    const { id: _, ...restData } = data;

    // Extract JSON fields to parse them properly
    const { hours, socialMedia, listings, images, availability, ...otherData }
      = restData;

    // Update with properly parsed JSON fields
    const location = await prisma.storeLocation.update({
      where: { id },
      data: {
        ...otherData,
        slug,
        // Parse JSON fields correctly
        hours: typeof hours === 'string' ? JSON.parse(hours) : hours,
        socialMedia:
          typeof socialMedia === 'string'
            ? JSON.parse(socialMedia)
            : socialMedia,
        listings:
          typeof listings === 'string' ? JSON.parse(listings) : listings,
        images: typeof images === 'string' ? JSON.parse(images) : images,
        availability:
          typeof availability === 'string'
            ? JSON.parse(availability)
            : availability,
      },
    });

    return { location };
  } catch (error) {
    console.error('Error updating location:', error);
    throw new Error('Failed to update location');
  }
}

export async function deleteStoreLocation (id: number) {
  try {
    await prisma.storeLocation.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error('Error deleting store location:', error);
    throw error;
  }
}
