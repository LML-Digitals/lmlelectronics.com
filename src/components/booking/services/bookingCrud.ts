"use server";
import prisma from "@/lib/prisma";
import type {
  DeviceTypeWithBrands,
  RepairOption,
} from "../types/bookingFormTypes";

export const getDeviceTypes = async () => {
  try {
    const deviceTypes = await prisma.deviceType.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return deviceTypes;
  } catch (error) {
    console.error("Error fetching device types:", error);
    throw new Error("Failed to fetch device types");
  }
};

export const getBrandsForDeviceType = async (deviceTypeId: string) => {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        deviceTypeId: deviceTypeId,
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: {
        order: "asc",
      },
    });
    return brands;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw new Error("Failed to fetch brands");
  }
};

export const getBrandsNames = async (): Promise<string[]> => {
  try {
    const brands = await prisma.brand.findMany({
      select: {
        name: true,
      },
      orderBy: {
        order: "asc",
      },
    });
    return brands.map((brand) => brand.name);
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw new Error("Failed to fetch brands");
  }
};

export const getBookingSeries = async (brandName: string) => {
  try {
    return await prisma.series.findMany({
      where: {
        brand: { name: brandName },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching series:", error);
    throw new Error("Failed to fetch series");
  }
};

export const getSeriesForBrandId = async (brandId: number) => {
  try {
    return await prisma.series.findMany({
      where: {
        brandId: brandId,
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching series:", error);
    throw new Error("Failed to fetch series");
  }
};

export const getBookingModels = async (seriesName: string) => {
  try {
    return await prisma.model.findMany({
      where: {
        series: { name: seriesName },
      },
      select: {
        id: true,
        name: true,
        image: true,
        description: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    throw new Error("Failed to fetch models");
  }
};

export const getModelsForSeriesId = async (seriesId: number) => {
  try {
    return await prisma.model.findMany({
      where: {
        seriesId: seriesId,
      },
      select: {
        id: true,
        name: true,
        image: true,
        description: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    throw new Error("Failed to fetch models");
  }
};

export const getRepairOptionsForModel = async (modelId: number) => {
  try {
    return await prisma.repairOption.findMany({
      where: {
        modelId: modelId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        labour: true,
        duration: true,
        repairType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching repair options:", error);
    throw new Error("Failed to fetch repair options");
  }
};

// Legacy methods - updated for new schema
export const getBookingTypeOfRepairs = async (modelName: string) => {
  try {
    const model = await prisma.model.findUnique({
      where: { name: modelName },
      select: { id: true },
    });

    if (!model) {
      return [];
    }

    const repairTypes = await prisma.repairType.findMany({
      where: {
        repairs: {
          some: {
            modelId: model.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        timeFrame: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return repairTypes;
  } catch (error) {
    console.error("Error fetching repair types:", error);
    throw new Error("Failed to fetch repair types");
  }
};

export const getBookingRepairs = async (typeOfRepairName: string) => {
  try {
    // Find the repairType ID first
    const repairType = await prisma.repairType.findUnique({
      where: { name: typeOfRepairName },
      select: { id: true },
    });

    if (!repairType) {
      return [];
    }

    // Then get all repair options with that repairTypeId
    return await prisma.repairOption.findMany({
      where: {
        repairTypeId: repairType.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        labour: true,
        duration: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching repairs:", error);
    throw new Error("Failed to fetch repairs");
  }
};

export async function getDeviceHierarchy(): Promise<DeviceTypeWithBrands[]> {
  try {
    const deviceTypesWithHierarchy = await prisma.deviceType.findMany({
      include: {
        brands: {
          include: {
            series: {
              include: {
                models: {
                  include: {
                    repairOptions: {
                      include: {
                        repairType: true, // Include repairType if it's part of RepairOption model
                      },
                      orderBy: {
                        name: "asc", // Optional: order repair options by name
                      },
                    },
                  },
                  orderBy: {
                    name: "asc", // Optional: order models by name
                  },
                },
              },
              orderBy: {
                name: "asc", // Optional: order series by name
              },
            },
          },
          orderBy: {
            name: "asc", // Optional: order brands by name
          },
        },
      },
      orderBy: {
        name: "asc", // Optional: order device types by name
      },
    });

    // Prisma types might be slightly different from our custom bookingFormTypes.
    // We need to map them. This is a simplified mapping, adjust as necessary.
    return deviceTypesWithHierarchy.map((dt) => ({
      ...dt,
      id: dt.id.toString(), // Ensure DeviceType ID is string if Prisma returns number
      brands: dt.brands.map((brand) => ({
        ...brand,
        series: brand.series.map((series) => ({
          ...series,
          models: series.models.map((model) => ({
            ...model,
            // Ensure repairOptions match the RepairOption type, especially price
            repairOptions: model.repairOptions.map((ro) => ({
              ...ro,
              id: ro.id.toString(), // Ensure RepairOption ID is string
              price: ro.price === null ? null : Number(ro.price), // Ensure price is number or null
              labour: ro.labour === null ? null : Number(ro.labour),
              // Map repairType if it exists and is needed
              repairType: ro.repairType
                ? { id: ro.repairType.id.toString(), name: ro.repairType.name }
                : undefined,
            })),
          })),
        })),
      })),
    })) as DeviceTypeWithBrands[]; // Assert type after mapping
  } catch (error) {
    console.error("Error fetching device hierarchy:", error);
    throw new Error("Failed to load device hierarchy.");
  }
}
