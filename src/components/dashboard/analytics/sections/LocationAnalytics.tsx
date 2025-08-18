import React from 'react';
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
  TooltipProps,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MapPin,
  DollarSign,
  ClipboardList,
  BarChart3,
  ShoppingCart,
  Package,
} from 'lucide-react';

interface LocationAnalyticsProps {
  data: any;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

export function LocationAnalytics ({ data }: LocationAnalyticsProps) {
  if (!data) {
    return <div>No location data available</div>;
  }

  // Safe formatter function to handle different value types
  const currencyFormatter = (value: any) => {
    if (typeof value === 'number') {
      return [`$${value.toFixed(2)}`, ''];
    }

    return [`$${value}`, ''];
  };

  // Prepare ticket data by location
  const ticketData = Object.entries(data.ticketsByLocation || {})
    .map(([location, count]) => ({
      name: location,
      value: count as number,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 locations by ticket volume

  // Prepare sales data by location
  const salesData = Object.entries(data.salesByLocation || {})
    .map(([location, amount]) => ({
      name: location,
      value: amount as number,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 locations by sales

  // Calculate total sales - using proper type casting to handle Object.values returning unknown[]
  const salesValues = Object.values(data.salesByLocation || {});
  const totalSales = salesValues.reduce(
    (sum: number, val: number) => sum + (val || 0),
    0,
  );

  // Calculate total tickets - using proper type casting to handle Object.values returning unknown[]
  const ticketValues = Object.values(data.ticketsByLocation || {});
  const totalTickets = ticketValues.reduce(
    (sum: number, val: number) => sum + (val || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Locations
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.locationCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${typeof totalSales === 'number' ? totalSales.toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {typeof totalTickets === 'number' ? totalTickets : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location performance visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Tickets by Location</CardTitle>
              <CardDescription>Top locations by ticket volume</CardDescription>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              {ticketData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ticketData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => [`${value} tickets`, '']} />
                    <Bar dataKey="value" fill="#8884d8">
                      {ticketData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  No ticket data by location available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Sales by Location</CardTitle>
              <CardDescription>Top locations by sales volume</CardDescription>
            </div>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={currencyFormatter} />
                    <Bar dataKey="value" fill="#8884d8">
                      {salesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  No sales data by location available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory by location */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Inventory by Location</CardTitle>
            <CardDescription>
              Stock levels and values across locations
            </CardDescription>
          </div>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inventory Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Low Stock Items
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.inventoryByLocation
                && data.inventoryByLocation.length > 0 ? (
                    data.inventoryByLocation.map((location: any) => (
                      <tr key={location.locationId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {location.locationName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {location.totalStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        ${location.totalValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {location.lowStockCount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center">
                      No inventory data by location available
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Location Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Location Performance Comparison</CardTitle>
          <CardDescription>Key metrics across locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {data.inventoryByLocation && data.inventoryByLocation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.inventoryByLocation.map((loc: any) => {
                    return {
                      name: loc.locationName,
                      'Inventory Value': loc.totalValue,
                      'Ticket Count':
                        data.ticketsByLocation[loc.locationName] || 0,
                      Sales: data.salesByLocation[loc.locationName] || 0,
                    };
                  })}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (
                        typeof name === 'string'
                        && (name === 'Inventory Value' || name === 'Sales')
                      ) {
                        if (typeof value === 'number') {
                          return [`$${value.toFixed(2)}`, name];
                        }

                        return [`$${value}`, name];
                      }

                      return [value, name];
                    }}
                  />
                  <Bar dataKey="Inventory Value" fill={COLORS[0]} />
                  <Bar dataKey="Ticket Count" fill={COLORS[1]} />
                  <Bar dataKey="Sales" fill={COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                No location comparison data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
