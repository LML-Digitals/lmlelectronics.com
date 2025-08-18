import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  TooltipProps,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
  CircleDollarSign,
  Boxes,
  Loader,
  PackageCheck,
  PackageX,
  PackagePlus,
} from 'lucide-react';
import { InventoryAnalytics as InventoryAnalyticsType } from '../types';

interface InventoryAnalyticsProps {
  data: InventoryAnalyticsType;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

export function InventoryAnalytics ({ data }: InventoryAnalyticsProps) {
  if (!data) {
    return <div>No inventory data available</div>;
  }

  // Safe formatter function to handle different value types
  const currencyFormatter = (value: any) => {
    if (typeof value === 'number') {
      return [`$${value.toFixed(2)}`, ''];
    }

    return [`$${value}`, ''];
  };

  return (
    <div className="space-y-6">
      {/* Inventory KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Inventory
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.inventory.items?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(data.inventory.items?.byCategory || {}).length || 0}{' '}
              categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${data.inventory.totalValue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg product: $
              {data.inventory.avgProductValue?.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.inventory.lowStockItems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.inventory.lowStockItems || 0} critical items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Adjustments
            </CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.inventory.totalAdjustments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Inventory adjustments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Analytics */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Overview</CardTitle>
              <CardDescription>Key inventory metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Items',
                        value: data.inventory?.items?.total || 0,
                      },
                      {
                        name: 'Low Stock',
                        value: data.inventory?.lowStockItems || 0,
                      },
                      {
                        name: 'Adjustments',
                        value: data.inventory?.totalAdjustments || 0,
                      },
                    ]}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} items`, '']} />
                    <Bar dataKey="value" fill="#8884d8">
                      {[0, 1, 2].map((index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Operations</CardTitle>
              <CardDescription>Transfers and exchanges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    Total Transfers
                  </p>
                  <p className="text-xl font-bold">
                    {data.inventory?.transfers?.total || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {data.inventory?.transfers?.quantity || 0}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Returns</p>
                  <p className="text-xl font-bold">
                    {data.inventory?.returns?.total || 0}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Exchanges</p>
                  <p className="text-xl font-bold">
                    {data.inventory?.exchanges?.total || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
