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
import {
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from 'recharts';
import { Loader2, Download, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  getSupplierPerformanceData,
  getSupplierComparisonData,
} from '../services/supplierMetrics';

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Define interfaces for the data
interface Supplier {
  id: string;
  name: string;
  leadTime: number;
  onTimeDelivery: number;
  priceIndex: number;
  quality: number;
  performance: number;
  orderCount: number;
  totalSpent: number;
}

interface ComparisonData {
  suppliers: string[];
  radarData: Array<{
    metric: string;
    ideal: number;
    [key: string]: string | number;
  }>;
  barData: Array<{
    metric: string;
    [key: string]: string | number;
  }>;
  scatterData: Array<{
    name: string;
    quality: number;
    price: number;
    orderCount: number;
  }>;
}

export function SupplierPerformance () {
  const [supplierData, setSupplierData] = useState<Supplier[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Supplier;
    direction: 'asc' | 'desc';
  }>({
    key: 'performance',
    direction: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [timeRange, setTimeRange] = useState('90days');

  useEffect(() => {
    async function fetchData () {
      setIsLoading(true);
      try {
        // Fetch supplier performance data
        const result = await getSupplierPerformanceData(timeRange);

        if (result.success && result.data) {
          setSupplierData(result.data);
          setFilteredSuppliers(result.data);
        }

        // Fetch comparison data
        const compareResult = await getSupplierComparisonData();

        if (compareResult.success && compareResult.data) {
          setComparisonData(compareResult.data);
        }
      } catch (error) {
        console.error('Error fetching supplier data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  // Filter suppliers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSuppliers(supplierData);
    } else {
      const filtered = supplierData.filter((supplier) => supplier.name.toLowerCase().includes(searchTerm.toLowerCase()));

      setFilteredSuppliers(filtered);
    }
  }, [searchTerm, supplierData]);

  // Sort suppliers
  const requestSort = (key: keyof Supplier) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredSuppliers].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }

      return 0;
    });

    setFilteredSuppliers(sortedData);
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) { return <Badge className="bg-green-100 text-green-800">Excellent</Badge>; }
    if (score >= 75) { return <Badge className="bg-blue-100 text-blue-800">Good</Badge>; }
    if (score >= 60) { return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>; }

    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading supplier data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Supplier Performance Metrics
        </h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time Range</SelectLabel>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last Quarter</SelectItem>
                <SelectItem value="12months">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Supplier Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Performance Rankings</CardTitle>
          <CardDescription>
            Comparing suppliers based on lead time, on-time delivery, and price
            competitiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => requestSort('leadTime')}
                >
                  <div className="flex items-center">
                    Avg. Lead Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => requestSort('onTimeDelivery')}
                >
                  <div className="flex items-center">
                    On-Time Delivery
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => requestSort('priceIndex')}
                >
                  <div className="flex items-center">
                    Price Index
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => requestSort('quality')}
                >
                  <div className="flex items-center">
                    Quality
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => requestSort('performance')}
                >
                  <div className="flex items-center">
                    Overall Score
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedSupplier(supplier)}
                >
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.leadTime} days</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={supplier.onTimeDelivery}
                        className="h-2 w-24"
                      />
                      <span>{supplier.onTimeDelivery}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {supplier.priceIndex < 1 ? (
                      <Badge className="bg-green-100 text-green-800">
                        -{(100 - supplier.priceIndex * 100).toFixed(0)}% below
                        avg
                      </Badge>
                    ) : supplier.priceIndex > 1 ? (
                      <Badge className="bg-red-100 text-red-800">
                        +{(supplier.priceIndex * 100 - 100).toFixed(0)}% above
                        avg
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800">
                        Average
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(supplier.quality / 20)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 fill-current'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                      <span className="ml-2">{supplier.quality}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {supplier.performance}/100{' '}
                      {getPerformanceBadge(supplier.performance)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Supplier Comparison Charts */}
      {comparisonData && (
        <Card>
          <CardHeader>
            <CardTitle>Supplier Comparison</CardTitle>
            <CardDescription>
              Compare key metrics across your top suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="radar">
              <TabsList>
                <TabsTrigger value="radar">Radar Comparison</TabsTrigger>
                <TabsTrigger value="bar">Bar Comparison</TabsTrigger>
                <TabsTrigger value="scatter">Price vs. Quality</TabsTrigger>
              </TabsList>

              <TabsContent value="radar" className="pt-4">
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      outerRadius={150}
                      data={comparisonData.radarData}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      {comparisonData.suppliers.map((supplier, index) => (
                        <Radar
                          key={supplier}
                          name={supplier}
                          dataKey={supplier}
                          stroke={COLORS[index % COLORS.length]}
                          fill={COLORS[index % COLORS.length]}
                          fillOpacity={0.3}
                        />
                      ))}
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="bar" className="pt-4">
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData.barData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {comparisonData.suppliers.map((supplier, index) => (
                        <Bar
                          key={supplier}
                          dataKey={supplier}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="scatter" className="pt-4">
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="price"
                        name="Price Index"
                        label={{
                          value: 'Price Index (%)',
                          position: 'bottom',
                          offset: 0,
                        }}
                        domain={[80, 120]}
                      />
                      <YAxis
                        type="number"
                        dataKey="quality"
                        name="Quality Score"
                        label={{
                          value: 'Quality Score (%)',
                          angle: -90,
                          position: 'left',
                        }}
                        domain={[70, 100]}
                      />
                      <ZAxis
                        type="number"
                        dataKey="orderCount"
                        range={[100, 600]}
                        name="Orders"
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;

                            return (
                              <div className="bg-white p-4 border rounded shadow-lg">
                                <p className="font-bold">{data.name}</p>
                                <p>Quality: {data.quality}%</p>
                                <p>Price Index: {data.price}%</p>
                                <p>Orders: {data.orderCount}</p>
                              </div>
                            );
                          }

                          return null;
                        }}
                      />
                      <Legend />
                      <Scatter
                        name="Suppliers"
                        data={comparisonData.scatterData}
                        fill="#8884d8"
                      >
                        {comparisonData.scatterData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
