"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Creates a new inventory audit
 */
export async function createInventoryAudit(data: {
  inventoryItemId: string;
  inventoryVariationId: string;
  locationId: number;
  recordedStock: number;
  actualStock: number;
  auditedBy: string;
}) {
  try {
    // Calculate the discrepancy
    const discrepancy = data.actualStock - data.recordedStock;

    const audit = await prisma.inventoryAudit.create({
      data: {
        inventoryItemId: data.inventoryItemId,
        inventoryVariationId: data.inventoryVariationId,
        locationId: data.locationId,
        recordedStock: data.recordedStock,
        actualStock: data.actualStock,
        discrepancy,
        auditedBy: data.auditedBy,
      },
    });

    revalidatePath("/dashboard/inventory/audits");
    return { success: true, audit };
  } catch (error) {
    console.error("Failed to create inventory audit:", error);
    return { success: false, error };
  }
}

export async function updateInventoryAudit(
  id: string,
  data: {
    actualStock: number;
    recordedStock: number;
  }
) {
  try {
    const discrepancy = data.actualStock - data.recordedStock;

    const audit = await prisma.inventoryAudit.update({
      where: { id },
      data: {
        actualStock: data.actualStock,
        discrepancy
      }
    });

    revalidatePath("/dashboard/inventory/audits");
    return { success: true, audit };
  } catch (error) {
    console.error("Failed to update inventory audit:", error);
    return { success: false, error };
  }
}

/**
 * Updates the status of an inventory audit (e.g., from Pending to Resolved)
 */
export async function updateInventoryAuditStatus(id: string, status: string) {
  try {
    const audit = await prisma.inventoryAudit.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/dashboard/inventory/audits");
    return { success: true, audit };
  } catch (error) {
    console.error("Failed to update inventory audit status:", error);
    return { success: false, error };
  }
}

/**
 * Resolves an audit by updating the inventory stock to match the actual count
 */
export async function resolveInventoryAudit(id: string, staffId: string) {
  try {
    // Get the audit details
    const audit = await prisma.inventoryAudit.findUnique({
      where: { id },
      include: {
        inventoryItem: true,
        inventoryVariation: true,
      },
    });

    if (!audit) {
      throw new Error("Audit not found");
    }

    // Update the stock levels
    const stockLevel = await prisma.inventoryStockLevel.findFirst({
      where: {
        variationId: audit.inventoryVariationId,
        locationId: audit.locationId,
      },
    });

    if (stockLevel) {
      // Create an adjustment to correct the discrepancy
      await prisma.inventoryAdjustment.create({
        data: {
          inventoryItemId: audit.inventoryItemId,
          inventoryVariationId: audit.inventoryVariationId,
          locationId: audit.locationId,
          changeAmount: audit.discrepancy, // Add or subtract the discrepancy amount
          reason: `Adjustment from audit #${audit.id}`,
          stockBefore: stockLevel.stock,
          stockAfter: stockLevel.stock + audit.discrepancy,
          adjustedById: staffId,
          approvedById: staffId, // Auto-approval for audit-based adjustments
          approved: true,
        },
      });

      // Update the specific variation's stock at the given location
      await prisma.inventoryStockLevel.update({
        where: { id: stockLevel.id, locationId: audit.locationId },
        data: { stock: stockLevel.stock + audit.discrepancy },
      });
    }

    // Update audit status to resolved
    await prisma.inventoryAudit.update({
      where: { id },
      data: { status: "Resolved" },
    });

    revalidatePath("/dashboard/inventory/audits");
    return { success: true };
  } catch (error) {
    console.error("Failed to resolve inventory audit:", error);
    return { success: false, error };
  }
}

/**
 * Gets all inventory audits with pagination
 */
export async function getInventoryAudits() {
  try {
    const audits = await prisma.inventoryAudit.findMany({
      include: {
        inventoryItem: true,
        inventoryVariation: true,
        location: true,
        staff: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const count = await prisma.inventoryAudit.count();

    return {
      success: true,
      audits,
    };
  } catch (error) {
    console.error("Failed to get inventory audits:", error);
    return { success: false, error };
  }
}

/**
 * Gets a single inventory audit by ID
 */
export async function getInventoryAudit(id: string) {
  try {
    const audit = await prisma.inventoryAudit.findUnique({
      where: { id },
      include: {
        inventoryItem: true,
        staff: true,
      },
    });

    if (!audit) {
      return { success: false, error: "Audit not found" };
    }

    return { success: true, audit };
  } catch (error) {
    console.error("Failed to get inventory audit:", error);
    return { success: false, error };
  }
}

export async function deleteInventoryAudit(id: string) {
  try {
    await prisma.inventoryAudit.delete({
      where: { id },
    });

    revalidatePath("/dashboard/inventory/audits");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete inventory audit:", error);
    return { success: false, error };
  }
}

