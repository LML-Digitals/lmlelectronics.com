"use server";

import { getInventoryItems } from "../items/services/itemsCrud";
import { InventoryItemWithRelations } from "../items/types/ItemType";

// Types for chart data
export type BarChartData = {
  name: string;
  value: number;
  color?: string;
}[];

// Update ChartDataResponse to use generics
export interface ChartDataResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get data for inventory value by category bar chart
 */
export async function getInventoryValueByCategory(): Promise<
  ChartDataResponse<BarChartData>
> {
  try {
    const items = await getInventoryItems();

    // Group items by category and calculate total value
    const categoryValueMap = new Map<string, number>();

    items.forEach((item: InventoryItemWithRelations) => {
      // For each item, calculate its total value across all variations and locations
      item.variations?.forEach((variation) => {
        let itemTotalValue = 0;

        variation.stockLevels?.forEach((level) => {
          const stockValue = level.stock * (level.purchaseCost || 0);
          itemTotalValue += stockValue;
        });

        // Add the item value to each of its categories
        item.categories.forEach((category) => {
          const currentValue = categoryValueMap.get(category.name) || 0;
          categoryValueMap.set(category.name, currentValue + itemTotalValue);
        });

        // If item has no categories, add to "Uncategorized"
        if (item.categories.length === 0) {
          const currentValue = categoryValueMap.get("Uncategorized") || 0;
          categoryValueMap.set("Uncategorized", currentValue + itemTotalValue);
        }
      });
    });

    // Convert map to array for the chart
    const chartData: BarChartData = Array.from(categoryValueMap.entries())
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)), // Round to 2 decimal places
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending

    return {
      success: true,
      data: chartData,
    };
  } catch (error) {
    console.error("Error fetching inventory value by category:", error);
    return {
      success: false,
      error: "Failed to fetch inventory value by category data",
    };
  }
}

/**
 * Get data for inventory quantity by location bar chart
 */
export async function getInventoryQuantityByLocation(): Promise<
  ChartDataResponse<BarChartData>
> {
  try {
    const items = await getInventoryItems();

    // Group items by location and calculate total quantity
    const locationQuantityMap = new Map<string, number>();

    items.forEach((item: InventoryItemWithRelations) => {
      item.variations?.forEach((variation) => {
        variation.stockLevels?.forEach((level) => {
          const locationName = level.location.name;
          const currentQuantity = locationQuantityMap.get(locationName) || 0;
          locationQuantityMap.set(locationName, currentQuantity + level.stock);
        });
      });
    });

    // Convert map to array for the chart
    const chartData: BarChartData = Array.from(locationQuantityMap.entries())
      .map(([name, value]) => ({
        name,
        value: value,
      }))
      .sort((a, b) => b.value - a.value); // Sort by quantity descending

    return {
      success: true,
      data: chartData,
    };
  } catch (error) {
    console.error("Error fetching inventory quantity by location:", error);
    return {
      success: false,
      error: "Failed to fetch inventory quantity by location data",
    };
  }
}

/**
 * Get data for low stock items bar chart
 * Shows items with stock below a certain threshold
 */
export async function getLowStockItems(
  threshold: number = 5
): Promise<ChartDataResponse<BarChartData>> {
  try {
    const items = await getInventoryItems();

    // Find items with low stock
    const lowStockItems: BarChartData = [];

    items.forEach((item: InventoryItemWithRelations) => {
      item.variations?.forEach((variation) => {
        variation.stockLevels?.forEach((level) => {
          if (level.stock <= threshold) {
            const itemName = `${item.name} (${variation.name})`;
            lowStockItems.push({
              name: itemName,
              value: level.stock,
              color: level.stock === 0 ? "#ef4444" : "#f97316", // Red for out of stock, orange for low stock
            });
          }
        });
      });
    });

    // Sort by stock level ascending (lowest first)
    const sortedData = lowStockItems
      .sort((a, b) => a.value - b.value)
      .slice(0, 10); // Limit to top 10

    return {
      success: true,
      data: sortedData,
    };
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return {
      success: false,
      error: "Failed to fetch low stock items data",
    };
  }
}

/**
 * Get data for top selling items
 */
export async function getTopSellingItems(): Promise<
  ChartDataResponse<BarChartData>
> {
  // In a real implementation, you would fetch sales data and calculate top items
  // For now, we'll return sample data
  try {
    const items = await getInventoryItems();

    // Simulate sales data based on inventory items
    // In a real application, you would pull this from orders or sales records
    const sampleData: BarChartData = items
      .slice(0, Math.min(10, items.length)) // Take up to 10 items
      .map((item, index) => ({
        name: item.name,
        value: Math.floor(Math.random() * 100) + 1, // Random value between 1-100
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending

    return {
      success: true,
      data: sampleData,
    };
  } catch (error) {
    console.error("Error creating sample top selling items data:", error);
    return {
      success: false,
      error: "Failed to create top selling items data",
    };
  }
}

/**
 * Get aggregated inventory metrics for dashboard
 */
export interface InventoryMetrics {
  totalItems: number;
  totalVariations: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export async function getInventoryMetrics(): Promise<
  ChartDataResponse<InventoryMetrics>
> {
  try {
    const items = await getInventoryItems();

    let totalItems = 0;
    let totalVariations = 0;
    let totalStock = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    items.forEach((item: InventoryItemWithRelations) => {
      totalItems += 1;

      if (item.variations) {
        totalVariations += item.variations.length;

        item.variations.forEach((variation) => {
          variation.stockLevels?.forEach((level) => {
            totalStock += level.stock;
            totalValue += level.stock * (level.purchaseCost || 0);

            if (level.stock === 0) {
              outOfStockCount += 1;
            } else if (level.stock <= 5) {
              // Assuming 5 is the threshold for low stock
              lowStockCount += 1;
            }
          });
        });
      }
    });

    return {
      success: true,
      data: {
        totalItems,
        totalVariations,
        totalStock,
        totalValue: parseFloat(totalValue.toFixed(2)),
        lowStockCount,
        outOfStockCount,
      },
    };
  } catch (error) {
    console.error("Error calculating inventory metrics:", error);
    return {
      success: false,
      error: "Failed to calculate inventory metrics",
    };
  }
}
