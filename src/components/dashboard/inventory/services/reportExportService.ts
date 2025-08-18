'use server';

import prisma from '@/lib/prisma';
import { PurchaseOrderStatus } from '@prisma/client';

// Define interfaces for report types
export interface ReportFilters {
  reportType: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  locations?: string[];
  categories?: string[];
  suppliers?: number[];
  includeZeroStock?: boolean;
  groupBy?: 'none' | 'category' | 'location' | 'supplier';
}

export interface ReportResult {
  success: boolean;
  data?: any;
  error?: string;
  totalItems?: number;
  totalQuantity?: number;
  totalValue?: number;
}

// Generate inventory stock report
export async function generateInventoryStockReport (filters: ReportFilters): Promise<ReportResult> {
  try {
    // Build query based on filters
    const items = await prisma.inventoryItem.findMany({
      where: {
        ...(filters.categories && filters.categories.length > 0
          ? { categories: { some: { id: { in: filters.categories } } } }
          : {}),
        ...(filters.suppliers && filters.suppliers.length > 0
          ? { supplierId: { in: filters.suppliers } }
          : {}),
      },
      include: {
        categories: true,
        supplier: true,
        variations: {
          include: {
            stockLevels: {
              where: {
                location: {
                  isActive: true,
                },
                ...(filters.locations && filters.locations.length > 0
                  ? {
                    locationId: {
                      in: filters.locations.map((id) => parseInt(id)),
                    },
                  }
                  : {}),
              },
              include: {
                location: true,
              },
            },
          },
        },
      },
    });

    // Format data for report
    const reportData = items
      .flatMap((item) => {
        return item.variations.flatMap((variation) => {
          return variation.stockLevels.map((level) => ({
            id: variation.id,
            name: `${item.name} - ${variation.name}`,
            sku: variation.sku,
            category:
              item.categories.map((c) => c.name).join(', ') || 'Uncategorized',
            location: level.location.name,
            supplier: item.supplier?.name || 'Unknown',
            stock: level.stock,
            value: level.stock * (level.purchaseCost || 0),
          }));
        });
      })
      .filter((item) => {
        // Apply zero stock filter if needed
        if (!filters.includeZeroStock && item.stock === 0) {
          return false;
        }

        return true;
      });

    // Calculate totals
    const totalItems = reportData.length;
    const totalQuantity = reportData.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = reportData.reduce((sum, item) => sum + item.value, 0);

    return {
      success: true,
      data: reportData,
      totalItems,
      totalQuantity,
      totalValue,
    };
  } catch (error) {
    console.error('Error generating inventory stock report:', error);

    return {
      success: false,
      error: 'Failed to generate inventory stock report',
    };
  }
}

// Generate low stock report
export async function generateLowStockReport (
  filters: ReportFilters,
  threshold = 5,
): Promise<ReportResult> {
  try {
    // Similar to inventory stock report but filter for low stock
    const items = await prisma.inventoryItem.findMany({
      include: {
        categories: true,
        supplier: true,
        variations: {
          include: {
            stockLevels: {
              where: {
                stock: { lte: threshold },
                location: {
                  isActive: true,
                },
                ...(filters.locations && filters.locations.length > 0
                  ? {
                    locationId: {
                      in: filters.locations.map((id) => parseInt(id)),
                    },
                  }
                  : {}),
              },
              include: {
                location: true,
              },
            },
          },
        },
      },
      where: {
        ...(filters.categories && filters.categories.length > 0
          ? { categories: { some: { id: { in: filters.categories } } } }
          : {}),
        ...(filters.suppliers && filters.suppliers.length > 0
          ? { supplierId: { in: filters.suppliers } }
          : {}),
      },
    });

    // Format data for report - only include items with low stock levels
    const reportData = items.flatMap((item) => {
      return item.variations.flatMap((variation) => {
        if (variation.stockLevels.length === 0) { return []; }

        return variation.stockLevels.map((level) => ({
          id: variation.id,
          name: `${item.name} - ${variation.name}`,
          sku: variation.sku,
          category:
            item.categories.map((c) => c.name).join(', ') || 'Uncategorized',
          location: level.location.name,
          supplier: item.supplier?.name || 'Unknown',
          stock: level.stock,
          value: level.stock * (level.purchaseCost || 0),
          threshold: threshold,
        }));
      });
    });

    // Calculate totals
    const totalItems = reportData.length;
    const totalQuantity = reportData.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = reportData.reduce((sum, item) => sum + item.value, 0);

    return {
      success: true,
      data: reportData,
      totalItems,
      totalQuantity,
      totalValue,
    };
  } catch (error) {
    console.error('Error generating low stock report:', error);

    return {
      success: false,
      error: 'Failed to generate low stock report',
    };
  }
}

// Generate supplier report
export async function generateSupplierReport (filters: ReportFilters): Promise<ReportResult> {
  try {
    // Convert string dates to actual Date objects if needed
    const fromDate = new Date(filters.dateRange.from);
    const toDate = new Date(filters.dateRange.to);

    // Fetch suppliers with filters
    const suppliers = await prisma.vendor.findMany({
      where:
        filters.suppliers && filters.suppliers.length > 0
          ? { id: { in: filters.suppliers } }
          : undefined,
      include: {
        purchaseOrders: {
          where: {
            orderDate: {
              gte: fromDate,
              lte: toDate,
            },
          },
          include: {
            items: {
              include: {
                inventoryItem: true,
                inventoryVariation: true,
                location: true,
              },
            },
          },
        },
        inventoryItems: {
          include: {
            variations: {
              include: {
                stockLevels: {
                  include: {
                    location: true,
                  },
                  where:
                    filters.locations && filters.locations.length > 0
                      ? {
                        locationId: {
                          in: filters.locations.map((id) => {
                            // Handle possible parsing errors
                            const parsed = parseInt(id);

                            return isNaN(parsed) ? -1 : parsed; // Use -1 as fallback (which won't match)
                          }),
                        },
                      }
                      : undefined,
                },
              },
            },
          },
        },
      },
    });

    // Format supplier data for report view
    const reportData = suppliers.map((supplier) => {
      // Calculate metrics for this supplier
      const totalOrders = supplier.purchaseOrders.length;

      // Count completed orders
      const completedOrders = supplier.purchaseOrders.filter((order) => order.status === PurchaseOrderStatus.RECEIVED).length;

      const totalItems = supplier.purchaseOrders.reduce(
        (sum, order) => sum + order.items.length,
        0,
      );

      const totalSpent = supplier.purchaseOrders.reduce(
        (sum, order) => sum + order.totalCost,
        0,
      );

      // Count inventory items supplied by this supplier
      const inventoryItemCount = supplier.inventoryItems.length;

      // Calculate total stock of items from this supplier
      let totalStock = 0;
      let totalStockValue = 0;

      supplier.inventoryItems.forEach((item) => {
        item.variations.forEach((variation) => {
          variation.stockLevels.forEach((level) => {
            totalStock += level.stock;
            totalStockValue += level.stock * (level.purchaseCost || 0);
          });
        });
      });

      // Format supplier data for report view
      return {
        id: supplier.id,
        name: supplier.name,
        category: 'Supplier', // For table display
        location: supplier.address || 'Not provided',
        supplier: supplier.name,
        stock: totalStock,
        value: totalStockValue,
        contactName: supplier.contactName || 'Not provided',
        contactEmail: supplier.contactEmail || 'Not provided',
        contactPhone: supplier.contactPhone || 'Not provided',
        leadTime: supplier.leadTime || 'Not specified',
        rating: supplier.rating || 0,
        totalOrders,
        completedOrders,
        totalItems,
        totalSpent,
        inventoryItemCount,
        website: supplier.website || 'Not provided',
        notes: supplier.notes || '',
      };
    });

    // Calculate totals for the report
    const totalSuppliers = reportData.length;
    const totalItemsAcrossSuppliers = reportData.reduce(
      (sum, s) => sum + (s.totalItems || 0),
      0,
    );
    const totalSpentAcrossSuppliers = reportData.reduce(
      (sum, s) => sum + (s.totalSpent || 0),
      0,
    );

    return {
      success: true,
      data: reportData,
      totalItems: totalSuppliers,
      totalQuantity: totalItemsAcrossSuppliers,
      totalValue: totalSpentAcrossSuppliers,
    };
  } catch (error) {
    console.error('Error generating supplier report:', error);

    return {
      success: false,
      error: 'Failed to generate supplier report',
    };
  }
}

// Export the report to the specified format
export async function exportReport (
  reportData: any,
  format: string,
): Promise<ReportResult> {
  try {
    // Validate supported formats
    if (format !== 'csv' && format !== 'pdf') {
      return {
        success: false,
        error: "Unsupported export format. Please use 'csv' or 'pdf'.",
      };
    }

    // Extract just the data array if it's in a wrapper object
    const dataToExport = Array.isArray(reportData)
      ? reportData
      : reportData.data && Array.isArray(reportData.data)
        ? reportData.data
        : [reportData];

    if (format === 'csv') {
      // Generate CSV content
      const headers
        = dataToExport.length > 0 ? Object.keys(dataToExport[0]) : [];

      let csvContent = `${headers.join(',')}\n`;

      dataToExport.forEach((item: any) => {
        const row = headers.map((header) => {
          // Handle special characters and ensure proper CSV formatting
          const value = item[header]?.toString() || '';

          // Escape quotes and wrap in quotes if the value contains commas or quotes
          if (
            value.includes(',')
            || value.includes('"')
            || value.includes('\n')
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }

          return value;
        });

        csvContent += `${row.join(',')}\n`;
      });

      return {
        success: true,
        data: {
          format: 'csv',
          content: csvContent,
          contentType: 'text/csv',
          fileName: `report-${new Date().toISOString().split('T')[0]}.csv`,
        },
      };
    } else if (format === 'pdf') {
      // For PDF, we're returning structured data that the client can use
      // to generate a PDF using a client-side library
      // Note: In a production environment, you might use a server-side PDF generation library

      // Format the data for PDF generation
      interface PDFReportData {
        title: string;
        headers: string[];
        rows: any[][];
      }

      const pdfData: PDFReportData = {
        title: `Inventory Report - ${new Date().toLocaleDateString()}`,
        headers: dataToExport.length > 0 ? Object.keys(dataToExport[0]) : [],
        rows: dataToExport.map((item: any) => Object.values(item)),
      };

      return {
        success: true,
        data: {
          format: 'pdf',
          content: pdfData,
          contentType: 'application/json', // The client will use this to generate a PDF
          fileName: `report-${new Date().toISOString().split('T')[0]}.pdf`,
        },
      };
    }

    // Default return to ensure all code paths return a value
    return {
      success: false,
      error: 'Unexpected format specified',
    };
  } catch (error) {
    console.error('Error exporting report:', error);

    return {
      success: false,
      error:
        `Failed to export report: ${
          error instanceof Error ? error.message : String(error)}`,
    };
  }
}
