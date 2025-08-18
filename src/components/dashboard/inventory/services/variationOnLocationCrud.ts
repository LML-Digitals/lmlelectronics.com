'use server';

import prisma from '@/lib/prisma';
import { format } from 'date-fns';

interface VariationOnLocationType {
  variationOnLocationId: number;
  variationId: string;
  locationId: number;
  stock: number;
  date: string;
  variationName: string;
  locationName: string;
  stockStatus: string;
  movement: string;
}

export const getVariationOnLocation = async (): Promise<
  VariationOnLocationType[]
> => {
  try {
    const VariationOnLocation = await prisma.variationOnLocation.findMany({
      include: {
        location: {
          select: {
            name: true,
          },
        },
        variation: {
          select: {
            name: true,
          },
        },
      },
    });

    const currentDate = new Date();

    return VariationOnLocation.map((item) => {
      const daysDifference
        = (currentDate.getTime() - new Date(item.date).getTime())
        / (1000 * 3600 * 24);
      const percentageDecrease
        = (((item.stock / 100) * daysDifference) / item.stock) * 100;

      let movement: string;

      if (percentageDecrease >= 20) {
        movement = 'fast';
      } else if (percentageDecrease >= 10) {
        movement = 'normal';
      } else {
        movement = 'slow';
      }

      return {
        variationOnLocationId: item.id,
        variationId: item.variationId,
        locationId: item.locationId,
        stock: item.stock,
        date: format(new Date(item.date), 'MMM do yyyy'),
        variationName: item.variation.name,
        locationName: item.location.name,
        stockStatus: item.stock < 4 ? 'Low in stock' : 'Normal',
        movement,
      };
    });
  } catch (error) {
    console.error('Error fetching VariationOnLocation:', error);
    throw new Error('Failed to fetch VariationOnLocation');
  }
};
export const updateVariationOnLocationStock = async (
  variationId: string,
  value: number,
) => {
  try {
    // Decrement the stock by 1
    return await prisma.variationOnLocation.updateMany({
      where: { variationId },
      data: {
        stock: { decrement: -value },
      },
    });
  } catch (error) {
    console.error('Error updating variation on location:', error);
    throw new Error('Failed to update variation on location');
  }
};
