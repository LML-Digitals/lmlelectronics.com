'use server';

import prisma from '@/lib/prisma';
import { toast } from '@/components/ui/use-toast';

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  location: string;
  stock: number;
  value: number;
}

export interface StockItemsResponse {
  success: boolean;
  data?: StockItem[];
  error?: string;
}

export async function getLowStockItems (threshold = 5): Promise<StockItemsResponse> {
  try {
    const lowStockItems = await prisma.inventoryStockLevel.findMany({
      where: {
        stock: {
          gte: 0,
          lte: threshold,
        },
        location: {
          isActive: true,
        },
      },
      include: {
        variation: {
          include: {
            inventoryItem: {
              include: {
                categories: true,
              },
            },
          },
        },
        location: true,
      },
      orderBy: {
        stock: 'asc',
      },
      take: 20, // Limit to 20 items
    });

    const formattedItems: StockItem[] = lowStockItems.map((level) => ({
      id: level.id,
      name: `${level.variation.inventoryItem?.name || 'Unknown Item'} - ${
        level.variation.name
      }`,
      sku: level.variation.sku,
      category:
        level.variation.inventoryItem?.categories[0]?.name || 'Uncategorized',
      location: level.location.name,
      stock: level.stock,
      value: level.stock * (level.purchaseCost || 0),
    }));

    return {
      success: true,
      data: formattedItems,
    };
  } catch (error) {
    console.error('Error fetching low stock items:', error);

    return {
      success: false,
      error: 'Failed to load low stock items',
    };
  }
}

export async function getOutOfStockItems (): Promise<StockItemsResponse> {
  try {
    const outOfStockItems = await prisma.inventoryStockLevel.findMany({
      where: {
        stock: 0,
        location: {
          isActive: true,
        },
      },
      include: {
        variation: {
          include: {
            inventoryItem: {
              include: {
                categories: true,
              },
            },
          },
        },
        location: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    });

    const formattedItems: StockItem[] = outOfStockItems.map((level) => ({
      id: level.id,
      name: `${level.variation.inventoryItem?.name || 'Unknown Item'} - ${
        level.variation.name
      }`,
      sku: level.variation.sku,
      category:
        level.variation.inventoryItem?.categories[0]?.name || 'Uncategorized',
      location: level.location.name,
      stock: 0,
      value: 0,
    }));

    return {
      success: true,
      data: formattedItems,
    };
  } catch (error) {
    console.error('Error fetching out of stock items:', error);

    return {
      success: false,
      error: 'Failed to load out of stock items',
    };
  }
}
