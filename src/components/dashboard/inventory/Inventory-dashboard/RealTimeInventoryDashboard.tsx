'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  getInventoryQuantityByLocation,
  getInventoryMetrics,
  BarChartData,
} from '../services/chartDataServices';
import { getInventoryTrends } from '../services/inventoryTrendServices';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getLowStockItems, getOutOfStockItems, StockItem } from '../services/inventoryStockService';
import { toast } from '@/components/ui/use-toast';

// Define interfaces for the data
interface InventoryMetrics {
  totalItems: number;
  totalVariations: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface TrendData {
  date: string;
  stock: number;
  value: number;
  received: number;
  shipped: number;
}

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function RealTimeInventoryDashboard () {
  const [locationData, setLocationData] = useState<BarChartData>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [timeRange, setTimeRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'lowStock' | 'outOfStock'>('lowStock');
  const [dialogItems, setDialogItems] = useState<StockItem[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);

  useEffect(() => {
    async function fetchData () {
      setIsLoading(true);
      try {
        // Fetch stock levels by location
        const locationResult = await getInventoryQuantityByLocation();

        if (locationResult.success && locationResult.data) {
          setLocationData(locationResult.data);
        }

        // Fetch inventory metrics
        const metricsResult = await getInventoryMetrics();

        if (metricsResult.success && metricsResult.data) {
          setMetrics(metricsResult.data);
        }

        // Fetch trend data
        const trendResult = await getInventoryTrends(timeRange);

        if (trendResult.success && trendResult.data) {
          setTrendData(trendResult.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  // Function to fetch and show low stock items
  const handleLowStockClick = async () => {
    setDialogType('lowStock');
    setDialogLoading(true);
    setDialogOpen(true);

    try {
      const result = await getLowStockItems(5);

      if (result.success && result.data) {
        setDialogItems(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load low stock items',
          variant: 'destructive',
        });
        setDialogItems([]);
      }
    } catch (error) {
      console.error('Error loading low stock items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load low stock items',
        variant: 'destructive',
      });
      setDialogItems([]);
    } finally {
      setDialogLoading(false);
    }
  };

  // Function to fetch and show out of stock items
  const handleOutOfStockClick = async () => {
    setDialogType('outOfStock');
    setDialogLoading(true);
    setDialogOpen(true);

    try {
      const result = await getOutOfStockItems();

      if (result.success && result.data) {
        setDialogItems(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load out of stock items',
          variant: 'destructive',
        });
        setDialogItems([]);
      }
    } catch (error) {
      console.error('Error loading out of stock items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load out of stock items',
        variant: 'destructive',
      });
      setDialogItems([]);
    } finally {
      setDialogLoading(false);
    }
  };

  const getDialogTitle = () => {
    return dialogType === 'lowStock' ? 'Low Stock Items' : 'Out of Stock Items';
  };

  const getDialogDescription = () => {
    return dialogType === 'lowStock'
      ? 'Items with stock levels below safety threshold'
      : 'Items that are completely out of stock and need reordering';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Real-Time Inventory Dashboard
        </h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time Range</SelectLabel>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last Quarter</SelectItem>
                <SelectItem value="12months">Last Year</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inventory Summary Metrics */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">📦</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalItems.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalVariations.toLocaleString()} variations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">🔢</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalStock.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ${metrics.totalValue.toLocaleString()} value
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleLowStockClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <div className="h-4 w-4 text-amber-500">
                ⚠️
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.lowStockCount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Items below safety stock level
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={handleOutOfStockClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Out of Stock
              </CardTitle>
              <div className="h-4 w-4 text-red-500">
                ❗
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.outOfStockCount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Items needing immediate restock
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Content */}
      <Tabs defaultValue="stock-levels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock-levels">Current Stock Levels</TabsTrigger>
          <TabsTrigger value="trends">Inventory Trends</TabsTrigger>
          <TabsTrigger value="movement">Stock Movement</TabsTrigger>
        </TabsList>

        {/* Current Stock Levels Tab */}
        <TabsContent value="stock-levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Levels by Location</CardTitle>
              <CardDescription>
                Current inventory levels across all warehouse locations
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Quantity" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock Distribution</CardTitle>
                <CardDescription>
                  Percentage of inventory in each location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent || 0 * 100).toFixed(0)}%`
                        }
                      >
                        {locationData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Status</CardTitle>
                <CardDescription>
                  Overview of current inventory health status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Healthy Stock
                        </div>
                        <div className="text-2xl font-bold">
                          {metrics.totalVariations
                            - metrics.lowStockCount
                            - metrics.outOfStockCount}
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            items
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-green-500 h-2.5 rounded-full"
                            style={{
                              width: `${
                                ((metrics.totalVariations
                                  - metrics.lowStockCount
                                  - metrics.outOfStockCount)
                                  / metrics.totalVariations)
                                * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Low Stock
                        </div>
                        <div className="text-2xl font-bold">
                          {metrics.lowStockCount}
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            items
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-amber-500 h-2.5 rounded-full"
                            style={{
                              width: `${
                                (metrics.lowStockCount
                                  / metrics.totalVariations)
                                * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Out of Stock
                        </div>
                        <div className="text-2xl font-bold">
                          {metrics.outOfStockCount}
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            items
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-red-500 h-2.5 rounded-full"
                            style={{
                              width: `${
                                (metrics.outOfStockCount
                                  / metrics.totalVariations)
                                * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Total Value
                        </div>
                        <div className="text-2xl font-bold">
                          ${metrics.totalValue.toLocaleString()}
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700"
                        >
                          Inventory Asset
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Level Trends</CardTitle>
              <CardDescription>
                See how your inventory has changed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="stock"
                      name="Total Stock"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Total Value ($)"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Movement Tab */}
        <TabsContent value="movement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Movement</CardTitle>
              <CardDescription>
                Track the flow of inventory in and out of your locations
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="received"
                      name="Items Received"
                      stroke="#82ca9d"
                    />
                    <Line
                      type="monotone"
                      dataKey="shipped"
                      name="Items Shipped"
                      stroke="#ff7300"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for showing stock items */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>{getDialogDescription()}</DialogDescription>
          </DialogHeader>

          {dialogLoading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : dialogItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dialogItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={item.stock === 0 ? 'destructive' : 'outline'}
                        className="ml-auto"
                      >
                        {item.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.value.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <p className="text-muted-foreground">No items to display</p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
