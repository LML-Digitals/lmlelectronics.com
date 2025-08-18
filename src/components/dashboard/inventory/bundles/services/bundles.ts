'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { fetchSession } from '@/lib/session';

// Validation schemas
const CreateBundleSchema = z.object({
  name: z.string().min(1, 'Bundle name is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  supplierId: z.number().optional(),
});

const BundleComponentSchema = z.object({
  componentVariationId: z.string(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  displayOrder: z.number().optional(),
  isHighlight: z.boolean().optional(),
});

const AddBundleComponentsSchema = z.object({
  bundleItemId: z.string(),
  components: z.array(BundleComponentSchema),
});

const CreateBundleVariationSchema = z.object({
  bundleItemId: z.string(),
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Variation name is required'),
  sellingPrice: z.number().min(0, 'Price must be positive'),
  image: z.string().optional(),
  components: z.array(BundleComponentSchema),
});

// Create a new bundle item
export async function createBundle (data: z.infer<typeof CreateBundleSchema>) {
  try {
    const validated = CreateBundleSchema.parse(data);

    const { categoryIds, supplierId, ...bundleData } = validated;

    const bundle = await prisma.inventoryItem.create({
      data: {
        ...bundleData,
        isBundle: true,
        categories: categoryIds
          ? {
            connect: categoryIds.map((id) => ({ id })),
          }
          : undefined,
        supplier: supplierId
          ? {
            connect: { id: supplierId },
          }
          : undefined,
      },
      include: {
        categories: true,
        supplier: true,
      },
    });

    revalidatePath('/dashboard/inventory');

    return { success: true, bundle };
  } catch (error) {
    console.error('Error creating bundle:', error);

    return { success: false, error: 'Failed to create bundle' };
  }
}

// Create a bundle variation with components
export async function createBundleVariation (data: z.infer<typeof CreateBundleVariationSchema>) {
  try {
    const validated = CreateBundleVariationSchema.parse(data);

    const result = await prisma.$transaction(async (tx) => {
      // Create the bundle variation
      const variation = await tx.inventoryVariation.create({
        data: {
          sku: validated.sku,
          name: validated.name,
          sellingPrice: validated.sellingPrice,
          image: validated.image,
          inventoryItemId: validated.bundleItemId,
        },
      });

      // Add components to the bundle
      if (validated.components.length > 0) {
        await tx.bundleComponent.createMany({
          data: validated.components.map((comp) => ({
            bundleItemId: validated.bundleItemId,
            componentVariationId: comp.componentVariationId,
            quantity: comp.quantity,
            displayOrder: comp.displayOrder || 0,
            isHighlight: comp.isHighlight || false,
          })),
        });
      }

      return variation;
    });

    revalidatePath('/dashboard/inventory');

    return { success: true, variation: result };
  } catch (error) {
    console.error('Error creating bundle variation:', error);

    return { success: false, error: 'Failed to create bundle variation' };
  }
}

// Add components to an existing bundle
export async function addBundleComponents (data: z.infer<typeof AddBundleComponentsSchema>) {
  try {
    const validated = AddBundleComponentsSchema.parse(data);

    await prisma.bundleComponent.createMany({
      data: validated.components.map((comp) => ({
        bundleItemId: validated.bundleItemId,
        componentVariationId: comp.componentVariationId,
        quantity: comp.quantity,
        displayOrder: comp.displayOrder || 0,
        isHighlight: comp.isHighlight || false,
      })),
    });

    revalidatePath('/dashboard/inventory');

    return { success: true };
  } catch (error) {
    console.error('Error adding bundle components:', error);

    return { success: false, error: 'Failed to add bundle components' };
  }
}

// Remove a component from a bundle
export async function removeBundleComponent (componentId: string) {
  try {
    await prisma.bundleComponent.delete({
      where: { id: componentId },
    });

    revalidatePath('/dashboard/inventory');

    return { success: true };
  } catch (error) {
    console.error('Error removing bundle component:', error);

    return { success: false, error: 'Failed to remove bundle component' };
  }
}

// Update bundle component quantity
export async function updateBundleComponent (
  componentId: string,
  quantity: number,
) {
  try {
    await prisma.bundleComponent.update({
      where: { id: componentId },
      data: { quantity },
    });

    revalidatePath('/dashboard/inventory');

    return { success: true };
  } catch (error) {
    console.error('Error updating bundle component:', error);

    return { success: false, error: 'Failed to update bundle component' };
  }
}

// Get bundle components with stock information
export async function getBundleComponents (bundleItemId: string) {
  try {
    const components = await prisma.bundleComponent.findMany({
      where: { bundleItemId },
      include: {
        componentVariation: {
          include: {
            inventoryItem: true,
            stockLevels: {
              include: {
                location: true,
              },
            },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return { success: true, components };
  } catch (error) {
    console.error('Error getting bundle components:', error);

    return { success: false, error: 'Failed to get bundle components' };
  }
}

// Calculate available stock for a bundle at a specific location
export async function getBundleStock (bundleItemId: string, locationId: number) {
  try {
    const components = await prisma.bundleComponent.findMany({
      where: { bundleItemId },
      include: {
        componentVariation: {
          include: {
            stockLevels: {
              where: { locationId },
            },
          },
        },
      },
    });

    if (components.length === 0) {
      return { success: true, availableStock: 0 };
    }

    // Calculate the maximum number of bundles that can be made
    let minAvailableStock = Infinity;

    for (const component of components) {
      const stockLevel = component.componentVariation.stockLevels[0];
      const availableStock = stockLevel ? stockLevel.stock : 0;
      const possibleBundles = Math.floor(availableStock / component.quantity);

      if (possibleBundles < minAvailableStock) {
        minAvailableStock = possibleBundles;
      }
    }

    const availableStock
      = minAvailableStock === Infinity ? 0 : minAvailableStock;

    return { success: true, availableStock };
  } catch (error) {
    console.error('Error calculating bundle stock:', error);

    return { success: false, error: 'Failed to calculate bundle stock' };
  }
}

// Calculate bundle stock across all locations
export async function getBundleStockAllLocations (bundleItemId: string) {
  try {
    const components = await prisma.bundleComponent.findMany({
      where: { bundleItemId },
      include: {
        componentVariation: {
          include: {
            stockLevels: {
              include: {
                location: true,
              },
            },
          },
        },
      },
    });

    if (components.length === 0) {
      return { success: true, stockByLocation: [] };
    }

    // Get all locations that have stock for any component
    const locationMap = new Map<
      number,
      { locationId: number; locationName: string; availableStock: number }
    >();

    // Initialize locations
    for (const component of components) {
      for (const stockLevel of component.componentVariation.stockLevels) {
        if (!locationMap.has(stockLevel.locationId)) {
          locationMap.set(stockLevel.locationId, {
            locationId: stockLevel.locationId,
            locationName: stockLevel.location.name,
            availableStock: Infinity,
          });
        }
      }
    }

    // Calculate minimum stock for each location
    for (const [locationId, locationData] of locationMap) {
      for (const component of components) {
        const stockLevel = component.componentVariation.stockLevels.find((sl) => sl.locationId === locationId);
        const availableStock = stockLevel ? stockLevel.stock : 0;
        const possibleBundles = Math.floor(availableStock / component.quantity);

        if (possibleBundles < locationData.availableStock) {
          locationData.availableStock = possibleBundles;
        }
      }

      // If no stock available, set to 0
      if (locationData.availableStock === Infinity) {
        locationData.availableStock = 0;
      }
    }

    const stockByLocation = Array.from(locationMap.values());

    return { success: true, stockByLocation };
  } catch (error) {
    console.error('Error calculating bundle stock for all locations:', error);

    return { success: false, error: 'Failed to calculate bundle stock' };
  }
}

// Deduct bundle stock when order is completed
export async function deductBundleStock (
  bundleVariationId: string,
  quantity: number,
  locationId: number,
) {
  try {
    const bundleVariation = await prisma.inventoryVariation.findUnique({
      where: { id: bundleVariationId },
      include: {
        inventoryItem: true,
      },
    });

    if (!bundleVariation?.inventoryItem?.isBundle) {
      throw new Error('Item is not a bundle');
    }

    const components = await prisma.bundleComponent.findMany({
      where: { bundleItemId: bundleVariation.inventoryItemId! },
      include: {
        componentVariation: {
          include: {
            stockLevels: {
              where: { locationId },
            },
          },
        },
      },
    });

    // Check if we have enough stock for all components
    for (const component of components) {
      const stockLevel = component.componentVariation.stockLevels[0];
      const availableStock = stockLevel ? stockLevel.stock : 0;
      const requiredStock = component.quantity * quantity;

      if (availableStock < requiredStock) {
        throw new Error(`Insufficient stock for component ${component.componentVariation.name}`);
      }
    }

    // Deduct stock for each component
    await prisma.$transaction(async (tx) => {
      for (const component of components) {
        const stockLevel = component.componentVariation.stockLevels[0];
        const requiredStock = component.quantity * quantity;

        if (stockLevel) {
          await tx.inventoryStockLevel.update({
            where: { id: stockLevel.id },
            data: { stock: stockLevel.stock - requiredStock },
          });
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deducting bundle stock:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deduct bundle stock',
    };
  }
}

// Helper function to get system admin for automated adjustments
async function getSystemAdmin () {
  const systemAdmin = await prisma.staff.findFirst({
    where: {
      role: 'admin',
      isActive: true,
    },
    orderBy: {
      createdAt: 'asc', // Get the oldest admin (likely the system admin)
    },
  });

  if (!systemAdmin) {
    throw new Error('No system admin found for automated adjustments');
  }

  return systemAdmin;
}

// Deduct bundle stock using inventory item ID (for cart items)
export async function deductBundleStockByItemId (
  bundleItemId: string,
  quantity: number,
  orderId?: string,
  fromOrder?: boolean,
) {
  let userId: string;

  if (fromOrder) {
    const systemAdmin = await getSystemAdmin();

    userId = systemAdmin.id;
  } else {
    const session = await fetchSession();

    if (!session || session?.user?.userType !== 'staff') {
      throw new Error('User not authenticated');
    }
    userId = session.user.id;
  }

  try {
    // Verify this is actually a bundle
    const bundleItem = await prisma.inventoryItem.findUnique({
      where: { id: bundleItemId },
    });

    if (!bundleItem?.isBundle) {
      throw new Error('Item is not a bundle');
    }

    // Get all components and their stock levels across all locations
    const components = await prisma.bundleComponent.findMany({
      where: { bundleItemId },
      include: {
        componentVariation: {
          include: {
            inventoryItem: true,
            stockLevels: {
              include: { location: true },
            },
          },
        },
      },
    });

    // Check if we have enough stock for all components (across all locations)
    for (const component of components) {
      const totalAvailable = component.componentVariation.stockLevels.reduce(
        (sum, sl) => sum + (sl.stock || 0),
        0,
      );
      const requiredStock = component.quantity * quantity;

      if (totalAvailable < requiredStock) {
        throw new Error(`Insufficient stock for component ${component.componentVariation.name}`);
      }
    }

    // Deduct stock for each component from any location(s) with available stock
    await prisma.$transaction(async (tx) => {
      for (const component of components) {
        let remainingToDeduct = component.quantity * quantity;
        // Sort locations by stock descending (optional, for efficiency)
        const stockLevels = [...component.componentVariation.stockLevels].sort((a, b) => (b.stock || 0) - (a.stock || 0));

        for (const stockLevel of stockLevels) {
          if (remainingToDeduct <= 0) { break; }
          const deduct = Math.min(stockLevel.stock, remainingToDeduct);
          const stockBefore = stockLevel.stock;
          const stockAfter = stockBefore - deduct;

          if (deduct > 0) {
            // Update stock level
            await tx.inventoryStockLevel.update({
              where: { id: stockLevel.id },
              data: { stock: stockAfter },
            });

            // Create inventory adjustment record
            const reason = orderId
              ? `Bundle sale - Bundle: ${bundleItem.name} (${quantity} units) - Order ID: ${orderId}`
              : `Bundle sale - Bundle: ${bundleItem.name} (${quantity} units)`;

            await tx.inventoryAdjustment.create({
              data: {
                inventoryItemId: component.componentVariation.inventoryItemId!,
                inventoryVariationId: component.componentVariation.id,
                locationId: stockLevel.locationId,
                changeAmount: -deduct, // Negative for deduction
                reason: reason,
                stockBefore: stockBefore,
                stockAfter: stockAfter,
                adjustedById: userId,
                approvedById: userId, // Auto-approved by same user
                approved: true,
              },
            });

            remainingToDeduct -= deduct;
          }
        }
        if (remainingToDeduct > 0) {
          throw new Error(`Unexpected error: not enough stock deducted for component ${component.componentVariation.name}`);
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deducting bundle stock by item ID:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to deduct bundle stock',
    };
  }
}

// Get all bundles with their stock information
export async function getBundles (locationId?: number) {
  try {
    const bundles = await prisma.inventoryItem.findMany({
      where: { isBundle: true },
      include: {
        variations: {
          include: {
            stockLevels: locationId
              ? {
                where: { locationId },
              }
              : true,
          },
        },
        bundleComponents: {
          include: {
            componentVariation: {
              include: {
                inventoryItem: true,
                stockLevels: locationId
                  ? {
                    where: { locationId },
                  }
                  : true,
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
        categories: true,
        supplier: true,
      },
    });

    // Calculate stock for each bundle with fresh data
    const bundlesWithStock = await Promise.all(bundles.map(async (bundle) => {
      // Always get fresh stock calculation
      const stockData = locationId
        ? await getBundleStock(bundle.id, locationId)
        : await getBundleStockAllLocations(bundle.id);

      return {
        ...bundle,
        calculatedStock: stockData.success
          ? locationId
            ? 'availableStock' in stockData
              ? stockData.availableStock
              : 0
            : 'stockByLocation' in stockData
              ? stockData.stockByLocation
              : []
          : 0,
      };
    }));

    return { success: true, bundles: bundlesWithStock };
  } catch (error) {
    console.error('Error getting bundles:', error);

    return { success: false, error: 'Failed to get bundles' };
  }
}

// Calculate stock for a specific bundle dynamically
export async function calculateBundleStockDynamic (
  bundleId: string,
  locationId?: number,
) {
  try {
    const stockData = locationId
      ? await getBundleStock(bundleId, locationId)
      : await getBundleStockAllLocations(bundleId);

    if (!stockData.success) {
      return { success: false, error: 'Failed to calculate stock' };
    }

    return {
      success: true,
      stock: locationId
        ? 'availableStock' in stockData
          ? stockData.availableStock
          : 0
        : 'stockByLocation' in stockData
          ? stockData.stockByLocation
          : [],
    };
  } catch (error) {
    console.error('Error calculating bundle stock dynamically:', error);

    return { success: false, error: 'Failed to calculate bundle stock' };
  }
}

// Refresh all bundle stocks
export async function refreshBundleStocks (locationId?: number) {
  try {
    const bundles = await prisma.inventoryItem.findMany({
      where: { isBundle: true },
      select: { id: true },
    });

    const stockResults = await Promise.all(bundles.map(async (bundle) => {
      const stockData = await calculateBundleStockDynamic(
        bundle.id,
        locationId,
      );

      return {
        bundleId: bundle.id,
        stock: stockData.success ? stockData.stock : 0,
      };
    }));

    return { success: true, stocks: stockResults };
  } catch (error) {
    console.error('Error refreshing bundle stocks:', error);

    return { success: false, error: 'Failed to refresh bundle stocks' };
  }
}

// Get a single bundle with detailed information
export async function getBundleDetails (bundleId: string) {
  try {
    const bundle = await prisma.inventoryItem.findUnique({
      where: { id: bundleId, isBundle: true },
      include: {
        variations: {
          include: {
            stockLevels: {
              include: {
                location: true,
              },
            },
          },
        },
        bundleComponents: {
          include: {
            componentVariation: {
              include: {
                inventoryItem: true,
                stockLevels: {
                  include: {
                    location: true,
                  },
                },
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
        categories: true,
        supplier: true,
      },
    });

    if (!bundle) {
      return { success: false, error: 'Bundle not found' };
    }

    const stockByLocation = await getBundleStockAllLocations(bundle.id);

    return {
      success: true,
      bundle: {
        ...bundle,
        calculatedStock: stockByLocation.success
          ? stockByLocation.stockByLocation
          : [],
      },
    };
  } catch (error) {
    console.error('Error getting bundle details:', error);

    return { success: false, error: 'Failed to get bundle details' };
  }
}

// Get bundle by ID - alias for getBundleDetails for component compatibility
export async function getBundleById (bundleId: string) {
  return getBundleDetails(bundleId);
}

// Delete a bundle and all its components
export async function deleteBundle (bundleId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // First check if bundle exists and is actually a bundle
      const bundle = await tx.inventoryItem.findUnique({
        where: { id: bundleId, isBundle: true },
        include: {
          variations: true,
          bundleComponents: true,
        },
      });

      if (!bundle) {
        throw new Error('Bundle not found');
      }

      // Delete bundle components first
      await tx.bundleComponent.deleteMany({
        where: { bundleItemId: bundleId },
      });

      // Delete bundle variations and their stock levels
      for (const variation of bundle.variations) {
        await tx.inventoryStockLevel.deleteMany({
          where: { variationId: variation.id },
        });

        await tx.inventoryVariation.delete({
          where: { id: variation.id },
        });
      }

      // Finally delete the bundle item itself
      await tx.inventoryItem.delete({
        where: { id: bundleId },
      });

      return bundle;
    });

    revalidatePath('/dashboard/inventory/bundles');

    return { success: true, bundle: result };
  } catch (error) {
    console.error('Error deleting bundle:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete bundle',
    };
  }
}

// Update bundle information
export async function updateBundle (
  bundleId: string,
  data: {
    name?: string;
    description?: string;
    image?: string;
  },
) {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) { updateData.name = data.name.trim(); }
    if (data.description !== undefined) { updateData.description = data.description.trim() || null; }
    if (data.image !== undefined) { updateData.image = data.image.trim() || null; }

    await prisma.inventoryItem.update({
      where: {
        id: bundleId,
        isBundle: true,
      },
      data: updateData,
    });

    revalidatePath('/dashboard/inventory/bundles');
    revalidatePath(`/dashboard/inventory/bundles/${bundleId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating bundle:', error);

    return { success: false, error: 'Failed to update bundle' };
  }
}
