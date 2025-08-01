"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  WarrantyInput,
  WarrantyClaimInput,
  WarrantyClaimUpdateInput,
} from "../types/types";

// Get all warranties
export async function getAllWarranties() {
  try {
    const warranties = await prisma.warranty.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        inventoryItem: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        inventoryVariation: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        warrantyType: true,
        warrantyClaims: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return warranties;
  } catch (error) {
    console.error("Error fetching warranties:", error);
    throw error;
  }
}

// Get warranties for a specific customerId - different from getCustomerWarranties by having different includes
export async function getWarrantiesByCustomerId(customerId: string) {
  try {
    const warranties = await prisma.warranty.findMany({
      where: { customerId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        inventoryItem: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        inventoryVariation: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        warrantyType: true,
        warrantyClaims: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return warranties;
  } catch (error) {
    console.error(
      `Error fetching warranties for customer ID ${customerId}:`,
      error
    );
    throw error;
  }
}

// Get warranty by ID with details
export async function getWarrantyById(id: string) {
  try {
    const warranty = await prisma.warranty.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        inventoryItem: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        inventoryVariation: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        warrantyType: true,
        warrantyClaims: true,
      },
    });

    return warranty;
  } catch (error) {
    console.error(`Error fetching warranty with ID ${id}:`, error);
    throw error;
  }
}

// Get warranties for a specific customer
export async function getCustomerWarranties(customerId: string) {
  try {
    const warranties = await prisma.warranty.findMany({
      where: { customerId },
      include: {
        inventoryItem: {
          select: {
            id: true,
            name: true,
          },
        },
        warrantyType: true,
        warrantyClaims: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return warranties;
  } catch (error) {
    console.error(
      `Error fetching warranties for customer ${customerId}:`,
      error
    );
    throw error;
  }
}

// Create new warranty
export async function createWarranty(data: WarrantyInput) {
  try {
    // Get the warranty type to determine end date if not provided
    const warrantyType = await prisma.warrantyType.findUnique({
      where: { id: data.warrantyTypeId },
    });

    // If no end date is provided and the warranty type has a duration, calculate the end date
    let endDate = data.endDate;
    if (!endDate && warrantyType && warrantyType.duration > 0) {
      const startDate = new Date(data.startDate);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + warrantyType.duration);
    }

    const warranty = await prisma.warranty.create({
      data: {
        warrantyTypeId: data.warrantyTypeId,
        startDate: data.startDate,
        endDate: endDate,
        inventoryItemId: data.inventoryItemId,
        inventoryVariationId: data.inventoryVariationId,
        customerId: data.customerId,
      },
    });

    revalidatePath("/dashboard/warranty");
    return warranty;
  } catch (error) {
    console.error("Error creating warranty:", error);
    throw error;
  }
}

// Update warranty
export async function updateWarranty(id: string, data: Partial<WarrantyInput>) {
  try {
    // If warrantyTypeId is changing, we might need to recalculate the end date
    let updateData = { ...data };

    if (data.warrantyTypeId) {
      const warrantyType = await prisma.warrantyType.findUnique({
        where: { id: data.warrantyTypeId },
      });

      // If no explicit end date is provided but we're changing the warranty type,
      // recalculate based on the new type's duration
      if (!data.endDate && warrantyType && warrantyType.duration > 0) {
        // Get the current warranty to use its start date if not changing
        const currentWarranty = await prisma.warranty.findUnique({
          where: { id },
          select: { startDate: true },
        });

        const startDate =
          data.startDate || currentWarranty?.startDate || new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + warrantyType.duration);

        updateData.endDate = endDate;
      }
    }

    const warranty = await prisma.warranty.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/dashboard/warranty/${id}`);
    revalidatePath("/dashboard/warranty");
    return warranty;
  } catch (error) {
    console.error(`Error updating warranty with ID ${id}:`, error);
    throw error;
  }
}

// Delete warranty
export async function deleteWarranty(id: string) {
  try {
    // First, delete all associated warranty claims
    await prisma.warrantyClaim.deleteMany({
      where: { warrantyId: id },
    });

    // Then delete the warranty itself
    const warranty = await prisma.warranty.delete({
      where: { id },
    });

    revalidatePath("/dashboard/warranty");
    return warranty;
  } catch (error) {
    console.error(`Error deleting warranty with ID ${id}:`, error);
    throw error;
  }
}

// Create warranty claim
export async function createWarrantyClaim(data: WarrantyClaimInput) {
  try {
    // First, fetch the warranty to check its type and coverage
    const warranty = await prisma.warranty.findUnique({
      where: { id: data.warrantyId },
      include: {
        warrantyType: true,
      },
    });

    // Determine if this claim should be auto-approved based on warranty type and issue type
    // This would need business logic specific to your warranty types
    const isAutoApproved = false; // Default to manual review

    const claim = await prisma.warrantyClaim.create({
      data: {
        description: data.description,
        issueType: data.issueType,
        photos: data.photos,
        status: isAutoApproved ? "Approved" : "Pending",
        warrantyId: data.warrantyId,
        customerId: data.customerId,
      },
    });

    revalidatePath(`/dashboard/warranty/${data.warrantyId}`);
    return claim;
  } catch (error) {
    console.error("Error creating warranty claim:", error);
    throw error;
  }
}

// Get warranty claim by ID
export async function getWarrantyClaimById(id: string) {
  try {
    const claim = await prisma.warrantyClaim.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        warranty: {
          select: {
            id: true,
            warrantyType: true,
            inventoryItem: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return claim;
  } catch (error) {
    console.error(`Error fetching warranty claim with ID ${id}:`, error);
    throw error;
  }
}

// Update warranty claim
export async function updateWarrantyClaim(
  id: string,
  data: WarrantyClaimUpdateInput
) {
  try {
    const claim = await prisma.warrantyClaim.update({
      where: { id },
      data,
    });

    // await sendNotification({
    //   type: "GENERAL",
    //   priority: "LOW",
    //   recipientType: "CUSTOMER",
    //   recipientId: claim.customerId,
    //   title: "Warranty claim updated",
    //   message: `Your warranty claim has been updated to ${claim.status}.`,
    //   metadata: {
    //     warrantyClaimId: id,
    //     warrantyId: claim.warrantyId,
    //     customerId: claim.customerId,
    //   },
    // });

    // Get the warranty ID to revalidate the correct paths
    const warrantyId = claim.warrantyId;

    revalidatePath(`/dashboard/warranty/claims/${id}`);
    revalidatePath(`/dashboard/warranty/${warrantyId}`);
    return claim;
  } catch (error) {
    console.error(`Error updating warranty claim with ID ${id}:`, error);
    throw error;
  }
}

// Delete warranty claim
export async function deleteWarrantyClaim(id: string) {
  try {
    const claim = await prisma.warrantyClaim.delete({
      where: { id },
    });

    revalidatePath(`/dashboard/warranty/${claim.warrantyId}`);
    return claim;
  } catch (error) {
    console.error(`Error deleting warranty claim with ID ${id}:`, error);
    throw error;
  }
}

// Get all warranty claims with optional status filter
export async function getAllWarrantyClaims(status?: string) {
  try {
    const where = status ? { status } : {};

    const claims = await prisma.warrantyClaim.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        warranty: {
          select: {
            id: true,
            warrantyType: true,
            inventoryItem: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return claims;
  } catch (error) {
    console.error("Error fetching warranty claims:", error);
    throw error;
  }
}
