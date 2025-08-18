'use server';

import prisma from '@/lib/prisma';

export async function findItemByBarcode (barcode: string) {
  try {
    const variation = await prisma.inventoryVariation.findFirst({
      where: {
        OR: [{ sku: barcode }, { barcode: barcode }],
      },
      include: {
        inventoryItem: {
          include: {
            categories: true,
            supplier: true,
            tags: true,
            variations: {
              include: {
                stockLevels: {
                  include: {
                    location: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return variation?.inventoryItem || null;
  } catch (error) {
    console.error('Error finding item by barcode:', error);
    throw new Error('Failed to find item by barcode');
  }
}

// Generate a unique barcode for a new variation
export async function generateUniqueBarcode () {
  // Generate a barcode with format: LML + timestamp + 3 random digits
  const timestamp = Date.now().toString().slice(-10);
  const randomDigits = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  const barcode = `LML${timestamp}${randomDigits}`;

  // Make sure it's unique
  const existing = await prisma.inventoryVariation.findUnique({
    where: { barcode },
  });

  if (existing) {
    // If collision (very unlikely), try again
    return generateUniqueBarcode();
  }

  return barcode;
}

// Update a variation with a new barcode
export async function updateVariationBarcode (
  variationId: string,
  barcode?: string,
) {
  try {
    // If no barcode provided, generate one
    const finalBarcode = barcode || (await generateUniqueBarcode());

    await prisma.inventoryVariation.update({
      where: { id: variationId },
      data: { barcode: finalBarcode },
    });

    return finalBarcode;
  } catch (error) {
    console.error('Error updating variation barcode:', error);
    throw new Error('Failed to update variation barcode');
  }
}
