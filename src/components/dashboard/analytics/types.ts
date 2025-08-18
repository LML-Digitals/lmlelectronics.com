// Analytics Period Types
export type AnalyticsPeriod =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

// Report Types
export type ReportType =
  | 'repairs'
  | 'inventory'
  | 'customers'
  | 'communications'
  | 'financial'
  | 'locations'
  | 'sales'
  | 'staff-performance'
  | 'ticket-summary'
  | 'call-metrics';

// Repair Analytics Types - Cleaned up version
export interface RepairAnalytics {
  // Ticket Analytics
  tickets: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    completionRate: string;
    brandDistribution: Record<string, number>;
    repairTypes: Record<string, number>;
  };

  // Quote Analytics
  quotes: {
    total: number;
    accepted: number;
    expired: number;
    pending: number;
    conversionRate: string;
    brandDistribution: Record<string, number>;
  };

  // Diagnostics Analytics
  diagnostics: {
    total: number;
    completed: number;
    pending: number;
    completionRate: string;
  };

  // Revenue
  totalRepairRevenue: number;
  totalServiceRevenue: number;

  period?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// Communications Analytics Types
export interface CommunicationsAnalytics {
  calls: {
    total: number;
    answered?: number;
    missed?: number;
    answerRate?: number;
    inbound?: number;
    outbound?: number;
    averageDuration?: number;
    byPurpose?: Record<string, number>;
  };
  emails: {
    total: number;
    sent: number;
    failed?: number;
    received?: number;
    opened?: number;
    openRate?: number;
    clickRate?: number;
    clickThrough?: number;
    byType?: Record<string, number>;
  };
  texts: {
    total: number;
    sent: number;
    received: number;
    deliveryRate: number;
    responseRate?: number;
  };
  notifications: {
    total: number;
    read?: number;
    unread?: number;
    readRate?: number;
    byType?: Record<string, number>;
    byStatus?: Record<string, number>;
    byPriority?: Record<string, number>;
    deliveryRate?: number;
  };
  announcements?: {
    total: number;
    active: number;
    inactive: number;
    activeRate?: number;
    latest?: any[];
  };
  templates?: {
    total: number;
    mostUsed?: Array<{
      name: string;
      useCount: number;
    }>;
  };
  campaigns?: {
    total: number;
    active: number;
    completed: number;
    metrics?: {
      totalSent: number;
      opened: number;
      responded: number;
      openRate: number;
      responseRate: number;
    };
  };
  communicationByTime?: Array<{
    hour: number;
    callCount: number;
    textCount: number;
    emailCount: number;
  }>;
  trends?: {
    callsChange: number;
    emailsChange: number;
    textsChange: number;
  };
  period?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// Inventory Analytics Types
export interface InventoryAnalytics {
  inventory: {
    items?: {
      total: number;
      byCategory: Record<string, number>;
    };
    totalItems?: number;
    totalValue?: number;
    avgProductValue?: number;
    totalRevenue?: number;
    lowStockItems: number;
    outOfStockItems?: number;
    excessStock?: number;
    stockTurnover?: number;
    totalAdjustments?: number;
    adjustmentReasons?: Record<string, number>;
    discrepancies?: number;
    byStatus?: Record<string, number>;
    transfers?: {
      total: number;
      quantity: number;
    };
    returns?: {
      total: number;
      byReason?: Record<string, number>;
    };
    exchanges?: {
      total: number;
    };
    topCategories?: Array<{
      category: string;
      itemCount: number;
      value: number;
    }>;
  };
  purchaseOrders?: {
    total: number;
    pending: number;
    approved: number;
    received: number;
    cancelled: number;
    totalSpent: number;
    bySupplier?: Record<string, number>;
  };
  suppliers: {
    total?: number;
    active?: number;
    totalSuppliers?: number;
    activeSuppliers?: number;
    topSuppliers?: any[];
    supplierPerformance?: Array<{
      supplierId: string;
      name: string;
      ordersCompleted: number;
      onTimeDelivery: number;
      quality: number;
    }>;
  };
  rentalDevices?: {
    total: number;
    available: number;
    activeRentals: number;
    revenue: number;
  };
  specialParts?: {
    total: number;
    pending: number;
    completed: number;
    totalValue: number;
  };
  warranty?: {
    totalPolicies: number;
    activePolicies: number;
    claims: number;
    revenue: number;
  };
  pos?: {
    carts?: {
      total: number;
      active: number;
      converted: number;
      abandonedRate: number;
    };
    orders?: {
      total: number;
      pending: number;
      completed: number;
      cancelled: number;
      completionRate?: number;
    };
    sales?: {
      total: number;
      revenue: number;
      profit: number;
      profitMargin?: number;
      averageOrderValue?: number;
    };
    refunds?: {
      total: number;
      approved?: number;
      pending?: number;
      denied?: number;
      totalAmount: number;
      refundRate: number;
    };
    discounts?: {
      total: number;
      active: number;
      usageCount: number;
      byType?: Record<string, number>;
    };
    invoices?: {
      total: number;
      paid?: number;
      pending?: number;
      totalAmount: number;
      collectionRate: number;
    };
  };
  sales?: {
    totalSales?: number;
    revenue?: number;
    profit?: number;
    marginPercentage?: number;
    averageOrderValue?: number;
    topProducts?: Array<{
      productId: string;
      name: string;
      quantity: number;
      revenue: number;
    }>;
    byCategory?: Record<string, number>;
  };
  orders?: {
    totalOrders?: number;
    pendingOrders?: number;
    backOrders?: number;
    averageFulfillmentTime?: number;
    byStatus?: Record<string, number>;
  };
  trends?: {
    salesChange?: number;
    inventoryValueChange?: number;
    stockTurnoverChange?: number;
  };
  stockLevels?: Array<{
    category: string;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  }>;
  period?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// Staff Types
export interface StaffProductivity {
  staffId: string;
  staffName: string;
  ticketCount: number;
  completionRate?: number;
  role?: string;
  availability?: string;
  commentCount?: number;
  noteCount?: number;
  experienceYears?: number;
}

export interface StaffMember {
  staffId: string;
  staffName: string;
  role: string;
  availability: string;
  ticketCount: number;
  commentCount: number;
  noteCount: number;
  experienceYears: number;
}

// Customer Analytics Types
export interface CustomerAnalytics {
  customers: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomers: number;
    activityRate: number;
    bookings: {
      total: number;
      byStatus?: Record<string, number>;
      byType?: Record<string, number>;
      conversionRate?: number;
      noShow?: number;
      showRate?: number;
    };
    mailIns: {
      total: number;
      byStatus?: Record<string, number>;
      conversionRate?: number;
      received?: number;
      shipped?: number;
    };
    tickets: {
      total: number;
      byStatus?: Record<string, number>;
      completionRate?: number;
      open?: number;
      resolved?: number;
      resolution?: {
        averageTime: number;
        satisfactionRate: number;
      };
    };
    referrals?: {
      total: number;
      successful?: number;
      conversionRate?: number;
      rewardsEarned?: number;
      rewardsRedeemed?: number;
    };
    loyalty?: {
      programCount?: number;
      activeRewards?: number;
      redeemedRewards?: number;
      redemptionRate?: number;
    };
    storeCredit?: {
      accounts?: number;
      totalBalance?: number;
      averageBalance?: number;

    };
    reviews?: {
      total: number;
      averageRating: number;
      byRating?: Record<string, number>;
      bySource?: Record<string, number>;
    };
  };
  referrals?: {
    total: number;
    pending?: number;
    converted?: number;
    conversionRate: number;
    value?: number;
    top?: Array<{
      customerId: string;
      name: string;
      count: number;
    }>;
  };
  loyalty?: {
    totalPoints?: number;
    pointsRedeemed?: number;
    activeMembers?: number;
    perks?: {
      total: number;
      claimed: number;
      mostPopular: string;
    };
    tiers?: Record<string, number>;
  };
  reviews?: {
    total: number;
    averageRating: number;
    byRating: Record<string, number>;
    recent?: Array<{
      customerId: string;
      rating: number;
      comment: string;
      date: string;
    }>;
  };
  staff: {
    totalStaff?: number;
    activeStaff?: number;
    availability?: Record<string, number>;
    roleDistribution?: any[];
    availabilityDistribution?: Record<string, number>;
    productivity?: Array<StaffProductivity>;
    topPerformers?: Array<StaffMember>;
  };
  trends?: {
    customerGrowthRate?: number;
    customerRetentionRate?: number;
    bookingChangeRate?: number;
  };
  period?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// Financial Analytics Types
export interface FinancialAnalytics {
  overview: {
    income: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  };
  revenueBySource?: Record<string, number>;
  expensesByCategory: Record<string, number>;
  trends: {
    incomeChange: number;
    expenseChange: number;
    profitChange?: number;
    periodCompare?: {
      current: {
        startDate: Date;
        endDate: Date;
      };
      previous: {
        startDate: Date;
        endDate: Date;
      };
    };
  };
  bills: {
    total: number;
    paid: number;
    unpaid: number;
    overdue: number;
    totalAmount?: number;
    nextPayments?: Array<{
      name: string;
      amount: number;
      dueDate: string;
    }>;
  };
  payroll: {
    total?: number;
    totalPayroll?: number;
    employeeCount?: number;
    lastPayroll?: number;
    nextPayroll?: number;
    byDepartment?: Record<string, number>;
  };
  taxes?: {
    total: number;
    paid: number;
    due: number;
    nextFiling: string;
  };
  monthlyBreakdown?: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
  period?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// Location Analytics Types
export interface LocationAnalytics {
  locationCount: number;
  ticketsByLocation?: Record<string, number>;
  salesByLocation?: Record<string, number>;
  locationPerformance?: Array<{
    locationId: string;
    locationName: string;
    revenue: number;
    expenses: number;
    profit: number;
    staffCount: number;
    ticketCount: number;
  }>;
  inventoryByLocation: Array<{
    locationId: string;
    locationName: string;
    itemCount?: number;
    totalStock?: number;
    totalValue: number;
    lowStockItems?: number;
    lowStockCount?: number;
  }>;
  staffByLocation?: Array<{
    locationId: string;
    locationName: string;
    totalStaff: number;
    activeStaff: number;
    productivity: number;
  }>;
  revenueComparison?: Array<{
    locationName: string;
    revenue: number;
  }>;
  utilization?: Array<{
    locationName: string;
    utilization: number;
  }>;
  period?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// Business Metrics Types
export interface BusinessMetrics {
  totalRevenue: number;
  serviceDistribution: {
    repairs: number;
    serviceDivision: number;
    salesDivision: number;
    customDivision: number;
  };
  performance?: {
    currentPeriod: number;
    previousPeriod: number;
    percentageChange: number;
  };
}

// Comprehensive Analytics Data Types
export interface ComprehensiveAnalyticsData {
  repairs: RepairAnalytics;
  communications: CommunicationsAnalytics;
  inventory: InventoryAnalytics;
  customers: CustomerAnalytics;
  financial: FinancialAnalytics;
  locations: LocationAnalytics;
  businessMetrics: BusinessMetrics;
  period?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}
