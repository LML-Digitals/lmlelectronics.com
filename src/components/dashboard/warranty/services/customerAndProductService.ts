"use server";

import prisma from "@/lib/prisma";

export async function getCustomersForSelect() {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: {
        firstName: "asc",
      },
    });

    return customers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
}

export async function getInventoryItemsForSelect() {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        variations: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return items;
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    throw error;
  }
}

export async function getInventoryVariationsForSelect() {
  try {
    const variations = await prisma.inventoryVariation.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        inventoryItem: {
          select: {
            name: true,
          },
        },
      },
      where: {
        inventoryItemId: { not: null }, // Only get variations linked to inventory items
      },
      orderBy: {
        name: "asc",
      },
      take: 100, // Limit results for better performance
    });

    return variations;
  } catch (error) {
    console.error("Error fetching inventory variations:", error);
    throw error;
  }
}
