'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  getInventoryValueByCategory,
  getInventoryQuantityByLocation,
  getLowStockItems,
  BarChartData,
} from '../services/chartDataServices';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ChartType = 'categoryValue' | 'locationQuantity' | 'lowStock';

export function Overview () {
  const [data, setData] = useState<BarChartData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('categoryValue');

  useEffect(() => {
    async function fetchData () {
      setIsLoading(true);
      setError(null);

      try {
        let result;

        switch (chartType) {
        case 'categoryValue':
          result = await getInventoryValueByCategory();
          break;
        case 'locationQuantity':
          result = await getInventoryQuantityByLocation();
          break;
        case 'lowStock':
          result = await getLowStockItems(5); // Items with stock level <= 5
          break;
        default:
          result = await getInventoryValueByCategory();
        }

        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch chart data');
        }
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError('An unexpected error occurred while loading chart data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [chartType]);

  const getChartTitle = () => {
    switch (chartType) {
    case 'categoryValue':
      return 'Inventory Value by Category';
    case 'locationQuantity':
      return 'Item Quantity by Location';
      // case "lowStock": return "Low Stock Items";
    default:
      return 'Inventory Overview';
    }
  };

  const getYAxisLabel = () => {
    switch (chartType) {
    case 'categoryValue':
      return 'Value ($)';
    case 'locationQuantity':
      return 'Quantity';
      // case "lowStock": return "Stock Level";
    default:
      return '';
    }
  };

  const formatYAxis = (value: number) => {
    if (chartType === 'categoryValue') {
      return `$${value}`;
    }

    return value.toString();
  };

  // Custom formatter for the tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-background p-2 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {chartType === 'categoryValue' ? (
            <p className="text-primary">{`Value: $${payload[0].value.toLocaleString()}`}</p>
          ) : (
            <p className="text-primary">{`Quantity: ${payload[0].value}`}</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{getChartTitle()}</CardTitle>
          <CardDescription>
            {chartType === 'categoryValue'
              ? 'Overview of inventory value distributed by category'
              : chartType === 'locationQuantity'
                ? 'Distribution of inventory items across locations'
                : 'Items with stock level at or below threshold'}
          </CardDescription>
        </div>
        <Select
          value={chartType}
          onValueChange={(value) => setChartType(value as ChartType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="categoryValue">Value by Category</SelectItem>
            <SelectItem value="locationQuantity">
              Quantity by Location
            </SelectItem>
            {/* <SelectItem value="lowStock">Low Stock Items</SelectItem> */}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-[350px] flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : data.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
              <h3 className="mt-2 text-lg font-semibold">No data available</h3>
              <p className="text-muted-foreground">
                There is no data to display for this chart.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={0}
                tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value
                }
                // angle={-45}
                // textAnchor="end"
                height={70}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
                label={{
                  value: getYAxisLabel(),
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                name={chartType === 'categoryValue' ? 'Value' : 'Quantity'}
                dataKey="value"
                className="fill-primary"
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || 'currentColor'}
                    className={entry.color ? '' : 'fill-primary'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
