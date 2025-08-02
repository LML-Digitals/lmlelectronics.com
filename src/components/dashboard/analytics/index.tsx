"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { getComprehensiveAnalytics } from "./services/analytics";
import { InventoryAnalytics } from "./sections/InventoryAnalytics";
import { LocationAnalytics } from "./sections/LocationAnalytics";
import StaffOverview from "./sections/StaffAnalytics";

import InventoryOverview from "./sections/InventoryOverview";
import { Loader2 } from "lucide-react";
import { addDays, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Smartphone, Laptop, Wrench, CheckCircle2 } from "lucide-react";

export default function Analytics() {
  const [period, setPeriod] = useState<string>("monthly");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [useCustomDateRange, setUseCustomDateRange] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let analyticsData;
        if (useCustomDateRange && dateRange.from && dateRange.to) {
          analyticsData = await getComprehensiveAnalytics(
            "custom",
            dateRange.from,
            dateRange.to
          );
        } else {
          analyticsData = await getComprehensiveAnalytics(period);
        }
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, useCustomDateRange, dateRange]);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setUseCustomDateRange(value === "custom");
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range && range.from) {
      setDateRange(range);
      setUseCustomDateRange(true);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Responsive Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm font-medium whitespace-nowrap">
            Time Period:
          </span>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly (Last 7 days)</SelectItem>
                <SelectItem value="monthly">Monthly (Current month)</SelectItem>
                <SelectItem value="quarterly">
                  Quarterly (Last 3 months)
                </SelectItem>
                <SelectItem value="yearly">Yearly (Last 12 months)</SelectItem>
                <SelectItem value="custom">
                  Custom Range (Select dates)
                </SelectItem>
              </SelectContent>
            </Select>

            {period === "custom" && (
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
              />
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="inventory" className="w-full">
          {/* Responsive Tabs Navigation */}
          <div className="overflow-x-auto mb-6">
            <TabsList className="grid grid-cols-4 lg:grid-cols-3 w-full min-w-[800px] lg:min-w-0">
              <TabsTrigger value="inventory" className="text-xs lg:text-sm">
                Inventory
              </TabsTrigger>
              <TabsTrigger value="people" className="text-xs lg:text-sm">
                People
              </TabsTrigger>
              <TabsTrigger value="locations" className="text-xs lg:text-sm">
                Locations
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="inventory">
            <div className="space-y-6">
              {/* Combined Inventory Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>
                    Comprehensive inventory analytics and management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Inventory Analytics */}
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold mb-4">
                        Inventory Analytics
                      </h3>
                      <InventoryAnalytics data={data?.inventory} />
                    </div>

                    {/* Inventory Overview */}
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold mb-4">
                        Inventory Overview
                      </h3>
                      <InventoryOverview />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="people">
            {/* Staff Overview Section */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Overview</CardTitle>
                <CardDescription>
                  Staff performance and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StaffOverview />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations">
            <LocationAnalytics data={data?.locations} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
