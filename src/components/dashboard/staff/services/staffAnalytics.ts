'use server';

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/config/authOptions';

export async function getStaffAnalyticsData(userRole?: string) {
  try {
    // Security check - admin only
    if (userRole !== 'admin') {
      return {
        error: 'Unauthorized - Admin access required',
        status: 403,
      };
    }

    // Get total active staff count
    const totalStaff = await prisma.staff.count({
      where: { isActive: true },
    });

    // Get role distribution
    const roleDistribution = await prisma.staff.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
      where: { isActive: true },
    });

    // Get payment type distribution
    const paymentTypeDistribution = await prisma.staff.groupBy({
      by: ['paymentType'],
      _count: {
        paymentType: true,
      },
      where: { isActive: true },
    });

    // Get availability distribution
    const availabilityDistribution = await prisma.staff.groupBy({
      by: ['availability'],
      _count: {
        availability: true,
      },
      where: { isActive: true },
    });

    // Get staff performance metrics
    const staffPerformanceData = await prisma.staff.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        tickets: {
          select: {
            id: true,
            status: true,
            completionDate: true,
            createdAt: true,
          },
        },
        ticketComments: {
          select: {
            id: true,
          },
        },
      },
    });

    // Process performance metrics
    const performanceMetrics = staffPerformanceData.map((staff) => {
      const completedTickets = staff.tickets.filter(
        (ticket) => ticket.status === 'DONE'
      );
      const resolutionTimes = completedTickets
        .map((ticket) => {
          if (ticket.completionDate) {
            const created = new Date(ticket.createdAt);
            const completed = new Date(ticket.completionDate);
            return (completed.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
          }
          return null;
        })
        .filter(Boolean) as number[];

      const avgResolutionTime =
        resolutionTimes.length > 0
          ? resolutionTimes.reduce((sum, time) => sum + time, 0) /
            resolutionTimes.length
          : 0;

      return {
        id: staff.id,
        name: `${staff.firstName || ''} ${staff.lastName || ''}`.trim(),
        ticketsHandled: staff.tickets.length,
        ticketsCompleted: completedTickets.length,
        avgResolutionTime: avgResolutionTime.toFixed(1),
        comments: staff.ticketComments.length,
      };
    });

    // Get staff salary metrics
    const salaryData = await prisma.staff.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        paymentType: true,
        baseSalary: true,
        commissionRate: {
          select: {
            repairPercentage: true,
          },
        },
        payrolls: {
          select: {
            netPay: true,
            commissionAmount: true,
            payPeriodEnd: true,
          },
          orderBy: {
            payPeriodEnd: 'desc',
          },
          take: 3,
        },
      },
    });

    // Process salary metrics
    const salaryMetrics = salaryData.map((staff) => {
      const recentEarnings = staff.payrolls.reduce(
        (sum, payroll) => sum + payroll.netPay,
        0
      );
      const recentCommission = staff.payrolls.reduce(
        (sum, payroll) => sum + (payroll.commissionAmount || 0),
        0
      );

      return {
        id: staff.id,
        name: `${staff.firstName || ''} ${staff.lastName || ''}`.trim(),
        paymentType: staff.paymentType,
        baseSalary: staff.baseSalary || 0,
        commissionRate: staff.commissionRate?.repairPercentage || 0,
        recentEarnings,
        recentCommission,
        recentPayrollCount: staff.payrolls.length,
      };
    });

    // Get active sessions count
    const activeSessions = await prisma.session.count({
      where: {
        isActive: true,
        staff: {
          isActive: true,
        },
      },
    });

    // Return compiled analytics
    return {
      data: {
        totalStaff,
        roleDistribution,
        paymentTypeDistribution,
        availabilityDistribution,
        performanceMetrics,
        salaryMetrics,
        activeSessions,
        documentationCoverage: '82%', // Placeholder - could be calculated based on notes or documentation
        averageResponseTime: '4.2h', // Placeholder - could be calculated from ticket response times
      },
      status: 200,
    };
  } catch (error) {
    console.error('Error fetching staff analytics:', error);
    return {
      error: 'Internal server error',
      status: 500,
    };
  }
}
