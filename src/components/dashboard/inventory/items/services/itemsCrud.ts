'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { fetchSession } from '@/lib/session';
import { VariationUpdateInput } from '../types/types';
import { Prisma } from '@prisma/client';
import {
  getDefaultShippingRate,
  getDefaultTaxRate,
} from '@/components/dashboard/settings/services/inventorySettings';

// Define type for Variation data within CreateItemInput
export type VariationInput = {
  id?: string; // Optional ID for existing variations
  name: string;
  sku: string;
  image?: string | null;
  raw?: number;
  tax?: number;
  shipping?: number;
  markup?: number;
  visible?: boolean;
  useDefaultRates?: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  stockLevels: {
    locationId: number;
    stock: number;
    purchaseCost?: number;
  }[];
};

type CreateItemInput = {
  name: string;
  description?: string;
  image: string | null;
  categoryIds: string[];
  supplierId?: number | null;
  warrantyTypeId?: string | null;
  variations?: VariationInput[]; // Use the defined type
  tagIds?: string[]; // Changed from tags to tagIds
};

type InventoryAdjustment = {
  inventoryItemId: string;
  inventoryVariationId: string;
  locationId: number;
  changeAmount: number;
  reason: string;
  stockBefore: number;
  stockAfter: number;
  adjustedById: string;
  approvedById: string;
  approved: boolean;
};

// Create Item
export async function createInventoryItem (data: CreateItemInput) {
  try {
    // console.log("Creating item with data:", data); // Debug log

    // Fetch default rates once for all variations
    const defaultShippingRate = await getDefaultShippingRate();
    const defaultTaxRate = await getDefaultTaxRate();

    // Process variations to calculate derived values
    const processedVariations = await Promise.all(data.variations?.map(async (variation) => {
      const raw = variation.raw || 0;

      // Fix how useDefaultRates is determined
      const useDefaultRates
          = variation.useDefaultRates === true
          || variation.useDefaultRates === undefined;

      // Properly handle tax and shipping when not using default rates
      // If useDefaultRates is false, use the provided tax/shipping values even if they're 0
      const tax = useDefaultRates
        ? defaultTaxRate
        : variation.tax !== undefined
          ? variation.tax
          : 0;
      const shipping = useDefaultRates
        ? defaultShippingRate
        : variation.shipping !== undefined
          ? variation.shipping
          : 0;

      const markup = variation.markup || 0.3;

      // Calculate derived values
      const cost = raw + raw * (tax / 100) + shipping;
      const totalCost = cost + cost * (markup / 100);
      const profit = totalCost - cost;
      const sellingPrice = totalCost;

      return {
        name: variation.name,
        sku: variation.sku,
        image: variation.image || undefined,
        raw: raw,
        tax: tax,
        shipping: shipping,
        markup: markup,
        totalCost: totalCost,
        profit: profit,
        sellingPrice: sellingPrice,
        visible: variation.visible !== false, // Default to true if not specified
        useDefaultRates: useDefaultRates,
        weight: variation.weight,
        length: variation.length,
        width: variation.width,
        height: variation.height,
        stockLevels: {
          create: variation.stockLevels.map((level) => ({
            locationId: level.locationId,
            stock: level.stock,
            purchaseCost: level.purchaseCost,
          })),
        },
      };
    }) || []);

    // Create the item data with optional warrantyTypeId
    const itemData: Prisma.InventoryItemCreateInput = {
      name: data.name,
      description: data.description,
      image: data.image || undefined,
      categories: {
        connect: data.categoryIds.map((id) => ({ id })),
      },
      variations: {
        create: processedVariations,
      },
    };

    // Only add tags if tagIds is provided and not empty
    if (data.tagIds && data.tagIds.length > 0) {
      itemData.tags = {
        connect: data.tagIds.map((id) => ({ id })),
      };
    }

    // Add supplier connection if supplierId is provided
    if (data.supplierId) {
      (itemData as any).supplier = {
        connect: { id: data.supplierId },
      };
    }

    // Add warrantyType connection if warrantyTypeId is provided
    if (data.warrantyTypeId) {
      (itemData as any).warrantyType = {
        connect: { id: data.warrantyTypeId },
      };
    }

    const item = await prisma.inventoryItem.create({
      data: itemData,
      include: {
        categories: true,
        supplier: true,
        warrantyType: true, // Include warranty type in the response
        variations: {
          include: {
            stockLevels: {
              include: {
                location: true,
              },
            },
          },
        },
        tags: true,
      },
    });

    // console.log("Created item:", item);
    revalidatePath('/dashboard/inventory/items');

    return { status: 'success', item };
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error; // Throw the actual error for better debugging
  }
}

export async function updateInventoryItem (id: string, data: CreateItemInput) {
  const session = await fetchSession();

  if (!session) {
    throw new Error('User not authenticated');
  }
  const user = session;

  try {
    // Fetch default rates once for all variations
    const defaultShippingRate = await getDefaultShippingRate();
    const defaultTaxRate = await getDefaultTaxRate();

    const foundItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        variations: {
          include: {
            stockLevels: true,
          },
        },
      },
    });

    if (!foundItem) {
      throw new Error('Item not found');
    }

    const incomingVariations = data.variations || [];
    const existingVariations = foundItem.variations;

    const incomingVariationIds = new Set(incomingVariations.map((v) => v.id).filter((id): id is string => !!id));
    const existingVariationIds = new Set(existingVariations.map((v) => v.id));

    const variationsToDelete = existingVariations
      .filter((v) => !incomingVariationIds.has(v.id))
      .map((v) => v.id);

    const variationsToUpdate = incomingVariations.filter((v): v is VariationInput & { id: string } => !!v.id && existingVariationIds.has(v.id));

    const variationsToCreate = incomingVariations.filter((v): v is VariationInput => !v.id);

    // Track stock adjustments - needs refinement based on CUD operations
    // This simple calculation might not be accurate anymore, needs adjustment
    // Example: calculate based on final state vs initial state
    const adjustmentsToCreate: InventoryAdjustment[] = []; // Placeholder - recalculate later if needed

    // --- Start Transaction ---
    // const updatedItem = await prisma.$transaction(async (tx) => { // Remove this line
    // 1. Delete variations
    if (variationsToDelete.length > 0) {
      // Ensure related stock levels are also deleted (cascade delete should handle this if schema is set up)
      // Explicitly delete adjustments related to deleted variations first
      // Replace tx with prisma
      await prisma.inventoryAdjustment.deleteMany({
        where: { inventoryVariationId: { in: variationsToDelete } },
      });
      // Replace tx with prisma
      await prisma.inventoryVariation.deleteMany({
        where: { id: { in: variationsToDelete } },
      });
    }

    // 2. Update existing variations
    for (const variation of variationsToUpdate) {
      const { stockLevels, ...variationData } = variation;
      const existingVariation = existingVariations.find((v) => v.id === variation.id)!; // Should exist based on filter

      // Check if using default rates
      const useDefaultRates = variationData.useDefaultRates !== false; // Default to true if not specified

      // Calculate derived values
      const raw = variationData.raw ?? 0;
      const tax = useDefaultRates ? defaultTaxRate : variationData.tax ?? 0;
      const shipping = useDefaultRates
        ? defaultShippingRate
        : variationData.shipping ?? 0;
      const markup = variationData.markup ?? 0.3;

      const priceFieldsChanged
        = existingVariation.raw !== raw
        || existingVariation.tax !== tax
        || existingVariation.shipping !== shipping
        || existingVariation.useDefaultRates !== useDefaultRates; // Also check if default rates toggle changed

      const cost = raw + raw * (tax / 100) + shipping;
      const totalCost = cost + cost * (markup / 100);
      const profit = totalCost - cost;
      const sellingPrice = totalCost;

      // Replace tx with prisma
      const updatedVariation = await prisma.inventoryVariation.update({
        where: { id: variation.id },
        data: {
          ...variationData,
          raw,
          tax: variationData.tax ?? existingVariation.tax,
          shipping: variationData.shipping ?? existingVariation.shipping,
          markup,
          totalCost,
          profit,
          sellingPrice,
          visible: variation.visible !== false,
          useDefaultRates,
          weight: variationData.weight,
          length: variationData.length,
          width: variationData.width,
          height: variationData.height,
          stockLevels: {
            upsert: stockLevels.map((level) => ({
              where: {
                variationId_locationId: {
                  variationId: variation.id, // ID is guaranteed here
                  locationId: level.locationId,
                },
              },
              create: {
                locationId: level.locationId,
                stock: level.stock,
                purchaseCost: level.purchaseCost,
              },
              update: {
                stock: level.stock,
                purchaseCost: level.purchaseCost,
              },
            })),
          },
        },
      });

      // --- Recalculate linked RepairOption prices if needed ---
      if (priceFieldsChanged) {
        try {
          const linkedRepairOptions = await prisma.repairOption.findMany({
            where: { variationId: variation.id },
            select: { id: true }, // Only need the ID
          });

          if (linkedRepairOptions.length > 0) {
            for (const repairOption of linkedRepairOptions) {
              // try {
              //   await recalculateAndUpdateRepairOptionPrice(
              //     repairOption.id,
              //     variation.id
              //   );
              // } catch (recalcError) {
              //   console.error(
              //     `Failed to recalculate price for RepairOption ${repairOption.id}:`,
              //     recalcError
              //   );
              //   // Decide if you want to throw, continue, or collect errors
              // }
            }
          }
        } catch (error) {
          console.error(
            `Error finding/recalculating RepairOptions for variation ${variation.id} during item update:`,
            error,
          );
        }
      }
      // --- End Recalculation ---

      // Simplified Adjustment Tracking (Example - needs careful implementation)
      for (const level of stockLevels) {
        const existingLevel = existingVariation.stockLevels.find((sl) => sl.locationId === level.locationId);
        const stockBefore = existingLevel?.stock ?? 0;
        const stockAfter = level.stock;
        const change = stockAfter - stockBefore;

        if (change !== 0) {
          //  adjustmentsToCreate.push({ /* ... adjustment data ... */ }); // Defer adjustment creation
        }
      }
    }

    // 3. Create new variations
    for (const variation of variationsToCreate) {
      const { stockLevels, ...variationData } = variation;

      // Check if using default rates
      const useDefaultRates = variationData.useDefaultRates !== false; // Default to true if not specified

      // Calculate derived values
      const raw = variationData.raw ?? 0;
      const tax = useDefaultRates ? defaultTaxRate : variationData.tax ?? 0;
      const shipping = useDefaultRates
        ? defaultShippingRate
        : variationData.shipping ?? 0;
      const markup = variationData.markup ?? 0.3;

      const cost = raw + raw * (tax / 100) + shipping;
      const totalCost = cost + cost * (markup / 100);
      const profit = totalCost - cost;
      const sellingPrice = totalCost;

      // Replace tx with prisma
      const createdVar = await prisma.inventoryVariation.create({
        data: {
          inventoryItemId: id,
          ...variationData,
          raw,
          tax: tax,
          shipping: shipping,
          markup,
          totalCost,
          profit,
          sellingPrice,
          visible: variation.visible !== false,
          useDefaultRates,
          weight: variationData.weight,
          length: variationData.length,
          width: variationData.width,
          height: variationData.height,
          stockLevels: {
            create: stockLevels.map((level) => ({
              locationId: level.locationId,
              stock: level.stock,
              purchaseCost: level.purchaseCost,
            })),
          },
        },
        include: { stockLevels: true }, // Include to potentially create initial adjustments
      });

      // Simplified Adjustment Tracking for new variations
      for (const level of createdVar.stockLevels) {
        if (level.stock > 0) {
          // adjustmentsToCreate.push({ /* ... adjustment data ... */ }); // Defer adjustment creation
        }
      }
    }

    // 4. Update the main item data (excluding variations)
    const coreUpdateData: Prisma.InventoryItemUpdateInput = {
      name: data.name,
      description: data.description,
      image: data.image, // Already handled potential upload before transaction
      categories: {
        set: data.categoryIds.map((catId) => ({ id: catId })),
      },
      tags: {
        set: data.tagIds ? data.tagIds.map((id) => ({ id })) : [],
      },
      supplier: data.supplierId
        ? { connect: { id: data.supplierId } }
        : { disconnect: true },
      warrantyType: data.warrantyTypeId
        ? { connect: { id: data.warrantyTypeId } }
        : { disconnect: true },
    };

    // Replace tx with prisma, assign result to updatedItem
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: coreUpdateData,
      include: {
        // Include everything needed for the return value/revalidation
        categories: true,
        supplier: true,
        warrantyType: true,
        variations: {
          include: {
            stockLevels: {
              include: {
                location: true,
              },
            },
          },
        },
        tags: true,
      },
    });

    // return item; // Remove this line - updatedItem is now assigned above
    // }); // Remove this line - End of original transaction block content
    // --- End Transaction ---

    // TODO: Implement accurate stock adjustment creation based on pre/post transaction states if needed
    // if (adjustmentsToCreate.length > 0) {
    //   await prisma.inventoryAdjustment.createMany({ data: adjustmentsToCreate });
    // }

    revalidatePath('/dashboard/inventory/items');

    return { status: 'success', item: updatedItem }; // Return the result from the final update
  } catch (error) {
    console.error('Error updating inventory item:', error);
    // Provide more specific error feedback if possible
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === 'P2002'
        && error.meta?.target === 'InventoryVariation_sku_key'
      ) {
        throw new Error('Failed to update item: SKU conflict detected. Please ensure all variation SKUs are unique.');
      }
    }
    throw new Error('Failed to update inventory item');
  }
}

// Get All Items
export async function getInventoryItems () {
  try {
    return await prisma.inventoryItem.findMany({
      where: { isBundle: false },
      include: {
        categories: true,
        supplier: true,
        variations: {
          include: {
            stockLevels: {
              where: {
                location: {
                  isActive: true,
                },
              },
              include: {
                location: true,
              },
            },
          },
        },
        tags: true,
        warrantyType: true,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw new Error('Failed to fetch inventory items');
  }
}

// Get Single Item
export async function getInventoryItem (id: string) {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        categories: true,
        supplier: true,
        variations: {
          include: {
            stockLevels: {
              where: {
                location: {
                  isActive: true,
                },
              },
              include: {
                location: true,
              },
            },
          },
        },
        tags: true,
        warrantyType: true,
      },
    });

    if (!item) { throw new Error('Item not found'); }

    return item;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    throw new Error('Failed to fetch inventory item');
  }
}

// Delete Item
export async function deleteInventoryItem (id: string) {
  try {
    await prisma.comment.deleteMany({
      where: {
        inventoryReturn: {
          inventoryItemId: id,
        },
      },
    });

    await prisma.inventoryStockLevel.deleteMany({
      where: {
        variation: {
          inventoryItemId: id,
        },
      },
    });

    await prisma.inventoryVariation.deleteMany({
      where: {
        inventoryItemId: id,
      },
    });

    await prisma.inventoryItem.delete({
      where: { id },
    });

    revalidatePath('/dashboard/inventory/items');

    return { status: 'success', message: 'Item deleted successfully' };
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw new Error('Failed to delete inventory item');
  }
}

// Variation Management
// export async function addVariation(
//   itemId: string,
//   data: {
//     name: string;
//     sku: string;
//     stockLevels: {
//       locationId: number;
//       stock: number;
//       purchaseCost?: number;
//     }[];
//   }
// ) {
//   try {
//     const variation = await prisma.inventoryVariation.create({
//       data: {
//         name: data.name,
//         sku: data.sku,
//         inventoryItemId: itemId,
//         stockLevels: {
//           create: data.stockLevels,
//         },
//       },
//       include: {
//         stockLevels: true,
//       },
//     });

//     revalidatePath('/dashboard/inventory/items');
//     return { status: 'success', variation };
//   } catch (error) {
//     console.error('Error adding variation:', error);
//     throw new Error('Failed to add variation');
//   }
// }

// Update Stock Levels
export async function updateStockLevel (
  variationId: string,
  locationId: number,
  stock: number,
  purchaseCost?: number,
) {
  try {
    const stockLevel = await prisma.inventoryStockLevel.upsert({
      where: {
        variationId_locationId: {
          variationId,
          locationId,
        },
      },
      update: {
        stock,
        purchaseCost,
      },
      create: {
        variationId,
        locationId,
        stock,
        purchaseCost,
      },
    });

    revalidatePath('/dashboard/inventory/items');

    return { status: 'success', stockLevel };
  } catch (error) {
    console.error('Error updating stock level:', error);
    throw new Error('Failed to update stock level');
  }
}

export async function getCategories () {
  try {
    // Get root categories (those without parents) and their children
    return await prisma.inventoryItemCategory.findMany({
      where: {
        parentId: null, // Get root categories
      },
      include: {
        children: {
          include: {
            children: true, // Get up to 3 levels deep
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

export async function getSuppliers () {
  try {
    return await prisma.vendor.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw new Error('Failed to fetch vendors');
  }
}

export async function getTags () {
  try {
    return await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw new Error('Failed to fetch tags');
  }
}

export async function getVariationsStockForLocation (
  variationIds: string[],
  locationId: number,
): Promise<Record<string, number>> {
  if (variationIds.length === 0) {
    return {};
  }

  try {
    const stockLevels = await prisma.inventoryStockLevel.findMany({
      where: {
        variationId: {
          in: variationIds,
        },
        locationId: locationId,
      },
      select: {
        variationId: true,
        stock: true,
      },
    });

    // Create a map of variationId -> stock, defaulting to 0 if not found
    const stockMap: Record<string, number> = {};

    variationIds.forEach((id) => {
      stockMap[id] = 0; // Initialize all requested IDs with 0
    });

    stockLevels.forEach((level) => {
      stockMap[level.variationId] = level.stock;
    });

    return stockMap;
  } catch (error) {
    console.error('Error fetching variation stock levels:', error);
    throw new Error('Failed to fetch variation stock levels');
  }
}

export async function getWarrantyTypes () {
  try {
    return await prisma.warrantyType.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('Error fetching warranty types:', error);
    throw new Error('Failed to fetch warranty types');
  }
}

export async function getInventoryVariations () {
  try {
    return await prisma.inventoryVariation.findMany({
      include: {
        inventoryItem: true,
        stockLevels: {
          where: {
            location: {
              isActive: true,
            },
          },
          include: {
            location: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching inventory variation:', error);
    throw new Error('Failed to fetch inventory variation');
  }
}

export async function updateVariation (
  variationId: string,
  data: VariationUpdateInput,
) {
  try {
    // Get session for user info
    const session = await fetchSession();

    if (!session) {
      throw new Error('User not authenticated');
    }
    const user = session;

    // First, get the existing variation to compare stock levels
    const existingVariation = await prisma.inventoryVariation.findUnique({
      where: { id: variationId },
      include: {
        stockLevels: true,
        inventoryItem: true,
      },
    });

    if (!existingVariation) {
      throw new Error('Variation not found');
    }

    // Get default rates if useDefaultRates is true
    const useDefaultRates = data.useDefaultRates === true;
    let defaultShippingRate = 0;
    let defaultTaxRate = 0;

    if (useDefaultRates) {
      defaultShippingRate = await getDefaultShippingRate();
      defaultTaxRate = await getDefaultTaxRate();
    }

    // Calculate derived values with appropriate rates
    const raw = data.raw || 0;
    const tax = useDefaultRates ? defaultTaxRate : data.tax || 0;
    const shipping = useDefaultRates ? defaultShippingRate : data.shipping || 0;
    const markup = data.markup || 0;

    const priceFieldsChanged
      = existingVariation.raw !== raw
      || existingVariation.tax !== tax
      || existingVariation.shipping !== shipping
      || existingVariation.useDefaultRates !== useDefaultRates; // Also trigger if default rates toggle changed

    const cost = raw + raw * (tax / 100) + shipping;
    const totalCost = cost + cost * (markup / 100);
    const profit = totalCost - cost;
    const sellingPrice = totalCost;

    // Create update data without stockLevels first
    const updateData: any = {
      name: data.name,
      sku: data.sku,
      barcode: data.barcode,
      image: data.image,
      raw,
      tax: data.tax, // Store the custom tax even when using defaults
      shipping: data.shipping, // Store the custom shipping even when using defaults
      markup,
      totalCost,
      profit,
      sellingPrice,
      visible: data.visible,
      useDefaultRates: data.useDefaultRates,
      weight: data.weight,
      length: data.length,
      width: data.width,
      height: data.height,
    };

    // Track stock adjustments to create
    const adjustmentsToCreate: InventoryAdjustment[] = [];

    // If we have stock levels, handle them separately
    let updateWithStockLevels = { ...updateData };

    if (data.stockLevels) {
      // Transform record format to array for Prisma
      const stockLevelEntries = Object.entries(data.stockLevels);

      if (stockLevelEntries.length > 0) {
        updateWithStockLevels = {
          ...updateData,
          stockLevels: {
            upsert: stockLevelEntries.map(([locationIdStr, stockInfo]) => {
              const locationId = parseInt(locationIdStr);

              // Find existing stock level for comparison
              const existingStockLevel = existingVariation.stockLevels.find((sl) => sl.locationId === locationId);

              const stockBefore = existingStockLevel?.stock || 0;
              const stockAfter = stockInfo.stock;
              const changeAmount = stockAfter - stockBefore;

              // Save adjustment data if stock changed
              if (changeAmount !== 0) {
                adjustmentsToCreate.push({
                  inventoryItemId: existingVariation.inventoryItemId!,
                  inventoryVariationId: variationId,
                  locationId: locationId,
                  changeAmount,
                  reason: 'Manual stock update',
                  stockBefore,
                  stockAfter,
                  adjustedById: user.user.id,
                  approvedById: user.user.id,
                  approved: true,
                });
              }

              return {
                where: {
                  variationId_locationId: {
                    variationId: variationId,
                    locationId: locationId,
                  },
                },
                update: {
                  stock: stockInfo.stock,
                  purchaseCost: stockInfo.purchaseCost || null,
                },
                create: {
                  stock: stockInfo.stock,
                  purchaseCost: stockInfo.purchaseCost || null,
                  location: {
                    connect: {
                      id: locationId,
                    },
                  },
                },
              };
            }),
          },
        };
      }
    }

    // Update the variation
    const updatedVariation = await prisma.inventoryVariation.update({
      where: { id: variationId },
      data: updateWithStockLevels,
      include: {
        stockLevels: {
          where: {
            location: {
              isActive: true,
            },
          },
          include: {
            location: true,
          },
        },
      },
    });

    // Create adjustment records separately after the update
    if (adjustmentsToCreate.length > 0) {
      await prisma.inventoryAdjustment.createMany({
        data: adjustmentsToCreate,
      });
    }

    // --- Start: Recalculate linked RepairOption prices if price fields changed ---
    if (priceFieldsChanged) {
      try {
        const linkedRepairOptions = await prisma.repairOption.findMany({
          where: { variationId: variationId },
          select: { id: true }, // Only need the ID
        });

        if (linkedRepairOptions.length > 0) {
          for (const repairOption of linkedRepairOptions) {
            // try {
            //   await recalculateAndUpdateRepairOptionPrice(
            //     repairOption.id,
            //     variationId
            //   );
            // } catch (recalcError) {
            //   console.error(
            //     `Failed to recalculate price for RepairOption ${repairOption.id}:`,
            //     recalcError
            //   );
            //   // Decide if you want to throw, continue, or collect errors
            // }
          }
        }
      } catch (error) {
        console.error(
          `Error finding or recalculating RepairOptions for variation ${variationId}:`,
          error,
        );
        // Handle error in finding linked options - potentially log or notify
      }
    }
    // --- End: Recalculate linked RepairOption prices ---

    // Revalidate the inventory items path
    revalidatePath('/dashboard/inventory/items');
    // Revalidate repairs path as prices might have changed
    revalidatePath('/dashboard/repairs');

    return updatedVariation;
  } catch (error) {
    console.error('Error updating variation:', error);
    throw error;
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

// Adjust Stock Level and Create Adjustment Record
export async function adjustStockLevel (
  variationId: string,
  locationId: number,
  changeAmount: number,
  reason: string,
  purchaseCost?: number,
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
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the variation details first
      const variation = await tx.inventoryVariation.findUnique({
        where: { id: variationId },
      });

      if (!variation) {
        throw new Error(`Variation with ID ${variationId} not found.`);
      }
      if (!variation.inventoryItemId) {
        // This check might be redundant if inventoryItemId is non-nullable and required on creation
        throw new Error(`Variation ${variationId} is not linked to an item.`);
      }

      // 2. Get the current stock level for the specific location
      const existingStockLevel = await tx.inventoryStockLevel.findUnique({
        where: {
          variationId_locationId: {
            variationId: variationId,
            locationId: locationId,
          },
        },
        include: {
          location: true,
          variation: true,
        },
      });

      // console.log("existingStockLevel", existingStockLevel);
      // console.log("variation", variation);
      // console.log("locationId", locationId);

      const stockBefore = existingStockLevel?.stock ?? 0;
      const stockAfter = stockBefore + changeAmount;

      if (stockAfter < 0) {
        throw new Error(`Stock level for ${existingStockLevel?.variation.name} at ${existingStockLevel?.location.name} cannot be negative.`);
      }

      // 3. Upsert the stock level
      const updatedStockLevel = await tx.inventoryStockLevel.upsert({
        where: {
          variationId_locationId: {
            variationId: variationId,
            locationId: locationId,
          },
        },
        create: {
          variationId: variationId,
          locationId: locationId,
          stock: stockAfter,
          purchaseCost: purchaseCost, // Use provided purchaseCost or default (null/undefined based on schema)
        },
        update: {
          stock: stockAfter,
          // Only update purchaseCost if it's provided
          ...(purchaseCost !== undefined && { purchaseCost: purchaseCost }),
        },
        // include: { location: true } // Optional: Add if needed by the caller
      });

      // 4. Create the adjustment record
      const adjustment = await tx.inventoryAdjustment.create({
        data: {
          inventoryItemId: variation.inventoryItemId, // Use ID fetched earlier
          inventoryVariationId: variationId,
          locationId: locationId,
          changeAmount: changeAmount,
          reason: reason,
          stockBefore: stockBefore,
          stockAfter: stockAfter,
          adjustedById: userId,
          approvedById: userId,
          approved: true,
        },
      });

      // Return both the updated stock level and the adjustment record
      return { updatedStockLevel, adjustment };
    });

    revalidatePath('/dashboard/inventory/items'); // Revalidate relevant paths

    return {
      status: 'success',
      message: 'Stock level adjusted successfully.',
      data: result,
    };
  } catch (error) {
    console.error('Error adjusting stock level:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to adjust stock level');
  }
}

export async function adjustStockLevelFromOrder (
  variationId: string,
  changeAmount: number, // Should be negative for deduction (e.g., -3)
  reason: string,
  purchaseCost?: number,
) {
  let userId: string;

  const systemAdmin = await getSystemAdmin();

  userId = systemAdmin.id;

  if (changeAmount === 0) {
    throw new Error('Change amount must not be zero.');
  }
  if (changeAmount > 0) {
    throw new Error('adjustStockLevelFromOrder only supports deduction (negative changeAmount)');
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the variation details first
      const variation = await tx.inventoryVariation.findUnique({
        where: { id: variationId },
      });

      if (!variation) {
        throw new Error(`Variation with ID ${variationId} not found.`);
      }
      if (!variation.inventoryItemId) {
        throw new Error(`Variation ${variationId} is not linked to an item.`);
      }

      // 2. Get all stock levels for this variation with stock > 0, order by stock descending
      const stockLevels = await tx.inventoryStockLevel.findMany({
        where: {
          variationId: variationId,
          stock: { gt: 0 },
        },
        orderBy: {
          stock: 'desc',
        },
        include: {
          location: true,
        },
      });

      let remainingToDeduct = Math.abs(changeAmount); // positive number
      const adjustments = [];
      const updatedStockLevels = [];

      for (const stockLevel of stockLevels) {
        if (remainingToDeduct <= 0) { break; }
        const deduct = Math.min(stockLevel.stock, remainingToDeduct);
        const stockBefore = stockLevel.stock;
        const stockAfter = stockBefore - deduct;

        // Update stock level
        const updatedStockLevel = await tx.inventoryStockLevel.update({
          where: {
            variationId_locationId: {
              variationId: variationId,
              locationId: stockLevel.locationId,
            },
          },
          data: {
            stock: stockAfter,
            ...(purchaseCost !== undefined && { purchaseCost }),
          },
        });

        updatedStockLevels.push(updatedStockLevel);

        // Create adjustment record
        const adjustment = await tx.inventoryAdjustment.create({
          data: {
            inventoryItemId: variation.inventoryItemId,
            inventoryVariationId: variationId,
            locationId: stockLevel.locationId,
            changeAmount: -deduct, // negative for deduction
            reason: reason,
            stockBefore: stockBefore,
            stockAfter: stockAfter,
            adjustedById: userId,
            approvedById: userId,
            approved: true,
          },
        });

        adjustments.push(adjustment);

        remainingToDeduct -= deduct;
      }

      if (remainingToDeduct > 0) {
        throw new Error(`Not enough stock to fulfill the requested deduction. Short by ${remainingToDeduct}`);
      }

      return { updatedStockLevels, adjustments };
    });

    revalidatePath('/dashboard/inventory/items'); // Revalidate relevant paths

    return {
      status: 'success',
      message: 'Stock level adjusted successfully.',
      data: result,
    };
  } catch (error) {
    console.error('Error adjusting stock level:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to adjust stock level');
  }
}

export async function getRelatedProducts (productId: string) {
  try {
    const product = await prisma.inventoryItem.findUnique({
      where: { id: productId },
      include: {
        categories: true,
        variations: {
          include: {
            stockLevels: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    const relatedProducts = await prisma.inventoryItem.findMany({
      where: {
        id: { not: productId }, // Exclude the current product
        categories: {
          some: {
            id: {
              in: product.categories.map((category) => category.id),
            },
          },
        },
        variations: {
          some: {
            visible: true, // Only include products with at least one visible variation
          },
        },
      },
      include: {
        categories: true,
        variations: {
          where: {
            visible: true, // Only include visible variations
          },
          include: {
            stockLevels: true,
          },
        },
      },
    });

    return relatedProducts;
  } catch (error) {
    console.error('Error getting related products:', error);
    throw error;
  }
}

export async function getAllVariations () {
  const variations = await prisma.inventoryVariation.findMany({
    include: {
      inventoryItem: true,
    },
  });

  return variations;
}
