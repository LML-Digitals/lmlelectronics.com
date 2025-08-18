'use server';

import prisma from '@/lib/prisma';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { getComprehensiveAnalytics } from '@/components/dashboard/analytics/services/analytics';

// Type definitions
export type DashboardData = {
  totalRevenue: number;
  activeRepairs: number;
  repairCompletionRate: number;
  inventoryCount: number;
  inventoryValue: number;
  lowStockCount: number;
  activeCustomers: number;
  newCustomers: number;
  repairDivisionPercent: number;
  serviceDivisionPercent: number;
  salesDivisionPercent: number;
  revenueChange: number;
  pendingTickets: number;
  activeTickets: number;
  openNotifications: number;
  bookingCount: number;
  bookingSchedule: number;
  quoteCount: number;
};

export type LowStockItem = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minThreshold: number;
  locationName: string;
};

export type RecentSale = {
  id: string;
  date: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  status: string;
  items?: string;
};

export type RecentTicket = {
  id: string;
  code: string;
  customer: string;
  status: string;
  createdAt: string;
  service: string;
  deviceInfo: string;
  priority: boolean;
};

export type Announcement = {
  id: number;
  title: string;
  message: string;
  date: string;
};

/**
 * Fetches dashboard data for KPIs based on the given date range
 */
export async function getDashboardData (
  startDate: Date,
  endDate: Date,
): Promise<DashboardData> {
  try {
    // Use comprehensive analytics service for data
    const analyticsData = await getComprehensiveAnalytics(
      'custom',
      startDate,
      endDate,
    );

    // Get active tickets count
    const activeTickets = await prisma.ticket.count({
      where: {
        status: {
          notIn: ['DONE', 'CANCELLED'],
        },
      },
    });

    const pendingTickets = await prisma.ticket.count({
      where: {
        status: {
          not: 'DONE',
        },
      },
    });

    // Get open notifications count
    const openNotifications = await prisma.notification.count({
      where: {
        isRead: false,
      },
    });

    // Get inventory counts
    const inventoryCount = await prisma.inventoryVariation.count({
      where: { visible: true },
    });

    const lowStockCount = await prisma.inventoryStockLevel.count({
      where: { stock: { lte: 5 } },
    });

    // Get customer metrics
    const activeCustomers = await prisma.customer.count({
      where: { isActive: true },
    });

    const newCustomers = await prisma.customer.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const bookingCount = await prisma.booking.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const bookingSchedule = await prisma.booking.count({
      where: {
        status: 'SCHEDULED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const quoteCount = await prisma.quote.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const inventoryItems = await prisma.inventoryItem.findMany({
      include: {
        categories: true,
        variations: true,
      },
    });

    const totalValue = inventoryItems.reduce((sum: number, item: any) => {
      const variationsTotal = item.variations.reduce(
        (varSum: number, variation: any) => varSum + variation.sellingPrice,
        0,
      );

      return sum + variationsTotal;
    }, 0);

    // Extract data from comprehensive analytics
    return {
      totalRevenue: analyticsData.businessMetrics?.totalRevenue || 0,
      activeRepairs: analyticsData.repairs?.tickets?.pending || 0,
      repairCompletionRate: analyticsData.repairs?.tickets?.completionRate
        ? parseFloat(analyticsData.repairs.tickets.completionRate)
        : 0,
      inventoryCount,
      inventoryValue: totalValue,
      lowStockCount,
      activeCustomers,
      newCustomers,
      repairDivisionPercent:
        analyticsData.businessMetrics?.serviceDistribution?.repairs || 0,
      serviceDivisionPercent:
        analyticsData.businessMetrics?.serviceDistribution?.serviceDivision
        || 0,
      salesDivisionPercent:
        analyticsData.businessMetrics?.serviceDistribution?.salesDivision || 0,
      revenueChange: analyticsData.financial?.trends?.incomeChange || 0,
      pendingTickets,
      activeTickets,
      openNotifications,
      bookingCount,
      bookingSchedule,
      quoteCount,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);

    return {
      totalRevenue: 0,
      activeRepairs: 0,
      repairCompletionRate: 0,
      inventoryCount: 0,
      inventoryValue: 0,
      lowStockCount: 0,
      activeCustomers: 0,
      newCustomers: 0,
      repairDivisionPercent: 0,
      serviceDivisionPercent: 0,
      salesDivisionPercent: 0,
      revenueChange: 0,
      pendingTickets: 0,
      activeTickets: 0,
      openNotifications: 0,
      bookingCount: 0,
      bookingSchedule: 0,
      quoteCount: 0,
    };
  }
}

/**
 * Fetches recent sales
 */
export async function getRecentSales (): Promise<RecentSale[]> {
  try {
    const sales = await prisma.order.findMany({
      take: 8,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            inventoryVariation: true,
          },
        },
        customer: true,
      },
    });

    return sales.map((sale) => {
      let itemDescription = '';

      if (sale.items.length > 0) {
        itemDescription = sale.items[0]?.inventoryVariation?.name || '' ;
      } else if (sale.items && sale.items.length > 0) {
        itemDescription = sale.items[0]?.inventoryVariation?.name || '';
        if (sale.items.length > 1) {
          itemDescription += ` +${sale.items.length - 1} more`;
        }
      }

      return {
        id: sale.id,
        date: format(sale.createdAt, 'MMM dd, yyyy'),
        customerName: `${sale.customer.firstName} ${sale.customer.lastName}`,
        total: sale.total,
        paymentMethod: sale.paymentMethod || '',
        status: sale.status,
        items: itemDescription,
      };
    });
  } catch (error) {
    console.error('Error fetching recent sales:', error);

    return [];
  }
}

/**
 * Fetches recent tickets
 */
export async function getRecentTickets (): Promise<RecentTicket[]> {
  try {
    const tickets = await prisma.ticket.findMany({
      take: 10,
      orderBy: [
        {
          priority: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
      include: {
        customer: true,
        repairDevices: {
          include: {
            repairOptions: true,
          },
        },
      },
    });

    return tickets.map((ticket) => {
      // Get device info from the first repair device if available
      const deviceInfo
        = ticket.repairDevices.length > 0
          ? `${ticket.repairDevices[0].brand} ${ticket.repairDevices[0].model}`
          : 'No device info';

      // Get repair type from booked repairs if available
      let service = ticket.bookingType;

      if (
        ticket.repairDevices.length > 0
        && ticket.repairDevices[0].repairOptions
        && ticket.repairDevices[0].repairOptions.length > 0
      ) {
        service = ticket.repairDevices[0].repairOptions[0].name || service;
      }

      return {
        id: ticket.id,
        code: ticket.code,
        customer: `${ticket.customer.firstName} ${ticket.customer.lastName}`,
        status: ticket.status,
        createdAt: format(ticket.createdAt, 'MMM dd, yyyy'),
        service,
        deviceInfo,
        priority: ticket.priority,
      };
    });
  } catch (error) {
    console.error('Error fetching recent tickets:', error);

    return [];
  }
}

/**
 * Fetches low stock items
 */
export async function getLowStockItems (): Promise<LowStockItem[]> {
  try {
    const stockLevels = await prisma.inventoryStockLevel.findMany({
      where: {
        stock: {
          lte: 5, // Define low stock threshold
        },
        location: {
          isActive: true,
        },
      },
      orderBy: {
        stock: 'asc',
      },
      include: {
        variation: {
          include: {
            inventoryItem: true,
          },
        },
        location: true,
      },
      take: 12,
    });

    return stockLevels.map((item) => ({
      id: item.id,
      name: item.variation.inventoryItem?.name
        ? `${item.variation.inventoryItem.name} - ${item.variation.name}`
        : item.variation.name,
      sku: item.variation.sku,
      stock: item.stock,
      minThreshold: 5, // Using the threshold we defined in the query
      locationName: item.location.name,
    }));
  } catch (error) {
    console.error('Error fetching low stock items:', error);

    return [];
  }
}

/**
 * Fetches system announcements
 */
export async function getSystemAnnouncements (): Promise<Announcement[]> {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    return announcements.map((announcement) => {
      // Format relative date
      const daysAgo = Math.floor((Date.now() - announcement.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      let date = 'Today';

      if (daysAgo === 1) {
        date = 'Yesterday';
      } else if (daysAgo > 1) {
        date = `${daysAgo} days ago`;
      }

      return {
        id: announcement.id,
        title:
          announcement.content.substring(0, 30)
          + (announcement.content.length > 30 ? '...' : ''),
        message: announcement.content,
        date,
      };
    });
  } catch (error) {
    console.error('Error fetching system announcements:', error);

    return [];
  }
}
