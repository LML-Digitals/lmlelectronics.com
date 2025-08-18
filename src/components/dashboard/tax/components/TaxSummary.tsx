'use client';

import { useState, useEffect } from 'react';
import { TaxCategory } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subQuarters,
  subYears,
  format,
  parseISO,
} from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  getTaxSummary,
  TaxSummary as TaxSummaryType,
} from '../services/taxService';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

export default function TaxSummary () {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('quarter');
  const [summary, setSummary] = useState<TaxSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSummary = async (period = 'quarter') => {
    setIsLoading(true);
    try {
      let from, to;
      const now = new Date();

      switch (period) {
      case 'quarter':
        from = startOfQuarter(now);
        to = endOfQuarter(now);
        break;
      case 'year':
        from = startOfYear(now);
        to = endOfYear(now);
        break;
      case 'previousQuarter':
        from = startOfQuarter(subQuarters(now, 1));
        to = endOfQuarter(subQuarters(now, 1));
        break;
      case 'previousYear':
        from = startOfYear(subYears(now, 1));
        to = endOfYear(subYears(now, 1));
        break;
      default:
        from = startOfQuarter(now);
        to = endOfQuarter(now);
      }

      const result = await getTaxSummary({ from, to });

      if (result.success && result.summary) {
        setSummary(result.summary);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load tax summary',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading tax summary:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading tax summary',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary(currentTab);
  }, [currentTab]);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatCategory = (category: TaxCategory) => {
    return category
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getPeriodLabel = () => {
    const now = new Date();

    switch (currentTab) {
    case 'quarter':
      return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
    case 'year':
      return now.getFullYear().toString();
    case 'previousQuarter':
      const prevQuarter = subQuarters(now, 1);

      return `Q${
        Math.floor(prevQuarter.getMonth() / 3) + 1
      } ${prevQuarter.getFullYear()}`;
    case 'previousYear':
      return (now.getFullYear() - 1).toString();
    default:
      return '';
    }
  };

  // Prepare pie chart data
  const pieChartData
    = summary?.byCategoryBreakdown.map((item) => ({
      name: formatCategory(item.category),
      value: item.taxDue,
    })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Tax Summary</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Overview of your tax liability by category and period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quarter" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 h-auto min-h-[40px] sm:min-h-[36px] p-1">
            <TabsTrigger value="quarter" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 py-2 sm:py-1">Current Quarter</TabsTrigger>
            <TabsTrigger value="year" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 py-2 sm:py-1">Current Year</TabsTrigger>
            <TabsTrigger value="previousQuarter" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 py-2 sm:py-1">Previous Quarter</TabsTrigger>
            <TabsTrigger value="previousYear" className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3 py-2 sm:py-1">Previous Year</TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab}>
            {isLoading ? (
              <div className="h-48 sm:h-72 w-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm sm:text-base">Loading tax summary...</p>
              </div>
            ) : !summary ? (
              <div className="h-48 sm:h-72 w-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm sm:text-base">
                  No tax data available for this period
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-background p-4 rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Taxable Income
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold">
                      {formatCurrency(summary.totalTaxable)}
                    </p>
                  </div>
                  <div className="bg-background p-4 rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Total Tax Due
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold">
                      {formatCurrency(summary.totalTaxDue)}
                    </p>
                  </div>
                  <div className="bg-background p-4 rounded-lg border sm:col-span-2 lg:col-span-1">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Unpaid Taxes
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold">
                      {formatCurrency(summary.totalUnpaid)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8">
                  <h3 className="text-base sm:text-lg font-medium mb-4">
                    Tax Breakdown by Category ({getPeriodLabel()})
                  </h3>

                  {summary.byCategoryBreakdown.length === 0 ? (
                    <p className="text-muted-foreground text-sm sm:text-base">
                      No category data available for this period
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                      <div className="h-48 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent || 0 * 100).toFixed(0)}%`
                              }
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => formatCurrency(Number(value))
                              }
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="overflow-x-auto">
                        <div className="rounded-md border min-w-full">
                          <table className="w-full caption-bottom text-sm">
                            <thead>
                              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-xs sm:text-sm">
                                  Category
                                </th>
                                <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm">
                                  Taxable Amount
                                </th>
                                <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm">
                                  Tax Due
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {summary.byCategoryBreakdown.map((item, index) => (
                                <tr
                                  key={index}
                                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                >
                                  <td className="p-2 sm:p-4 align-middle text-xs sm:text-sm">
                                    {formatCategory(item.category)}
                                  </td>
                                  <td className="p-2 sm:p-4 align-middle text-right text-xs sm:text-sm">
                                    {formatCurrency(item.taxable)}
                                  </td>
                                  <td className="p-2 sm:p-4 align-middle text-right text-xs sm:text-sm">
                                    {formatCurrency(item.taxDue)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t">
                                <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-xs sm:text-sm">
                                  Total
                                </th>
                                <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm">
                                  {formatCurrency(summary.totalTaxable)}
                                </th>
                                <th className="h-10 sm:h-12 px-2 sm:px-4 text-right align-middle font-medium text-xs sm:text-sm">
                                  {formatCurrency(summary.totalTaxDue)}
                                </th>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
