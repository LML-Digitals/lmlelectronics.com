'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { CommissionRate, Staff } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/config/authOptions';
import { getStaffAnalyticsData } from './staffAnalytics';

export const getStaffs = async (): Promise<
  (Staff & { commissionRate: CommissionRate | null })[]
> => {
  try {
    const staffs = await prisma.staff.findMany({
      include: { commissionRate: true },
      orderBy: { firstName: 'asc' },
    });

    return staffs.map((staff) => ({
      ...staff,
      commissionRate: staff.commissionRate || null,
    }));
  } catch (error) {
    console.error('Error fetching staffs:', error);
    throw new Error('Failed to fetch staffs');
  }
};

export const getAllHashKey = async (): Promise<Staff[]> => {
  try {
    return await prisma.staff.findMany({
      where: {
        hashKey: {
          not: null,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching staffs:', error);
    throw new Error('Failed to fetch staffs');
  }
};

export const changePassword = async (id: string, password: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.staff.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  } catch (error) {
    console.error('Error changing password:', error);

    return { error: 'Failed to change password' };
  }
};

export const getStaffByEmail = async (email: string): Promise<Staff | null> => {
  try {
    const staff = await prisma.staff.findFirst({
      where: { email },
    });

    return staff;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw new Error('Failed to fetch staff');
  }
};

export const getStaff = async (email: string): Promise<Staff> => {
  try {
    const staff = await prisma.staff.findFirst({
      where: { email },
      include: {
        tickets: true,
        ticketComments: true,
        sessions: true,
        notes: true,
        commissionRate: true,
      },
    });

    if (!staff) {
      throw new Error('Staff not found');
    }

    return staff;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw new Error('Failed to fetch staff');
  }
};

export const getStaffById = async (id: string): Promise<Staff> => {
  try {
    const staff = await prisma.staff.findFirst({
      where: { id },
      include: {
        tickets: {
          include: {
            repairDevices: true,
            location: true,
          },
        },
        ticketComments: true,
        sessions: true,
        commissionRate: true,
      },
    });

    if (!staff) {
      throw new Error('Staff not found');
    }

    return staff;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw new Error('Failed to fetch staff');
  }
};

/**
 * Get staff with specified relations
 * Replaces the /api/staff/[id] endpoint
 */
export const getStaffWithRelations = async (
  id: string,
  includeParams: string[] = [],
  sessionUserId?: string,
  userRole?: string,
) => {
  try {
    // Security check
    if (id !== sessionUserId && userRole !== 'admin') {
      return { error: 'Forbidden', status: 403 };
    }

    // Process include parameters
    const include: Record<string, any> = {
      commissionRate: false,
      payrolls: false,
      tickets: false,
      // schedules relation removed - using Workforce Management instead
    };

    includeParams.forEach((param) => {
      if (param === 'payrolls') {
        include[param] = {
          orderBy: { payPeriodEnd: 'desc' },
        };
      } else if (['commissionRate', 'tickets'].includes(param)) {
        include[param] = true;
      }
    });

    // Fetch staff data with requested relations
    const staff = await prisma.staff.findUnique({
      where: { id },
      include,
    });

    if (!staff) {
      return { error: 'Staff not found', status: 404 };
    }

    return { data: staff, status: 200 };
  } catch (error) {
    console.error('Error fetching staff data:', error);

    return { error: 'Internal server error', status: 500 };
  }
};

export async function generateHashKey ({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  const hashKey = uuidv4();
  const hashKeyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    await prisma.staff.create({
      data: {
        email,
        role,
        hashKey,
        hashKeyExpires,
        isActive: false,
      },
    });

    // Send email to staff with signup link
    // const res = await sendStaffSignupEmail(email, hashKey);
    return { message: 'Hash key generated successfully' };
  } catch (error) {
    return { error: 'Failed to generate Hash Key' };
  }
}

export async function getTechnicians () {
  try {
    const staff = await prisma.staff.findMany({
      select: {
        id: true,
        firstName: true,
      },
    });

    return staff;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw new Error('Failed to fetch technicians');
  }
}

export async function getTechniciansNameAndId () {
  try {
    const staff = await prisma.staff.findMany({
      select: { id: true, firstName: true, lastName: true },
    });

    return staff;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw new Error('Failed to fetch technicians');
  }
}

export const createStaff = async (staffData: Partial<Staff>) => {
  try {
    if (!staffData.password) {
      throw new Error('Password is required');
    }
    if (!staffData.email) {
      throw new Error('Email is required');
    }
    const hashedPassword = await bcrypt.hash(staffData.password, 10);

    return await prisma.staff.create({
      data: {
        ...staffData,
        password: hashedPassword,
        email: staffData.email,
        role: staffData.role || '',
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    throw new Error('Failed to create staff');
  }
};

export const updateStaff = async (
  id: string,
  data: Partial<Staff & { commissionRate?: number }>,
) => {
  try {
    const staff = await prisma.staff.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        role: data.role,
        jobTitle: data.jobTitle,
        paymentType: data.paymentType,
        baseSalary: data.baseSalary,
        ...(data.commissionRate !== undefined && {
          commissionRate: {
            upsert: {
              create: {
                repairPercentage: data.commissionRate,
              },
              update: {
                repairPercentage: data.commissionRate,
              },
            },
          },
        }),
      },
    });

    return { success: true, data: staff };
  } catch (error) {
    console.error('Error updating staff:', error);
    throw new Error('Failed to update staff');
  }
};

export const deleteStaff = async (id: string) => {
  try {
    await prisma.staff.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete staff');
  }
};

export type StaffAnalytics = {
  totalStaff: number;
  roleDistribution: {
    role: string;
    _count: {
      role: number;
    };
  }[];
  availabilityDistribution: {
    availability: string;
    _count: number;
  }[];
  experienceMetrics: {
    name: string;
    experienceYears: number;
    notesCount: number;
  }[];
  performanceMetrics: {
    id: string;
    name: string;
    ticketsHandled: number;
    comments: number;
  }[];
};

export async function getStaffAnalytics (): Promise<any> {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role;

    const result = await getStaffAnalyticsData(userRole);

    if (result.status !== 200 || result.error) {
      throw new Error(result.error || 'Failed to fetch staff analytics');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching staff analytics:', error);
    throw error;
  }
}
