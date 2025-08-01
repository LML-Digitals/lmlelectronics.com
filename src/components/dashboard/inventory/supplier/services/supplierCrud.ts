'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema validation for supplier
const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  leadTime: z.number().optional().nullable(),
  rating: z.number().optional().nullable(),
  website: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

// Create a new supplier
export async function createSupplier(data: SupplierFormData) {
  try {
    const validatedData = supplierSchema.parse(data);
    const supplier = await prisma.vendor.create({
      data: validatedData,
    });
    revalidatePath('/dashboard/inventory/suppliers');
    return { success: true, data: supplier };
  } catch (error) {
    console.error('Failed to create supplier:', error);
    return { success: false, error: 'Failed to create supplier' };
  }
}

// Update an existing supplier
export async function updateSupplier(id: number, data: SupplierFormData) {
  try {
    const validatedData = supplierSchema.parse(data);
    const supplier = await prisma.vendor.update({
      where: { id },
      data: validatedData,
    });
    revalidatePath('/dashboard/inventory/suppliers');
    return { success: true, data: supplier };
  } catch (error) {
    console.error('Failed to update supplier:', error);
    return { success: false, error: 'Failed to update supplier' };
  }
}

// Delete a supplier
export async function deleteSupplier(id: number) {
  try {
    await prisma.vendor.delete({ where: { id } });
    revalidatePath('/dashboard/inventory/suppliers');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete supplier:', error);
    return { success: false, error: 'Failed to delete supplier' };
  }
}

// Get all suppliers
export async function getSuppliers() {
  try {
    return await prisma.vendor.findMany({
      include: {
        purchaseOrders: true,
        inventoryItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    return { success: false, error: 'Failed to fetch suppliers' };
  }
}

// Get a single supplier by ID
export async function getSupplierById(id: number) {
  try {
    const supplier = await prisma.vendor.findUnique({
      where: { id },
    });
    return { success: true, data: supplier };
  } catch (error) {
    console.error(`Failed to fetch supplier with ID ${id}:`, error);
    return { success: false, error: `Failed to fetch supplier with ID ${id}` };
  }
}
