'use server';

import prisma from '@/lib/prisma';
import { Vendor } from '@prisma/client';
import { VendorAndItsInventoryItems } from '../types/inventoryTypes';

export const getVendors = async (): Promise<VendorAndItsInventoryItems[]> => {
  try {
    return await prisma.vendor.findMany({
      include: { inventoryItems: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching inventory vendors:', error);
    throw new Error('Failed to fetch inventory vendors');
  }
};

export const getVendorsNameAndId = async (): Promise<Vendor[]> => {
  try {
    return await prisma.vendor.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching inventory vendors:', error);
    throw new Error('Failed to fetch inventory vendors');
  }
};

export const getVendor = async (vendorId: number) => {
  try {
    return await prisma.vendor.findUnique({
      where: { id: vendorId },
    });
  } catch (error) {
    console.error('Error fetching inventory vendor:', error);
    throw new Error('Failed to fetch inventory vendor');
  }
};

type CreateVendorResponse = {
  vendor: Vendor;
  status: string;
};

// Todo: Function to create a new location
export const createVendor = async (data: {
  name: string;
}): Promise<CreateVendorResponse> => {
  const { name } = data;

  try {
    const createdVendor = await prisma.vendor.create({
      data: { name },
    });

    return { status: 'success', vendor: createdVendor };
  } catch (error) {
    console.error('Error creating inventory vendor:');
    throw new Error('Failed to create inventory vendor');
  }
};

type UpdateVendorInputs = {
  name: string;
};

type UpdateVendorResponse = {
  status: string;
};

export const updateVendor = async (
  vendorId: number,
  data: UpdateVendorInputs,
): Promise<UpdateVendorResponse> => {
  try {
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...data,
      },
    });

    return { status: 'success' };
  } catch (error) {
    return { status: 'error' };
  }
};

export type DeleteLocationCrud = {
  status: string;
  message: string;
};

export const deleteVendorById = async (vendorId: number): Promise<DeleteLocationCrud> => {
  try {
    const existingVendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!existingVendor) {
      throw new Error('vendor Not found');
    }

    await prisma.vendor.delete({
      where: { id: vendorId },
    });

    return { status: 'success', message: 'Vendor Successfully Deleted' };
  } catch (error) {
    throw new Error('Failed to Delete vendor');
  }
};
