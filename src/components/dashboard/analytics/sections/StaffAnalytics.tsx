"use client";

import { getStaffAnalytics } from "@/components/dashboard/staff/services/staffCrud";
import StaffAnalytics from "@/components/dashboard/staff/StaffAnalytics";
import { useEffect, useState } from "react";
import { CircleDashed } from "lucide-react";

// TypeScript interfaces for analytics data
interface RoleDistribution {
  role: string;
  _count: {
    role: number;
  };
}

interface PaymentTypeDistribution {
  paymentType: string;
  _count: {
    paymentType: number;
  };
}

interface AvailabilityDistribution {
  availability: string;
  _count: number;
}

interface PerformanceMetric {
  id: string;
  name: string;
  ticketsHandled: number;
  ticketsCompleted: number;
  avgResolutionTime: string;
  comments: number;
}

interface SalaryMetric {
  id: string;
  name: string;
  paymentType: string;
  baseSalary: number;
  commissionRate: number;
  recentEarnings: number;
  recentCommission: number;
  recentPayrollCount: number;
}

interface StaffAnalyticsData {
  totalStaff: number;
  roleDistribution: RoleDistribution[];
  paymentTypeDistribution: PaymentTypeDistribution[];
  availabilityDistribution: AvailabilityDistribution[];
  performanceMetrics: PerformanceMetric[];
  salaryMetrics: SalaryMetric[];
  activeSessions: number;
  documentationCoverage: string;
  averageResponseTime: string;
}

export default function StaffOverview() {
  const [analytics, setAnalytics] = useState<StaffAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStaffAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load staff analytics:", error);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircleDashed className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={loadAnalytics}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No analytics data available.</p>
      </div>
    );
  }

  return (
    <div>
      <StaffAnalytics analytics={analytics} />
    </div>
  );
}
