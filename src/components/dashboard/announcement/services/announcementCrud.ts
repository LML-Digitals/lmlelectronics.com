'use server';

import prisma from '@/lib/prisma';
import { Announcement } from '@prisma/client';
import { PartialBy } from '@/types/type';

export const getAnnouncement = async (): Promise<Announcement[]> => {
  try {
    return await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    throw new Error('Failed to fetch Announcement');
  }
};

export const createAnnouncement = async (announcementData: PartialBy<Announcement, 'id'>) => {
  try {
    const { isActive, buttonText, buttonLink, ...dataWithoutIsActive }
      = announcementData;
    const createdAnnouncement = await prisma.announcement.create({
      data: {
        ...dataWithoutIsActive,
        buttonText: buttonText ?? null,
        buttonLink: buttonLink ?? null,
        isActive: isActive ?? false,
      },
    });

    if (isActive) {
      await prisma.announcement.updateMany({
        where: {
          id: { not: createdAnnouncement.id },
        },
        data: {
          isActive: false,
        },
      });
    }
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw new Error('Failed to create announcement');
  }
};

export const updateAnnouncement = async (
  announcementId: number,
  updatedData: PartialBy<Announcement, 'id'>,
) => {
  try {
    // First, update the target announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: updatedData,
    });

    // Only update other announcements' isActive status if this one is being set to active
    if (updatedData.isActive === true) {
      await prisma.announcement.updateMany({
        where: {
          id: { not: announcementId },
        },
        data: {
          isActive: false,
        },
      });
    }

    return await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error updating Announcement:', error);
    throw new Error('Failed to update Announcement');
  }
};

export const deleteAnnouncement = async (announcementId: number) => {
  try {
    await prisma.announcement.delete({
      where: {
        id: announcementId,
      },
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
  } finally {
    await prisma.$disconnect();
  }
};
