'use server';

import prisma from '@/lib/prisma';

export async function getInventoryVariations () {
  try {
    const variations = await prisma.inventoryVariation.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        sellingPrice: true,
        inventoryItemId: true,
      },
      where: {
        visible: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return variations;
  } catch (error) {
    console.error('Error fetching inventory variations:', error);

    return [];
  }
}
