"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  CreateExchangeInput,
  ExchangeFilter,
  UpdateExchangeInput,
  ExchangeWithRelations,
} from "./types";
import { adjustStockLevel } from "@/components/dashboard/inventory/items/services/itemsCrud";

/**
 * Create a new inventory exchange
 */
export async function createExchange(input: CreateExchangeInput) {
  try {
    const {
      reason,
      customerId,
      returnedItemId,
      newItemId,
      processedBy,
      returnedVariationId,
      newVariationId,
      exchangedAt,
      locationId,
    } = input;

    // Verify that all required entities exist
    const [customer, returnedItem, newItem, staff] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.inventoryItem.findUnique({ where: { id: returnedItemId } }),
      prisma.inventoryItem.findUnique({ where: { id: newItemId } }),
      prisma.staff.findUnique({ where: { id: processedBy } }),
    ]);

    if (!customer) throw new Error("Customer not found");
    if (!returnedItem) throw new Error("Returned item not found");
    if (!newItem) throw new Error("New item not found");
    if (!staff) throw new Error("Staff member not found");

    const exchange = await prisma.inventoryExchange.create({
      data: {
        reason,
        customerId,
        returnedItemId,
        newItemId,
        processedBy,
        returnedVariationId,
        newVariationId,
        locationId,
        ...(exchangedAt ? { exchangedAt: new Date(exchangedAt) } : {}),
      },
    });

    revalidatePath("/dashboard/inventory/exchanges");
    return { success: true, data: exchange };
  } catch (error) {
    console.error("Failed to create exchange:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get a specific exchange by ID with related entities
 */
export async function getExchange(
  id: string
): Promise<{ success: boolean; data?: ExchangeWithRelations; error?: string }> {
  try {
    const exchange = await prisma.inventoryExchange.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, firstName: true, email: true, phone: true },
        },
        returnedItem: {
          select: { id: true, name: true, image: true },
        },
        newItem: {
          select: { id: true, name: true, image: true },
        },
        staff: {
          select: { id: true, firstName: true },
        },
        location: true,
      },
    });

    if (!exchange) {
      return { success: false, error: "Exchange not found" };
    }

    return { success: true, data: exchange as ExchangeWithRelations };
  } catch (error) {
    console.error("Failed to fetch exchange:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get all exchanges with optional filtering
 */
export async function getExchanges(): Promise<{
  success: boolean;
  data: ExchangeWithRelations[];
  error?: string;
}> {
  try {
    const exchanges = await prisma.inventoryExchange.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        returnedItem: {
          select: {
            id: true,
            name: true,
            image: true,
            // Include variations for the returned item
            variations: {
              select: {
                id: true,
                sku: true,
                name: true,
                image: true,
              },
              take: 10, // Limit to a reasonable number
            },
          },
        },
        newItem: {
          select: {
            id: true,
            name: true,
            image: true,
            // Include variations for the new item
            variations: {
              select: {
                id: true,
                sku: true,
                name: true,
                image: true,
              },
              take: 10, // Limit to a reasonable number
            },
          },
        },
        staff: {
          select: { id: true, firstName: true, lastName: true },
        },
        location: true,
      },
      orderBy: { exchangedAt: "desc" },
    });

    return { success: true, data: exchanges as ExchangeWithRelations[] };
  } catch (error) {
    console.error("Failed to fetch exchanges:", error);
    return { success: false, data: [], error: (error as Error).message };
  }
}

/**
 * Update an existing exchange
 */
export async function updateExchange(input: UpdateExchangeInput) {
  try {
    const { id, ...updateData } = input;

    // Check if exchange exists
    const existingExchange = await prisma.inventoryExchange.findUnique({
      where: { id },
    });

    if (!existingExchange) {
      return { success: false, error: "Exchange not found" };
    }

    // Verify related entities if they're being updated
    if (updateData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: updateData.customerId },
      });
      if (!customer) return { success: false, error: "Customer not found" };
    }

    if (updateData.returnedItemId) {
      const returnedItem = await prisma.inventoryItem.findUnique({
        where: { id: updateData.returnedItemId },
      });
      if (!returnedItem)
        return { success: false, error: "Returned item not found" };
    }

    if (updateData.newItemId) {
      const newItem = await prisma.inventoryItem.findUnique({
        where: { id: updateData.newItemId },
      });
      if (!newItem) return { success: false, error: "New item not found" };
    }

    if (updateData.processedBy) {
      const staff = await prisma.staff.findUnique({
        where: { id: updateData.processedBy },
      });
      if (!staff) return { success: false, error: "Staff member not found" };
    }

    // Adjust stock only if status is 'Approved' and items/variations are different
    if (
      updateData.status === "Approved" &&
      existingExchange.returnedVariationId &&
      existingExchange.newVariationId &&
      existingExchange.returnedVariationId !== existingExchange.newVariationId
    ) {
      // TODO: Determine the correct locationId logic
      const locationId = existingExchange.locationId;
      const reason = `Stock adjustment due to exchange approval (ID: ${id})`;

      try {
        // Decrease stock for the new item's variation
        await adjustStockLevel(
          existingExchange.newVariationId,
          locationId,
          -1, // Decrement stock by 1
          `${reason} - Outgoing`
        );

        // Increase stock for the returned item's variation
        await adjustStockLevel(
          existingExchange.returnedVariationId,
          locationId,
          1, // Increment stock by 1
          `${reason} - Returned`
        );
      } catch (stockError) {
        // Log the stock adjustment error, but proceed with revalidation/response
        console.error(`Failed to adjust stock for exchange ${id}:`, stockError);
        return { success: false, error: (stockError as Error).message };
      }
    } else if (updateData.status === "Approved") {
      console.log(
        `Stock not adjusted for exchange ${id}: Returned and new variations are the same or missing.`
      );
    }

    // If exchangedAt is provided, convert it to a Date object
    const formattedUpdateData = {
      ...updateData,
      ...(updateData.exchangedAt
        ? { exchangedAt: new Date(updateData.exchangedAt) }
        : {}),
    };

    const updatedExchange = await prisma.inventoryExchange.update({
      where: { id },
      data: formattedUpdateData,
    });

    revalidatePath("/dashboard/inventory/exchanges");
    return { success: true, data: updatedExchange };
  } catch (error) {
    console.error("Failed to update exchange:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Delete an exchange by ID
 */
export async function deleteExchange(id: string) {
  try {
    // Check if exchange exists
    const exchange = await prisma.inventoryExchange.findUnique({
      where: { id },
    });

    if (!exchange) {
      return { success: false, error: "Exchange not found" };
    }

    await prisma.inventoryExchange.delete({
      where: { id },
    });

    revalidatePath("/dashboard/inventory/exchanges");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete exchange:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Update exchange status (common operation so separate function)
 */
export async function updateExchangeStatus(id: string, status: string) {
  try {
    const validStatuses = ["Pending", "Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid status" };
    }

    const existingExchange = await prisma.inventoryExchange.findUnique({
      where: { id },
    });

    if (!existingExchange) {
      return { success: false, error: "Exchange not found" };
    }

    // Prevent re-processing if status is already the target status
    if (existingExchange.status === status) {
      return {
        success: true,
        data: existingExchange,
        message: `Status already ${status}`,
      };
    }

    // Adjust stock only if status is 'Approved' and items/variations are different
    if (
      status === "Approved" &&
      existingExchange.returnedVariationId &&
      existingExchange.newVariationId &&
      existingExchange.returnedVariationId !== existingExchange.newVariationId
    ) {
      // TODO: Determine the correct locationId logic
      const locationId = existingExchange.locationId;
      const reason = `Stock adjustment due to exchange approval (ID: ${id})`;

      try {
        // Decrease stock for the new item's variation
        await adjustStockLevel(
          existingExchange.newVariationId,
          locationId,
          -1, // Decrement stock by 1
          `${reason} - Outgoing`
        );

        // Increase stock for the returned item's variation
        await adjustStockLevel(
          existingExchange.returnedVariationId,
          locationId,
          1, // Increment stock by 1
          `${reason} - Returned`
        );
      } catch (stockError) {
        // Log the stock adjustment error, but proceed with revalidation/response
        console.error(`Failed to adjust stock for exchange ${id}:`, stockError);
        return { success: false, error: (stockError as Error).message };
      }
    } else if (status === "Approved") {
      console.log(
        `Stock not adjusted for exchange ${id}: Returned and new variations are the same or missing.`
      );
    }

    const updatedExchange = await prisma.inventoryExchange.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/dashboard/inventory/exchanges");
    return { success: true, data: updatedExchange };
  } catch (error) {
    console.error("Failed to update exchange status:", error);
    return { success: false, error: (error as Error).message };
  }
}
