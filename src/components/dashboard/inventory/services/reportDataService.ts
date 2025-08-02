'use server';

import prisma from '@/lib/prisma';

export interface LocationData {
  id: string;
  name: string;
}

export interface CategoryData {
  id: string;
  name: string;
}

export interface SupplierData {
  id: number;
  name: string;
}

export interface DataResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getLocationsForReports(): Promise<
  DataResponse<LocationData[]>
> {
  try {
    const locations = await prisma.storeLocation.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      data: locations.map((loc) => ({
        id: loc.id.toString(),
        name: loc.name,
      })),
    };
  } catch (error) {
    console.error('Error fetching locations:', error);
    return { success: false, error: 'Failed to fetch locations' };
  }
}

export async function getCategoriesForReports(): Promise<
  DataResponse<CategoryData[]>
> {
  try {
    const categories = await prisma.inventoryItemCategory.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
      })),
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

export async function getSuppliersForReports(): Promise<
  DataResponse<SupplierData[]>
> {
  try {
    const suppliers = await prisma.vendor.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      success: true,
      data: suppliers.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
      })),
    };
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return { success: false, error: 'Failed to fetch suppliers' };
  }
}

// Helper function to fetch all data needed for the form at once
export async function getAllReportFormData(): Promise<{
  locations: DataResponse<LocationData[]>;
  categories: DataResponse<CategoryData[]>;
  suppliers: DataResponse<SupplierData[]>;
}> {
  const [locationsResult, categoriesResult, suppliersResult] =
    await Promise.all([
      getLocationsForReports(),
      getCategoriesForReports(),
      getSuppliersForReports(),
    ]);

  return {
    locations: locationsResult,
    categories: categoriesResult,
    suppliers: suppliersResult,
  };
}
