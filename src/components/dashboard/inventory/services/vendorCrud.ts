"use server";

import prisma from "@/lib/prisma";

export async function getVendors() {
  try {
    const vendors = await prisma.vendor.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return vendors;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
}
