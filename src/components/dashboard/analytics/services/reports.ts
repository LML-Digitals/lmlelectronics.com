"use server";

import {
  AnalyticsPeriod,
  RepairAnalytics,
  CommunicationsAnalytics,
  InventoryAnalytics,
  CustomerAnalytics,
  FinancialAnalytics,
  LocationAnalytics,
  ReportType,
} from "../types";

import {
  getRepairAnalytics,
  getCommunicationsAnalytics,
  getInventoryAnalytics,
  getCustomerAnalytics,
  getFinancialAnalytics,
  getLocationAnalytics,
} from "./analytics";

// Helper function to convert data to CSV format
function convertToCSV(data: any[], headers: string[]): string {
  // Create header row
  let csv = headers.join(",") + "\n";

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];

      // Handle different data types
      if (value === null || value === undefined) return "";
      if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
      if (typeof value === "object" && value instanceof Date)
        return value.toISOString();
      return value;
    });

    csv += values.join(",") + "\n";
  });

  return csv;
}

// New function to convert object to two-column format (Metric, Value)
function convertToTwoColumnCSV(data: Record<string, any>): string {
  // Add header row
  let csv = "Metric,Value\n";

  // Add each property as a separate row
  for (const key in data) {
    const value = data[key];

    // Format the value based on its type
    let formattedValue: string;
    if (value === null || value === undefined) {
      formattedValue = "";
    } else if (typeof value === "string") {
      formattedValue = `"${value.replace(/"/g, '""')}"`;
    } else if (typeof value === "object" && value instanceof Date) {
      formattedValue = value.toISOString();
    } else {
      formattedValue = String(value);
    }

    // Format the key for display (replace underscores with spaces, capitalize)
    const formattedKey = key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    csv += `"${formattedKey}",${formattedValue}\n`;
  }

  return csv;
}

// Transform complex analytics data into flat data for CSV
function flattenAnalyticsData(data: any, prefix = ""): any {
  const result: any = {};

  for (const key in data) {
    const value = data[key];
    const newKey = prefix ? `${prefix}_${key}` : key;

    if (value === null || value === undefined) {
      result[newKey] = "";
    } else if (
      typeof value === "object" &&
      !(value instanceof Date) &&
      !Array.isArray(value)
    ) {
      const flatObject = flattenAnalyticsData(value, newKey);
      Object.assign(result, flatObject);
    } else if (Array.isArray(value)) {
      // Handle arrays specially based on need
      result[newKey] = JSON.stringify(value);
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

export async function generateCSVReport(
  reportType: ReportType,
  period: AnalyticsPeriod = "monthly",
  startDate?: Date,
  endDate?: Date
): Promise<string> {
  const now = new Date();
  const formattedDate = now.toISOString().split("T")[0];

  switch (reportType) {
    case "repairs": {
      const data = await getRepairAnalytics(period, startDate, endDate);

      // Extract repair tickets data and transform for CSV
      const repairData = {
        report_type: "Repairs & Services",
        period: data.period || period,
        total_tickets: data.tickets.total,
        completed_tickets: data.tickets.completed,
        pending_tickets: data.tickets.pending,
        cancelled_tickets: data.tickets.cancelled,
        completion_rate: data.tickets.completionRate,
        diagnostics_total: data.diagnostics.total,
        diagnostics_completed: data.diagnostics.completed,
        diagnostics_completion_rate: data.diagnostics.completionRate,
        quotes_total: data.quotes?.total || 0,
        quotes_accepted: data.quotes?.accepted || 0,
        quotes_conversion_rate: data.quotes?.conversionRate || "0",
        total_repair_revenue: data.totalRepairRevenue || 0,
        total_service_revenue: data.totalServiceRevenue || 0,
        date_generated: formattedDate,
      };

      return convertToTwoColumnCSV(repairData);
    }

    case "inventory": {
      const data = await getInventoryAnalytics(period, startDate, endDate);

      // Extract inventory data
      const inventoryData = {
        report_type: "Inventory",
        period: data.period || period,
        total_items: data.inventory.items?.total || 0,
        total_value: data.inventory.totalValue || 0,
        low_stock_items: data.inventory.lowStockItems,
        out_of_stock_items: 0,
        total_suppliers: data.suppliers.total || 0,
        active_suppliers: data.suppliers.active || 0,
        purchase_orders_total: data.purchaseOrders?.total || 0,
        purchase_orders_pending: data.purchaseOrders?.pending || 0,
        purchase_orders_received: data.purchaseOrders?.received || 0,
        purchase_orders_total_spent: data.purchaseOrders?.totalSpent || 0,
        date_generated: formattedDate,
      };

      return convertToTwoColumnCSV(inventoryData);
    }

    case "customers": {
      const data = await getCustomerAnalytics(period, startDate, endDate);

      // Extract customer data
      const customerData = {
        report_type: "Customers",
        period: data.period || period,
        total_customers: data.customers.totalCustomers,
        active_customers: data.customers.activeCustomers,
        new_customers: data.customers.newCustomers,
        activity_rate: data.customers.activityRate,
        total_bookings: data.customers.bookings.total,
        total_tickets: data.customers.tickets.total,
        ticket_completion_rate: data.customers.tickets.completionRate || 0,
        average_review_rating: data.customers.reviews?.averageRating || 0,
        total_reviews: data.customers.reviews?.total || 0,
        customer_growth_rate: data.customers.activityRate || 0,
        customer_retention_rate: data.customers.activityRate || 0,
        date_generated: formattedDate,
      };

      return convertToTwoColumnCSV(customerData);
    }

    case "communications": {
      const data = await getCommunicationsAnalytics(period, startDate, endDate);

      // Extract communications data
      const communicationsData = {
        report_type: "Communications",
        period: data.period || period,
        total_calls: data.calls.total,
        answered_calls: data.calls.answered || 0,
        missed_calls: data.calls.missed || 0,
        answer_rate: data.calls.answerRate || 0,
        total_emails: data.emails.total,
        sent_emails: data.emails.sent,
        email_open_rate: data.emails.openRate || 0,
        total_texts: data.texts.total,
        sent_texts: data.texts.sent,
        received_texts: data.texts.received,
        text_delivery_rate: data.texts.deliveryRate,
        total_notifications: data.notifications.total,
        read_notifications: data.notifications.read || 0,
        date_generated: formattedDate,
      };

      return convertToTwoColumnCSV(communicationsData);
    }

    case "financial": {
      const data = await getFinancialAnalytics(period, startDate, endDate);

      // Extract financial data
      const financialData = {
        report_type: "Financial",
        period: data.period || period,
        total_income: data.overview.income,
        total_expenses: data.overview.expenses,
        profit: data.overview.profit,
        profit_margin: data.overview.profitMargin,
        income_change: data.trends.incomeChange,
        expense_change: data.trends.expenseChange,
        total_bills: data.bills.total,
        paid_bills: data.bills.paid,
        unpaid_bills: data.bills.unpaid,
        overdue_bills: data.bills.overdue,
        total_payroll: data.payroll.totalPayroll || 0,
        date_generated: formattedDate,
      };

      return convertToTwoColumnCSV(financialData);
    }

    case "locations": {
      const data = await getLocationAnalytics(period, startDate, endDate);

      // For locations, we need a different approach since it's array data
      if (data.inventoryByLocation && data.inventoryByLocation.length > 0) {
        let csvData = "Metric,Value\n";

        // Add report metadata
        csvData += `"Report Type","Locations"\n`;
        csvData += `"Period","${period}"\n`;
        csvData += `"Date Generated","${formattedDate}"\n`;
        csvData += `"Total Locations","${data.inventoryByLocation.length}"\n\n`;

        // Add separator
        csvData += `"Location Data",""\n\n`;

        // Add each location's data
        data.inventoryByLocation.forEach((loc, index) => {
          csvData += `"Location ${index + 1}","${loc.locationName}"\n`;
          csvData += `"Location ID","${loc.locationId}"\n`;
          csvData += `"Total Value","${loc.totalValue}"\n`;
          csvData += `"Ticket Count","${
            data.ticketsByLocation?.[loc.locationName] || 0
          }"\n\n`;
        });

        return csvData;
      } else {
        return 'Metric,Value\n"Status","No location data available for the selected period."\n';
      }
    }

    case "sales": {
      const data = await getInventoryAnalytics(period, startDate, endDate);

      // Create sales data from inventory data
      const salesData = {
        report_type: "Sales",
        period: data.period || period,
        total_value: data.inventory.totalValue || 0,
        total_revenue: data.inventory.totalRevenue || 0,
        low_stock_items: data.inventory.lowStockItems || 0,
        total_adjustments: data.inventory.totalAdjustments || 0,
        purchase_orders_total: data.purchaseOrders?.total || 0,
        purchase_orders_total_spent: data.purchaseOrders?.totalSpent || 0,
        date_generated: formattedDate,
      };

      return convertToTwoColumnCSV(salesData);
    }

    case "staff-performance": {
      const data = await getCustomerAnalytics(period, startDate, endDate);

      // For staff, we need a different approach since it's array data
      if (data.staff.productivity && data.staff.productivity.length > 0) {
        let csvData = "Metric,Value\n";

        // Add report metadata
        csvData += `"Report Type","Staff Performance"\n`;
        csvData += `"Period","${period}"\n`;
        csvData += `"Date Generated","${formattedDate}"\n`;
        csvData += `"Total Staff","${data.staff.productivity.length}"\n\n`;

        // Add separator
        csvData += `"Staff Data",""\n\n`;

        // Add each staff member's data
        data.staff.productivity.forEach((staff, index) => {
          csvData += `"Staff ${index + 1}","${staff.staffName}"\n`;
          csvData += `"Staff ID","${staff.staffId}"\n`;
          csvData += `"Ticket Count","${staff.ticketCount}"\n`;
          csvData += `"Role","${staff.role || ""}"\n`;
          csvData += `"Availability","${staff.availability || ""}"\n`;
          csvData += `"Comment Count","${staff.commentCount || 0}"\n`;
          csvData += `"Note Count","${staff.noteCount || 0}"\n\n`;
        });

        return csvData;
      } else {
        return 'Metric,Value\n"Status","No staff performance data available for the selected period."\n';
      }
    }

    case "ticket-summary": {
      const data = await getRepairAnalytics(period, startDate, endDate);

      // For a more detailed ticket report
      const ticketSummary = {
        report_type: "Ticket Summary",
        period: data.period || period,
        total_tickets: data.tickets.total,
        pending_tickets: data.tickets.pending,
        completed_tickets: data.tickets.completed,
        cancelled_tickets: data.tickets.cancelled,
        completion_rate: data.tickets.completionRate,
        date_generated: formattedDate,
      };

      return convertToTwoColumnCSV(ticketSummary);
    }

    case "call-metrics": {
      const data = await getCommunicationsAnalytics(period, startDate, endDate);

      // Call center metrics report
      const callMetrics = {
        report_type: "Call Metrics",
        period: data.period || period,
        total_calls: data.calls.total,
        answered_calls: data.calls.answered || 0,
        missed_calls: data.calls.missed || 0,
        answer_rate: data.calls.answerRate || 0,
        date_generated: formattedDate,
      };

      return convertToTwoColumnCSV(callMetrics);
    }

    default:
      return 'Metric,Value\n"Error","Invalid report type specified."\n';
  }
}
