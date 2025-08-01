"use client";

import { useState } from "react";
import { Overview } from "@/components/dashboard/inventory/overview/Overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealTimeInventoryDashboard } from "@/components/dashboard/inventory/Inventory-dashboard/RealTimeInventoryDashboard";
import { SupplierPerformance } from "../Inventory-dashboard/SupplierPerformance";
import { InventoryReports } from "../Inventory-dashboard/InventoryReports";
import { LowStockItems } from "./LowStockItems";

function InventoryOverviewBody() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 lg:grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboard">Real-Time Dashboard</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Performance</TabsTrigger>
          <TabsTrigger value="reports">Custom Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Original content */}
        <TabsContent value="overview" className="space-y-8">
          <div className="flex items-center gap-10">
            <Overview />
            <LowStockItems />
          </div>
        </TabsContent>

        {/* Real-Time Dashboard Tab */}
        <TabsContent value="dashboard">
          <RealTimeInventoryDashboard />
        </TabsContent>

        {/* Supplier Performance Tab */}
        <TabsContent value="suppliers">
          <SupplierPerformance />
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="reports">
          <InventoryReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InventoryOverviewBody;
