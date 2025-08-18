'use server';

import prisma from '@/lib/prisma';
import {
  InventoryTransfer,
  InventoryItem,
  InventoryVariation,
  StoreLocation,
  InventoryStockLevel,
} from '@prisma/client';
import { fetchSession } from '@/lib/session';

export type ExtendedInventoryTransfer = InventoryTransfer & {
  fromLocation: StoreLocation;
  toLocation: StoreLocation;
  inventoryItem: InventoryItem & {
    variations: InventoryVariation[];
  };
  inventoryVariation: InventoryVariation & {
    stockLevels: InventoryStockLevel[];
  };
};

export const getInventoryTransfers = async (): Promise<
  ExtendedInventoryTransfer[]
> => {
  try {
    return await prisma.inventoryTransfer.findMany({
      include: {
        fromLocation: true,
        toLocation: true,
        inventoryItem: {
          include: {
            variations: true,
          },
        },
        inventoryVariation: {
          include: {
            stockLevels: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching inventory transfers:', error);
    throw new Error('Failed to fetch inventory transfers');
  }
};

export const getInventoryTransferById = async (inventoryTransferId: string): Promise<InventoryTransfer | null> => {
  try {
    const transfer = await prisma.inventoryTransfer.findUnique({
      where: {
        id: inventoryTransferId,
      },
      include: {
        fromLocation: true,
        toLocation: true,
        inventoryItem: {
          include: {
            variations: true,
          },
        },
        inventoryVariation: true,
      },
    });

    return transfer; // Return single InventoryTransfer or null if not found
  } catch (error) {
    console.error('Error fetching inventory transfer by ID:', error);
    throw new Error('Failed to fetch inventory transfer by ID');
  }
};

type CreateInventoryTransferInput = {
  inventoryItemId: string;
  InventoryVariationId: string;
  quantity: string;
  fromLocationId: string;
  toLocationId: string;
};

type createInventoryResponse = {
  message: string;
  status: string;
};

export const createInventoryTransfer = async (data: CreateInventoryTransferInput): Promise<createInventoryResponse> => {
  console.log(data);

  const {
    inventoryItemId,
    InventoryVariationId,
    quantity,
    fromLocationId,
    toLocationId,
  } = data;

  const quantityInt = parseInt(quantity);

  try {
    // Create the inventory transfer record
    await prisma.inventoryTransfer.create({
      data: {
        inventoryItemId: inventoryItemId,
        status: 'Pending',
        inventoryVariationId: InventoryVariationId,
        quantity: quantityInt,
        transferDate: new Date(),
        fromLocationId: parseInt(fromLocationId),
        toLocationId: parseInt(toLocationId),
      },
    });

    return { message: 'Inventory Transfer Created', status: 'success' };
  } catch (error) {
    console.error('Error creating inventory transfer:', error);
    throw new Error('Failed to create inventory transfer');
  }
};

type UpdateInventoryTransferInput = {
  inventoryItemId?: string;
  quantity?: number;
  fromLocationId?: number;
  toLocationId?: number;
  InventoryVariationId: string;
};

type updateInventoryResponse = {
  message: string;
  status: string;
};

export const updateInventoryTransfer = async (
  inventoryTransferId: string,
  data: UpdateInventoryTransferInput,
): Promise<updateInventoryResponse> => {
  const {
    inventoryItemId,
    InventoryVariationId,
    quantity,
    fromLocationId,
    toLocationId,
  } = data;

  try {
    const isExistInventoryTransfers = await prisma.inventoryTransfer.findUnique({
      where: {
        id: inventoryTransferId,
      },
    });

    if (!isExistInventoryTransfers) {
      throw Error('Transfer not found ');
    }

    await prisma.inventoryTransfer.update({
      where: {
        id: inventoryTransferId,
      },
      data: {
        inventoryItemId: inventoryItemId
          ? inventoryItemId
          : isExistInventoryTransfers.inventoryItemId,
        inventoryVariationId: InventoryVariationId
          ? InventoryVariationId
          : isExistInventoryTransfers.inventoryVariationId,
        quantity: quantity
          ? Number(quantity)
          : isExistInventoryTransfers.quantity,
        fromLocationId: fromLocationId
          ? fromLocationId
          : isExistInventoryTransfers.fromLocationId,
        toLocationId: toLocationId
          ? toLocationId
          : isExistInventoryTransfers.toLocationId,
      },
    });

    return { message: 'Inventory Transfer Updated', status: 'success' };
  } catch (error) {
    console.error('Error updating inventory transfer:', error);
    throw new Error('Failed to update inventory transfer');
  }
};

type DeleteInventoryResponse = {
  status: string;
};

export const deleteInventoryTransfer = async (transferId: string): Promise<DeleteInventoryResponse> => {
  try {
    const existingTransfer = await prisma.inventoryTransfer.findUnique({
      where: {
        id: transferId,
      },
    });

    if (!existingTransfer) {
      throw new Error('Inventory transfer item record not found');
    }

    // Todo:  Delete the item return record
    await prisma.inventoryTransfer.delete({
      where: {
        id: transferId,
      },
    });

    return { status: 'success' };
  } catch (error) {
    console.error('Error deleting transfer record:', error);

    return { status: 'error' };
  }
};

/**
 * Updates the status of a transfer and adjusts inventory stock levels when status is "Completed"
 */
export const updateTransferWithStockAdjustment = async (
  transferId: string,
  newStatus: string,
): Promise<{ status: string; message: string }> => {
  try {
    const session = await fetchSession();
    const staffId = session?.user?.id;

    if (!staffId) {
      return { status: 'error', message: 'Staff ID not found' };
    }
    // Get the current transfer with all necessary relations
    const transfer = await prisma.inventoryTransfer.findUnique({
      where: { id: transferId },
      include: {
        inventoryVariation: true,
        inventoryItem: true,
      },
    });

    if (!transfer) {
      return { status: 'error', message: 'Transfer not found' };
    }

    const previousStatus = transfer.status;

    // If status is not changing, do nothing
    if (previousStatus === newStatus) {
      return { status: 'info', message: 'No status change detected' };
    }

    // Begin a transaction to ensure data integrity
    // Increase timeout to 10 seconds (10000 ms) to prevent timeout errors
    return await prisma.$transaction(
      async (tx) => {
        // Update the transfer status first
        await tx.inventoryTransfer.update({
          where: { id: transferId },
          data: { status: newStatus },
        });

        // Only adjust stock if moving to or from "Completed" status
        if (newStatus === 'Completed' || previousStatus === 'Completed') {
          const variationId = transfer.inventoryVariationId;
          const inventoryItemId = transfer.inventoryItemId;
          const quantity = transfer.quantity;
          const fromLocationId = transfer.fromLocationId;
          const toLocationId = transfer.toLocationId;

          // Get current stock levels
          const fromStockLevel = await tx.inventoryStockLevel.findUnique({
            where: {
              variationId_locationId: {
                variationId: variationId,
                locationId: fromLocationId,
              },
            },
          });

          const toStockLevel = await tx.inventoryStockLevel.findUnique({
            where: {
              variationId_locationId: {
                variationId: variationId,
                locationId: toLocationId,
              },
            },
          });

          if (newStatus === 'Completed') {
            // Ensure from location has enough stock
            if (!fromStockLevel || fromStockLevel.stock < quantity) {
              throw new Error('Insufficient stock in source location');
            }

            // Record the stock before updating
            const fromStockBefore = fromStockLevel.stock;
            const toStockBefore = toStockLevel ? toStockLevel.stock : 0;

            // Decrease stock from source location
            await tx.inventoryStockLevel.update({
              where: {
                variationId_locationId: {
                  variationId: variationId,
                  locationId: fromLocationId,
                },
              },
              data: {
                stock: { decrement: quantity },
              },
            });

            // Create adjustment record for source location
            await tx.inventoryAdjustment.create({
              data: {
                inventoryItemId: inventoryItemId,
                inventoryVariationId: variationId,
                locationId: fromLocationId,
                changeAmount: -quantity,
                reason: `Inventory transferred out to Location #${toLocationId} (Transfer #${transfer.id})`,
                stockBefore: fromStockBefore,
                stockAfter: fromStockBefore - quantity,
                adjustedById: staffId,
                approvedById: staffId,
                approved: true,
              },
            });

            // Increase stock in destination location
            if (toStockLevel) {
              await tx.inventoryStockLevel.update({
                where: {
                  variationId_locationId: {
                    variationId: variationId,
                    locationId: toLocationId,
                  },
                },
                data: {
                  stock: { increment: quantity },
                },
              });

              // Create adjustment record for destination location
              await tx.inventoryAdjustment.create({
                data: {
                  inventoryItemId: inventoryItemId,
                  inventoryVariationId: variationId,
                  locationId: toLocationId,
                  changeAmount: quantity,
                  reason: `Inventory transferred in from Location #${fromLocationId} (Transfer #${transfer.id})`,
                  stockBefore: toStockBefore,
                  stockAfter: toStockBefore + quantity,
                  adjustedById: staffId,
                  approvedById: staffId,
                  approved: true,
                },
              });
            } else {
              // Create stock record if it doesn't exist
              await tx.inventoryStockLevel.create({
                data: {
                  variationId: variationId,
                  locationId: toLocationId,
                  stock: quantity,
                },
              });

              // Create adjustment record for destination location
              await tx.inventoryAdjustment.create({
                data: {
                  inventoryItemId: inventoryItemId,
                  inventoryVariationId: variationId,
                  locationId: toLocationId,
                  changeAmount: quantity,
                  reason: `Inventory transferred in from Location #${fromLocationId} (Transfer #${transfer.id})`,
                  stockBefore: 0, // Stock was 0 before this transfer
                  stockAfter: quantity,
                  adjustedById: staffId,
                  approvedById: staffId,
                  approved: true,
                },
              });
            }

            return {
              status: 'success',
              message: 'Transfer completed and stock adjusted',
            };
          } else if (previousStatus === 'Completed') {
            // Reverse the stock changes if moving from completed to another status

            // Record the stock before updating
            const fromStockBefore = fromStockLevel ? fromStockLevel.stock : 0;
            const toStockBefore = toStockLevel ? toStockLevel.stock : 0;

            // Return stock to source location
            await tx.inventoryStockLevel.update({
              where: {
                variationId_locationId: {
                  variationId: variationId,
                  locationId: fromLocationId,
                },
              },
              data: {
                stock: { increment: quantity },
              },
            });

            // Create adjustment record for returning stock to source location
            await tx.inventoryAdjustment.create({
              data: {
                inventoryItemId: inventoryItemId,
                inventoryVariationId: variationId,
                locationId: fromLocationId,
                changeAmount: quantity,
                reason: `Inventory transfer reversal to Location #${toLocationId} (Transfer #${transfer.id})`,
                stockBefore: fromStockBefore,
                stockAfter: fromStockBefore + quantity,
                adjustedById: staffId,
                approvedById: staffId,
                approved: true,
              },
            });

            // Decrease stock from destination location
            if (toStockLevel && toStockLevel.stock >= quantity) {
              await tx.inventoryStockLevel.update({
                where: {
                  variationId_locationId: {
                    variationId: variationId,
                    locationId: toLocationId,
                  },
                },
                data: {
                  stock: { decrement: quantity },
                },
              });

              // Create adjustment record for removing stock from destination location
              await tx.inventoryAdjustment.create({
                data: {
                  inventoryItemId: inventoryItemId,
                  inventoryVariationId: variationId,
                  locationId: toLocationId,
                  changeAmount: -quantity,
                  reason: `Inventory transfer reversal from Location #${fromLocationId} (Transfer #${transfer.id})`,
                  stockBefore: toStockBefore,
                  stockAfter: toStockBefore - quantity,
                  adjustedById: staffId,
                  approvedById: staffId,
                  approved: true,
                },
              });
            } else {
              throw new Error('Cannot reverse transfer, insufficient stock in destination location');
            }

            return {
              status: 'success',
              message: `Transfer status updated to ${newStatus} and stock adjustments reversed`,
            };
          }
        }

        return {
          status: 'success',
          message: `Transfer status updated to ${newStatus}`,
        };
      },
      {
        timeout: 10000, // Increase timeout to 10 seconds (10000 ms)
      },
    );
  } catch (error: any) {
    console.error('Error updating transfer and stock:', error);

    return {
      status: 'error',
      message: error.message || 'Failed to update transfer and adjust stock',
    };
  }
};
