"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { WarrantyCoverage } from "../types/types";

// Get all warranty types
export async function getAllWarrantyTypes() {
  try {
    const warrantyTypes = await prisma.warrantyType.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return warrantyTypes;
  } catch (error) {
    console.error("Error fetching warranty types:", error);
    throw error;
  }
}

// Get warranty type by id
export async function getWarrantyTypeById(id: string) {
  try {
    const warrantyType = await prisma.warrantyType.findUnique({
      where: { id },
    });
    return warrantyType;
  } catch (error) {
    console.error(`Error fetching warranty type with ID ${id}:`, error);
    throw error;
  }
}

// Create new warranty type
export async function createWarrantyType(data: {
  name: string;
  description: string;
  duration: number;
  coverage?: WarrantyCoverage;
}) {
  try {
    // Validate required fields
    if (!data.name) {
      throw new Error("Name is required");
    }

    if (!data.description) {
      throw new Error("Description is required");
    }

    if (data.duration === undefined || data.duration < 0) {
      throw new Error(
        "Duration must be a positive number or zero for lifetime warranties"
      );
    }

    // Create clean data object for Prisma
    const createData: any = {
      name: data.name,
      description: data.description,
      duration: data.duration,
    };

    // Explicitly handle the coverage object as JSON
    if (data.coverage !== undefined) {
      // Convert coverage to a proper JSON structure that Prisma can handle
      createData.coverage = JSON.parse(JSON.stringify(data.coverage));
    }

    console.log("Creating warranty type:", createData);

    const warrantyType = await prisma.warrantyType.create({
      data: createData,
    });

    revalidatePath("/dashboard/warranty/types");
    return warrantyType;
  } catch (error) {
    console.error("Error creating warranty type:", error);
    throw error;
  }
}

// Update warranty type
export async function updateWarrantyType(
  id: string,
  data: {
    name?: string;
    description?: string;
    duration?: number;
    coverage?: WarrantyCoverage;
  }
) {
  try {
    // Make sure we have a valid ID
    if (!id) {
      throw new Error("Warranty type ID is required");
    }

    // Make sure we have valid data
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data provided for update");
    }

    // Create a clean update object, handling potential null/undefined values properly
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.duration !== undefined) updateData.duration = data.duration;

    // Explicitly handle the coverage field as JSON
    if (data.coverage !== undefined) {
      // Convert coverage to a proper JSON structure that Prisma can handle
      updateData.coverage = JSON.parse(JSON.stringify(data.coverage));
    }

    const warrantyType = await prisma.warrantyType.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard/warranty/types");
    revalidatePath(`/dashboard/warranty/types/${id}`);
    return warrantyType;
  } catch (error) {
    console.error(`Error updating warranty type with ID ${id}:`, error);
    throw error;
  }
}

// Delete warranty type
export async function deleteWarrantyType(id: string) {
  try {
    // Check if there are any warranties using this type
    const warrantiesCount = await prisma.warranty.count({
      where: { warrantyTypeId: id },
    });

    if (warrantiesCount > 0) {
      throw new Error(
        `Cannot delete this warranty type because it is being used by ${warrantiesCount} warranties`
      );
    }

    const warrantyType = await prisma.warrantyType.delete({
      where: { id },
    });

    revalidatePath("/dashboard/warranty/types");
    return warrantyType;
  } catch (error) {
    console.error(`Error deleting warranty type with ID ${id}:`, error);
    throw error;
  }
}

// Seed default warranty types
export async function seedWarrantyTypes() {
  try {
    // Check if any warranty types already exist
    const existingCount = await prisma.warrantyType.count();
    if (existingCount > 0) {
      return {
        success: true,
        message: `${existingCount} warranty types already exist. No changes made.`,
        wasSeeded: false,
      };
    }

    // Default coverage configurations
    const standardCoverage: WarrantyCoverage = {
      defects: true,
      parts: true,
      labor: true,
      accidental: false,
      water: false,
      priority: false,
      replacements: false,
    };

    const extendedCoverage: WarrantyCoverage = {
      defects: true,
      parts: true,
      labor: true,
      accidental: true,
      water: false,
      priority: true,
      replacements: false,
    };

    const premiumCoverage: WarrantyCoverage = {
      defects: true,
      parts: true,
      labor: true,
      accidental: true,
      water: true,
      priority: true,
      replacements: true,
    };

    const lifetimeCoverage: WarrantyCoverage = {
      defects: true,
      parts: false,
      labor: false,
      accidental: false,
      water: false,
      priority: false,
      replacements: false,
    };

    // Create default warranty types
    const warrantyTypes = [
      {
        name: "Standard Warranty",
        description:
          "Basic warranty covering manufacturing defects. Includes parts and labor for repairs.",
        duration: 90, // 90 days
        coverage: JSON.parse(JSON.stringify(standardCoverage)),
      },
      {
        name: "Extended Warranty",
        description:
          "Extended coverage for manufacturing defects and some accidental damage. Includes parts and labor with priority support.",
        duration: 365, // 1 year
        coverage: JSON.parse(JSON.stringify(extendedCoverage)),
      },
      {
        name: "Premium Warranty",
        description:
          "Our best warranty covering manufacturing defects, accidental damage, and water damage. Includes priority support and all labor and parts.",
        duration: 730, // 2 years
        coverage: JSON.parse(JSON.stringify(premiumCoverage)),
      },
      {
        name: "Lifetime Warranty",
        description:
          "Limited lifetime warranty covering manufacturing defects only. Does not expire.",
        duration: 0, // No expiration (0 months)
        coverage: JSON.parse(JSON.stringify(lifetimeCoverage)),
      },
    ];

    for (const type of warrantyTypes) {
      await prisma.warrantyType.create({
        data: type,
      });
    }

    revalidatePath("/dashboard/warranty/types");

    return {
      success: true,
      message: "Created 4 default warranty types successfully",
      wasSeeded: true,
    };
  } catch (error) {
    console.error("Error seeding warranty types:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      wasSeeded: false,
    };
  }
}
