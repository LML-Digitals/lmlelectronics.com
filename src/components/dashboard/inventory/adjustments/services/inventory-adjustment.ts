"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Creates a new inventory adjustment
 */
export async function createInventoryAdjustment(data: {
  inventoryItemId: string;
  inventoryVariationId: string; // Added variation ID
  changeAmount: number;
  reason: string;
  stockBefore: number;
  adjustedById: string;
  locationId: number;
}) {
  try {
    const adjustment = await prisma.inventoryAdjustment.create({
      data: {
        inventoryItemId: data.inventoryItemId,
        inventoryVariationId: data.inventoryVariationId, // Store variation ID
        locationId: data.locationId,
        changeAmount: data.changeAmount,
        reason: data.reason,
        stockBefore: data.stockBefore,
        adjustedById: data.adjustedById,
        approved: false,
      },
    });

    revalidatePath("/dashboard/inventory/adjustments");
    return { success: true, adjustment };
  } catch (error) {
    console.error("Failed to create inventory adjustment:", error);
    return { success: false, error };
  }
}

/**
 * Approves an existing inventory adjustment and updates stock
 */
export async function approveInventoryAdjustment(
  id: string,
  approvedById: string
) {
  try {
    const adjustment = await prisma.inventoryAdjustment.findUnique({
      where: { id },
    });

    if (!adjustment) {
      throw new Error("Adjustment not found");
    }

    // Update the adjustment status
    await prisma.inventoryAdjustment.update({
      where: { id },
      data: {
      approved: true,
      approvedById,
      stockAfter: adjustment.stockBefore + adjustment.changeAmount,
      },
    });

    // Get stock level for this specific variation and location
    const stockLevel = await prisma.inventoryStockLevel.findFirst({
      where: {
      variationId: adjustment.inventoryVariationId,
      locationId: adjustment.locationId,
      },
    });

    if (stockLevel) {
      // Update the specific variation's stock at the given location
      await prisma.inventoryStockLevel.update({
      where: { id: stockLevel.id, locationId: adjustment.locationId },
      data: { stock: stockLevel.stock + adjustment.changeAmount },
      });
    } else {
      // If no stock level exists, create one with the specified location
      await prisma.inventoryStockLevel.create({
      data: {
        variationId: adjustment.inventoryVariationId,
        locationId: adjustment.locationId,
        stock: adjustment.changeAmount > 0 ? adjustment.changeAmount : 0,
      },
      });
    }

    revalidatePath("/dashboard/inventory/adjustments");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve inventory adjustment:", error);
    return { success: false, error };
  }
}

/**
 * Gets all inventory adjustments with pagination
 */
export async function getInventoryAdjustments(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;
    const [adjustments, total] = await prisma.$transaction([
      prisma.inventoryAdjustment.findMany({
        skip,
        take: limit,
        include: {
          inventoryItem: true,
          inventoryVariation: true,
          location: true,
          adjustedBy: true,
          approvedBy: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.inventoryAdjustment.count(),
    ]);

    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return { adjustments, pagination, success: true };
  } catch (error) {
    console.error("Failed to get inventory adjustments:", error);
    return { adjustments: [], pagination: null, success: false };
  }
}

/**
 * Gets a single inventory adjustment by ID
 */
export async function getInventoryAdjustment(id: string) {
  try {
    const adjustment = await prisma.inventoryAdjustment.findUnique({
      where: { id },
      include: {
        inventoryItem: true,
        inventoryVariation: true, // Include the variation
        adjustedBy: true,
        approvedBy: true,
      },
    });

    return adjustment;
  } catch (error) {
    console.error("Failed to get inventory adjustment:", error);
    return null;
  }
}

export const deleteInventoryAdjustment = async (id: string) => {
  try {
    const data = await prisma.inventoryAdjustment.delete({
      where: { id },
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to delete inventory adjustment:", error);
    return { success: false, error };
  }
};

export const updateInventoryAdjustment = async (
  id: string,
  adjustmentData: {
    reason: string;
    changeAmount: number;
    inventoryItemId: string;
    inventoryVariationId: string;
  }
) => {
  try {
    const data = await prisma.inventoryAdjustment.update({
      where: { id },
      data: {
        reason: adjustmentData.reason,
        changeAmount: adjustmentData.changeAmount,
        inventoryItemId: adjustmentData.inventoryItemId,
        inventoryVariationId: adjustmentData.inventoryVariationId,
      },
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to update inventory adjustment:", error);
    return { success: false, error };
  }
};
