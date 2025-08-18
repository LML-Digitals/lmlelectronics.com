'use server';
'use server';

import prisma from '@/lib/prisma';
import { ItemReturnExtended } from '@/types/type';
import { fetchSession } from '@/lib/session';
export const getReturnedItems = async (): Promise<ItemReturnExtended[]> => {
  try {
    return (await prisma.inventoryReturn.findMany({
      include: {
        inventoryItem: {
          select: {
            name: true,
            variations: true,
            categories: true,
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        location: true,
        Comment: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        returnedAt: 'desc',
      },
    })) as any[];
  } catch (error) {
    throw new Error('Failed to fetch returned items');
  }
};

export const getReturnedItemById = async (returnedItemId: string): Promise<ItemReturnExtended | null> => {
  try {
    const item = await prisma.inventoryReturn.findUnique({
      where: {
        id: returnedItemId,
      },
      include: {
        inventoryItem: {
          select: {
            name: true,
            variations: true,
            categories: true,
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        location: true,
        Comment: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return item as ItemReturnExtended | null;
  } catch (error) {
    throw new Error('Failed to fetch returned item');
    throw new Error('Failed to fetch returned item');
  }
};

type dataToSave = {
  inventoryItemId: string;
  locationId: string;
  reason:
    | 'Defective Item'
    | 'Repair Issues'
    | 'Change of Mind'
    | 'Customer Dissatisfaction'
    | 'Shop Dissatisfaction'
    | string;
  variationId: string;
  returningParty: string;
  returnedAt?: Date;
  request?: string;
  quantity: string;
  supplier?: string;
  comments?: string[];
  customerId?: string;
  amount?: number;
};

type createItemReturnResponse = {
  message: string;
  status: string;
};

export const createReturnedItem = async (data: dataToSave): Promise<createItemReturnResponse> => {
  try {
    // Todo: Save the returned item to the database
    const returnedItem = await prisma.inventoryReturn.create({
      data: {
        inventoryItemId: data.inventoryItemId,
        locationId: parseInt(data.locationId),
        reason: data.reason,
        inventoryVariationId: data.variationId,
        returningParty: data.returningParty,
        returnedAt: data.returnedAt ? data.returnedAt : new Date(),
        request: data.request ? data.request : '',
        quantity: Number(data.quantity),
        supplier: data.supplier ? data.supplier : '',
        customerId: data.customerId ? data.customerId : '',
        amount: data.amount ? data.amount : 0,
      },
    });

    // Todo: Add comments to the returned item
    if (data.comments && data.comments.length > 0) {
      await prisma.comment.createMany({
        data: data.comments.map((comment) => ({
          inventoryReturnId: returnedItem.id,
          text: comment,
        })),
      });
    }

    return {
      message: 'Returned item created successfully',
      status: 'success',
    };
  } catch (error: any) {
    console.log(error);
    throw new Error('Failed to create returned item');
  }
};

type Variation = {
  variationId: number;
  inventoryItemId: number;
  name: string;
  sku: string;
  image: string | undefined;
  quantity: number;
  price: number;
};

type dataToUpdate = {
  inventoryItemId?: string;
  locationId?: string;
  variationId?: string;
  reason?:
    | 'Defective Item'
    | 'Repair Issues'
    | 'Change of Mind'
    | 'Customer Dissatisfaction'
    | 'Shop Dissatisfaction'
    | string;
  returningParty?: string;
  returnedAt?: Date;
  request?: string;
  status?: string;
  quantity?: string;
  supplier?: string;
  comments?: string[];
  customerId?: string;
  amount?: number;
};

type updateItemReturnResponse = {
  message: string;
  status: string;
};

export const updateReturnedItem = async (
  itemReturnId: string,
  data: dataToUpdate,
): Promise<updateItemReturnResponse> => {
  try {
    const returnedItem = await prisma.inventoryReturn.findUnique({
      where: {
        id: itemReturnId,
      },
      include: {
        Comment: true,
        inventoryVariation: true,
      },
    });

    if (!returnedItem) {
      throw new Error('Returned item not found');
      throw new Error('Returned item not found');
    }

    await prisma.inventoryReturn.update({
      where: {
        id: itemReturnId,
      },
      data: {
        inventoryItemId: data.inventoryItemId! || returnedItem.inventoryItemId,
        locationId: data.locationId
          ? parseInt(data.locationId)
          : returnedItem.locationId,
        reason: data.reason || returnedItem.reason,
        returningParty: data.returningParty || returnedItem.returningParty,
        returnedAt: data.returnedAt || returnedItem.returnedAt,
        request: data.request || returnedItem.request,
        status: data.status || returnedItem.status,
        quantity: Number(data.quantity) || returnedItem.quantity,
        inventoryVariationId:
          data.variationId! || returnedItem.inventoryVariationId,
        supplier: data.supplier ? data.supplier : returnedItem.supplier,
        customerId: data.customerId ? data.customerId : returnedItem.customerId,
        amount: data.amount ? data.amount : returnedItem.amount,
      },
    });

    if (data.comments && data.comments.length > 0) {
      await prisma.comment.deleteMany({
        where: {
          inventoryReturnId: itemReturnId,
        },
      });

      await prisma.comment.createMany({
        data: data.comments.map((comment) => ({
          inventoryReturnId: itemReturnId,
          text: comment,
        })),
      });
    }

    return {
      message: 'Returned item updated successfully',
      status: 'success',
    };
  } catch (error) {
    console.log(error);
    throw new Error('Failed to update returned item');
    throw new Error('Failed to update returned item');
  }
};

type DeleteReturnResponse = {
  status: string;
};

export const deleteReturn = async (itemReturnId: string): Promise<DeleteReturnResponse> => {
  try {
    // const existingReturnRecord = await prisma.inventoryReturn.findUnique({
    //   where: {
    //     id: itemReturnId,
    //   },
    //   include: {
    //     Comment: true,
    //   },
    // });

    // if (!existingReturnRecord) {
    //   throw new Error('Return item record not found');
    // }

    // Todo: Delete related comments
    await prisma.comment.deleteMany({
      where: {
        inventoryReturnId: itemReturnId,
      },
    });

    // Todo:  Delete the item return record
    await prisma.inventoryReturn.delete({
      where: {
        id: itemReturnId,
      },
    });

    return { status: 'success' };
  } catch (error) {
    console.error('Error deleting return record:', error);

    return { status: 'error' };
  }
};

export async function updateReturnStatus (
  returnId: string,
  status: 'approved' | 'rejected',
) {
  const session = await fetchSession();
  const staffId = session?.user?.id;

  if (!staffId) {
    throw new Error('Staff ID is required for this operation');
  }
  try {
    const updateReturn = await prisma.inventoryReturn.update({
      where: {
        id: returnId,
      },
      data: {
        status,
      },
    });

    if (status === 'approved') {
      const stockLevel = await prisma.inventoryStockLevel.findFirst({
        where: {
          variationId: updateReturn.inventoryVariationId,
          locationId: updateReturn.locationId,
        },
      });

      if (stockLevel) {
        // Create an adjustment to correct the discrepancy
        await prisma.inventoryAdjustment.create({
          data: {
            inventoryItemId: updateReturn.inventoryItemId,
            inventoryVariationId: updateReturn.inventoryVariationId,
            locationId: updateReturn.locationId,
            changeAmount: updateReturn.quantity,
            reason: `Adjustment from Inventory Return #${updateReturn.id}`,
            stockBefore: stockLevel.stock,
            stockAfter: stockLevel.stock + updateReturn.quantity,
            adjustedById: staffId,
            approvedById: staffId,
            approved: true,
          },
        });

        // Update the specific variation's stock at the given location
        await prisma.inventoryStockLevel.update({
          where: { id: stockLevel.id, locationId: updateReturn.locationId },
          data: { stock: stockLevel.stock + updateReturn.quantity },
        });

        // Update the isPaid status to true
        if (
          updateReturn.returningParty === 'customer'
          && updateReturn.request === 'credit'
        ) {
          // const result = await addStoreCredit({
          //   customerId: updateReturn.customerId || "",
          //   amount: updateReturn.amount || 0,
          //   description: "Credit from Inventory Return #" + updateReturn.id,
          // });
          // if (result.success) {
          //   await prisma.inventoryReturn.update({
          //     where: { id: updateReturn.id },
          //     data: { isPaid: true },
          //   });
          // }
        }
      }
    }

    return { status: 'success' };
  } catch (error) {
    console.error('Error updating return status:', error);

    return { status: 'error' };
  }
}

export async function markReturnAsPaid (returnId: string) {
  try {
    const updatedReturn = await prisma.inventoryReturn.update({
      where: { id: returnId },
      data: { isPaid: true },
    });

    return { success: true, data: updatedReturn };
  } catch (error) {
    console.error('Error marking return as paid:', error);

    return { success: false, error: 'Failed to mark return as paid' };
  }
}
