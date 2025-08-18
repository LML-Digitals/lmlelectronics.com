'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Types
export type Tag = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TagFormData = {
  name: string;
  description?: string;
  color?: string;
};

// Create a new tag
export async function createTag (formData: TagFormData): Promise<{ success: boolean; message: string; tag?: Tag }> {
  try {
    // Validate input
    if (!formData.name || formData.name.trim() === '') {
      return { success: false, message: 'Tag name is required' };
    }

    // Check if tag with same name already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: formData.name.trim() },
    });

    if (existingTag) {
      return { success: false, message: 'A tag with this name already exists' };
    }

    // Create the tag
    const tag = await prisma.tag.create({
      data: {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        color: formData.color || null,
      },
    });

    revalidatePath('/dashboard/tags');

    return { success: true, message: 'Tag created successfully', tag };
  } catch (error) {
    console.error('Error creating tag:', error);

    return { success: false, message: 'Failed to create tag' };
  }
}

// Get all tags with pagination and optional filters
export async function getTags (options?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ tags: Tag[]; totalCount: number; totalPages: number }> {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;
  const search = options?.search || '';

  try {
    const where = search
      ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }
      : {};

    const [tags, totalCount] = await Promise.all([
      prisma.tag.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.tag.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return { tags, totalCount, totalPages };
  } catch (error) {
    console.error('Error fetching tags:', error);

    return { tags: [], totalCount: 0, totalPages: 0 };
  }
}

// Get a single tag by ID
export async function getTagById (tagId: string): Promise<Tag | null> {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    return tag;
  } catch (error) {
    console.error('Error fetching tag:', error);

    return null;
  }
}

// Update a tag
export async function updateTag (
  tagId: string,
  formData: TagFormData,
): Promise<{ success: boolean; message: string; tag?: Tag }> {
  try {
    // Validate input
    if (!formData.name || formData.name.trim() === '') {
      return { success: false, message: 'Tag name is required' };
    }

    // Check if tag with same name already exists (excluding current tag)
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: formData.name.trim(),
        id: { not: tagId },
      },
    });

    if (existingTag) {
      return { success: false, message: 'A tag with this name already exists' };
    }

    // Update the tag
    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        color: formData.color || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/dashboard/tags');

    return { success: true, message: 'Tag updated successfully', tag };
  } catch (error) {
    console.error('Error updating tag:', error);

    return { success: false, message: 'Failed to update tag' };
  }
}

// Delete a tag
export async function deleteTag (tagId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if tag is used by any related entities
    const [
      blogsCount,
      inventoryItemsCount,
      repairGuidesCount,
      // uploadedImagesCount,
    ] = await Promise.all([
      prisma.blog.count({
        where: {
          tags: {
            some: {
              id: tagId,
            },
          },
        },
      }),
      prisma.inventoryItem.count({
        where: {
          tags: {
            some: {
              id: tagId,
            },
          },
        },
      }),
      prisma.repairGuide.count({
        where: {
          tags: {
            some: {
              id: tagId,
            },
          },
        },
      }),
      // prisma.uploadedImage.count({
      //   where: {
      //     tagId: tagId,
      //   },
      // }),
    ]);

    const totalUsages
      = blogsCount
      + inventoryItemsCount
      + repairGuidesCount;
      // uploadedImagesCount;

    if (totalUsages > 0) {
      return {
        success: false,
        message: `Cannot delete this tag as it's being used in ${totalUsages} item(s).`,
      };
    }

    // Delete the tag
    await prisma.tag.delete({
      where: { id: tagId },
    });

    revalidatePath('/dashboard/tags');

    return { success: true, message: 'Tag deleted successfully' };
  } catch (error) {
    console.error('Error deleting tag:', error);

    return { success: false, message: 'Failed to delete tag' };
  }
}

// Get tag usage statistics
export async function getTagUsageStats (tagId: string): Promise<{
  blogsCount: number;
  inventoryItemsCount: number;
  repairGuidesCount: number;
  // uploadedImagesCount: number;
  totalUsages: number;
}> {
  try {
    const [
      blogsCount,
      inventoryItemsCount,
      repairGuidesCount,
      // uploadedImagesCount,
    ] = await Promise.all([
      prisma.blog.count({
        where: {
          tags: {
            some: {
              id: tagId,
            },
          },
        },
      }),
      prisma.inventoryItem.count({
        where: {
          tags: {
            some: {
              id: tagId,
            },
          },
        },
      }),
      prisma.repairGuide.count({
        where: {
          tags: {
            some: {
              id: tagId,
            },
          },
        },
      }),
      // prisma.uploadedImage.count({
    //     where: {
    //       tagId: tagId,
    //     },
    //   }),
    ]);

    const totalUsages
      = blogsCount
      + inventoryItemsCount
      + repairGuidesCount;
      // uploadedImagesCount;

    return {
      blogsCount,
      inventoryItemsCount,
      repairGuidesCount,
      // uploadedImagesCount,
      totalUsages,
    };
  } catch (error) {
    console.error('Error getting tag usage stats:', error);

    return {
      blogsCount: 0,
      inventoryItemsCount: 0,
      repairGuidesCount: 0,
      // uploadedImagesCount: 0,
      totalUsages: 0,
    };
  }
}
