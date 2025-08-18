'use server';

import { ChartDataResponse } from './chartDataServices';
import prisma from '@/lib/prisma';
import {
  InventoryPurchaseOrder,
  Vendor,
  PurchaseOrderStatus,
} from '@prisma/client';

// Types for supplier performance
export type SupplierPerformanceData = Array<{
  id: number;
  name: string;
  leadTime: number;
  onTimeDelivery: number;
  priceIndex: number;
  quality: number;
  performance: number;
  orderCount: number;
  totalSpent: number;
}>;

// Type for supplier with purchase orders
type SupplierWithPurchaseOrders = Vendor & {
  purchaseOrders: (InventoryPurchaseOrder & {
    items: any[];
  })[];
};

// Type for radar chart data
export type RadarChartData = Array<{
  metric: string;
  ideal: number;
  [key: string]: number | string;
}>;

// Type for bar chart comparison data
export type BarChartData = Array<{
  metric: string;
  [key: string]: string | number;
}>;

// Type for scatter plot data
export type ScatterData = Array<{
  name: string;
  quality: number;
  price: number;
  orderCount: number;
}>;

// Type for supplier comparison data
export type SupplierComparisonData = {
  suppliers: string[];
  radarData: RadarChartData;
  barData: BarChartData;
  scatterData: ScatterData;
};

// Fetch actual supplier data and calculate performance metrics
export async function getSupplierPerformanceData (timeRange: string): Promise<ChartDataResponse> {
  try {
    // Fetch all suppliers from the database
    const suppliers = await prisma.vendor.findMany({
      include: {
        purchaseOrders: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!suppliers || suppliers.length === 0) {
      return {
        success: false,
        error: 'No suppliers found',
      };
    }

    // Calculate time range filter (for filtering purchase orders)
    const today = new Date();
    let startDate = new Date();

    switch (timeRange) {
    case '30days':
      startDate.setDate(today.getDate() - 30);
      break;
    case '90days':
      startDate.setDate(today.getDate() - 90);
      break;
    case '12months':
      startDate.setMonth(today.getMonth() - 12);
      break;
    case 'all':
      startDate = new Date(0); // Beginning of time
      break;
    default:
      startDate.setDate(today.getDate() - 90); // Default to 90 days
    }

    // Transform database data to performance metrics
    const performanceData: SupplierPerformanceData = suppliers.map((supplier: SupplierWithPurchaseOrders) => {
      // Filter purchase orders to the selected time range
      const relevantOrders = supplier.purchaseOrders.filter((order) => order.orderDate && new Date(order.orderDate) >= startDate);

      // Calculate order count
      const orderCount = relevantOrders.length;

      // Calculate total spent across purchase orders
      const totalSpent = relevantOrders.reduce(
        (sum, order) => sum + (order.totalCost || 0),
        0,
      );

      // Calculate on-time delivery rate
      const ordersWithDeliveryData = relevantOrders.filter((order) => order.expectedArrivalDate
            && order.status === PurchaseOrderStatus.RECEIVED);

      let onTimeDelivery = 75; // Default value if no data

      if (ordersWithDeliveryData.length > 0) {
        const onTimeOrders = ordersWithDeliveryData.filter((order) => {
          // Check if shipment arrived by expected date
          if (!order.expectedArrivalDate) { return false; }

          // We don't have actual delivery date in our model, so using status transition as estimate
          return order.status === PurchaseOrderStatus.RECEIVED;
        });

        onTimeDelivery = Math.round((onTimeOrders.length / ordersWithDeliveryData.length) * 100);
      }

      // Use stored lead time if available, otherwise calculate from orders
      let leadTime = supplier.leadTime || 0;

      if (leadTime <= 0 && relevantOrders.length > 0) {
        // If we don't have a stored lead time, calculate average from orders
        let totalDays = 0;
        let ordersWithDates = 0;

        relevantOrders.forEach((order) => {
          // Calculate days between order and expected arrival
          if (order.expectedArrivalDate && order.orderDate) {
            const orderDate = new Date(order.orderDate);
            const expectedDate = new Date(order.expectedArrivalDate);
            const diffTime = Math.abs(expectedDate.getTime() - orderDate.getTime());

            totalDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            ordersWithDates++;
          }
        });

        leadTime
            = ordersWithDates > 0 ? Math.round(totalDays / ordersWithDates) : 7;
      }

      if (leadTime <= 0) { leadTime = 7; } // Ensure we have a reasonable default

      // Price index and quality require more complex calculations from historical data
      // For now, use placeholder calculations until we have more data points

      // Price index: compare to average cost across all suppliers (1.0 = average)
      const priceIndex = supplier.id ? 1.0 : 1.0; // Placeholder - in a real app, compare against market average

      // Quality score (based on supplier rating if available)
      const quality = supplier.rating ? Math.round(supplier.rating * 20) : 80; // Convert 0-5 rating to 0-100 scale

      // Calculate weighted performance score
      const performance = Math.round((100 - Math.min(leadTime, 100)) * 0.2 // Lower lead time is better (cap at 100)
            + onTimeDelivery * 0.3 // Higher on-time delivery is better
            + (2 - priceIndex) * 50 * 0.25 // Lower price index is better
            + quality * 0.25, // Higher quality is better
      );

      return {
        id: supplier.id,
        name: supplier.name,
        leadTime,
        onTimeDelivery,
        priceIndex,
        quality,
        performance,
        orderCount,
        totalSpent,
      };
    });

    return {
      success: true,
      data: performanceData,
    };
  } catch (error) {
    console.error('Error fetching supplier performance data:', error);

    return {
      success: false,
      error: 'Failed to fetch supplier performance data',
    };
  }
}

// Generate comparison data for radar charts and other visualizations
export async function getSupplierComparisonData (): Promise<
  ChartDataResponse<SupplierComparisonData>
  > {
  try {
    // Get supplier performance data
    const result = await getSupplierPerformanceData('90days'); // Default to last quarter

    if (!result.success || !result.data) {
      return {
        success: false,
        error: 'Failed to fetch supplier performance data for comparison',
      };
    }

    // Sort by performance and take top 5
    const supplierData = result.data;
    const topSuppliers: string[] = supplierData
      .sort((
        a: SupplierPerformanceData[number],
        b: SupplierPerformanceData[number],
      ) => b.performance - a.performance)
      .slice(0, Math.min(5, supplierData.length)) // Take at most 5 suppliers
      .map((s: SupplierPerformanceData[number]) => s.name);

    if (topSuppliers.length === 0) {
      return {
        success: false,
        error: 'No suppliers available for comparison',
      };
    }

    // Create radar chart data format from actual metrics
    const radarData: RadarChartData = [
      { metric: 'Lead Time', ideal: 100 },
      { metric: 'On-Time Delivery', ideal: 100 },
      { metric: 'Price Competitiveness', ideal: 100 },
      { metric: 'Quality', ideal: 100 },
      { metric: 'Responsiveness', ideal: 100 },
    ];

    // Fill radar data from supplier metrics
    topSuppliers.forEach((supplierName) => {
      // Find the supplier from supplier data
      const supplier: SupplierPerformanceData[number] | undefined
        = supplierData.find((s: SupplierPerformanceData[number]) => s.name === supplierName);

      if (supplier) {
        // Lead time: convert to scale where lower is better (100 - percentage of max lead time)
        const maxLeadTime = 30; // Consider 30 days as maximum lead time
        const leadTimeScore = Math.max(
          0,
          Math.min(100, 100 - (supplier.leadTime / maxLeadTime) * 100),
        );

        radarData[0][supplierName] = leadTimeScore;
        radarData[1][supplierName] = supplier.onTimeDelivery; // Already a percentage
        radarData[2][supplierName] = (2 - supplier.priceIndex) * 50; // Convert to 0-100 scale
        radarData[3][supplierName] = supplier.quality; // Already a percentage
        radarData[4][supplierName] = supplier.performance; // Use overall performance for responsiveness
      }
    });

    // Bar comparison data
    const barData: BarChartData = [
      { metric: 'Avg. Lead Time (days)' },
      { metric: 'On-Time Delivery (%)' },
      { metric: 'Price Index' },
      { metric: 'Quality Score (%)' },
      { metric: 'Overall Performance' },
    ];

    // Add data for each top supplier
    supplierData
      .filter((supplier: SupplierPerformanceData[number]) => topSuppliers.includes(supplier.name))
      .forEach((supplier: SupplierPerformanceData[number]) => {
        barData[0][supplier.name] = supplier.leadTime;
        barData[1][supplier.name] = supplier.onTimeDelivery;
        barData[2][supplier.name] = supplier.priceIndex * 100;
        barData[3][supplier.name] = supplier.quality;
        barData[4][supplier.name] = supplier.performance;
      });

    // Scatter plot data (price vs quality)
    const scatterData: ScatterData = supplierData.map((supplier: SupplierPerformanceData[number]) => ({
      name: supplier.name,
      quality: supplier.quality,
      price: supplier.priceIndex * 100,
      orderCount: supplier.orderCount,
    }));

    const comparisonData: SupplierComparisonData = {
      suppliers: topSuppliers,
      radarData,
      barData,
      scatterData,
    };

    return {
      success: true,
      data: comparisonData,
    };
  } catch (error) {
    console.error('Error generating supplier comparison data:', error);

    return {
      success: false,
      error: 'Failed to generate supplier comparison data',
    };
  }
}

// Also update the ChartDataResponse type in chartDataServices.ts to support generics
declare module './chartDataServices' {
  export interface ChartDataResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
  }
}
