'use client';

import { useState, useEffect } from 'react';
import { TaxCategory, TaxRecord, TaxRate } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  getTaxRecords,
  markTaxAsPaid,
  TaxReportFilters,
} from '../services/taxService';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Type for tax records with relations
type TaxRecordWithRelations = TaxRecord & {
  taxRate: TaxRate;
  order?: {
    id: string;
    createdAt: Date;
    total: number;
  } | null;
  registerSession?: {
    id: string;
    createdAt: Date;
    total: number;
  } | null;
};

const filtersSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
  category: z
    .nativeEnum(TaxCategory)
    .or(z.enum(['all']))
    .optional(),
  isPaid: z.boolean().optional(),
});

type FiltersFormValues = z.infer<typeof filtersSchema>;

export default function TaxReports () {
  const { toast } = useToast();
  const [taxRecords, setTaxRecords] = useState<TaxRecordWithRelations[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<FiltersFormValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      isPaid: false,
      category: 'all',
    },
  });

  const loadTaxRecords = async (filters: TaxReportFilters | FiltersFormValues = {}) => {
    setIsLoading(true);
    try {
      // Create a properly typed object
      const apiFilters: TaxReportFilters = {};

      // Only copy properties that match TaxReportFilters type
      if ('from' in filters && filters.from) { apiFilters.from = filters.from; }
      if ('to' in filters && filters.to) { apiFilters.to = filters.to; }
      if ('isPaid' in filters && filters.isPaid !== undefined) { apiFilters.isPaid = filters.isPaid; }

      // Only add category if it's not 'all' and is a valid TaxCategory
      if (
        'category' in filters
        && filters.category !== undefined
        && filters.category !== 'all'
      ) {
        apiFilters.category = filters.category;
      }

      const result = await getTaxRecords(apiFilters);

      if (result.success && result.taxRecords) {
        setTaxRecords(result.taxRecords as TaxRecordWithRelations[]);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load tax records',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading tax records:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading tax records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTaxRecords();
  }, []);

  const onSubmit = async (data: FiltersFormValues) => {
    // Pass the form values which will be converted in loadTaxRecords
    await loadTaxRecords(data);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(taxRecords.map((record) => record.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const handleMarkAsPaid = async () => {
    if (selectedRecords.length === 0) {
      toast({
        title: 'No records selected',
        description: 'Please select at least one tax record to mark as paid',
        variant: 'destructive',
      });

      return;
    }

    setIsProcessing(true);
    try {
      const result = await markTaxAsPaid(selectedRecords);

      if (result.success) {
        toast({
          title: 'Tax records updated',
          description: `Successfully marked ${result.count} tax records as paid.`,
        });

        // Refresh the data
        await loadTaxRecords(form.getValues());

        // Clear selections
        setSelectedRecords([]);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update tax records',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while updating tax records',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToCSV = () => {
    if (taxRecords.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no tax records to export',
      });

      return;
    }

    // Create CSV content
    const headers = [
      'ID',
      'Transaction ID',
      'Category',
      'Tax Rate',
      'Taxable Amount',
      'Tax Amount',
      'Period Start',
      'Period End',
      'Status',
      'Date Created',
    ];
    const rows = taxRecords.map((record) => [
      record.id,
      record.order?.id || record.registerSession?.id || 'N/A',
      record.taxRate.category,
      `${record.taxRate.name} (${record.taxRate.rate}%)`,
      record.taxableAmount.toFixed(2),
      record.taxAmount.toFixed(2),
      format(new Date(record.periodStart), 'yyyy-MM-dd'),
      format(new Date(record.periodEnd), 'yyyy-MM-dd'),
      record.isPaid ? 'Paid' : 'Unpaid',
      format(new Date(record.createdAt), 'yyyy-MM-dd'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute(
      'download',
      `tax_report_${format(new Date(), 'yyyy-MM-dd')}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCategory = (category: TaxCategory) => {
    return category
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const totalTaxDue = taxRecords
    .filter((record) => !record.isPaid)
    .reduce((sum, record) => sum + record.taxAmount, 0);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Tax Records</CardTitle>
            <CardDescription className="text-sm sm:text-base">View and manage your tax records</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={taxRecords.length === 0}
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkAsPaid}
              disabled={selectedRecords.length === 0 || isProcessing}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Mark as Paid</span>
              <span className="sm:hidden">Mark Paid</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <FormField
              control={form.control}
              name="from"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm sm:text-base">From Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal text-xs sm:text-sm',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Any date</span>
                          )}
                          <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm sm:text-base">To Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal text-xs sm:text-sm',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Any date</span>
                          )}
                          <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm sm:text-base">Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {Object.values(TaxCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {formatCategory(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm sm:text-base">Payment Status</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">Unpaid</SelectItem>
                      <SelectItem value="true">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-end">
              <Button type="submit" className="w-full sm:w-auto">
                Apply Filters
              </Button>
            </div>
          </form>
        </Form>

        {!isLoading && taxRecords.filter((r) => !r.isPaid).length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <h3 className="text-amber-800 font-medium text-sm sm:text-base">
              Tax Liability Summary
            </h3>
            <p className="text-amber-700 text-sm sm:text-base">
              You have <strong>${totalTaxDue.toFixed(2)}</strong> in unpaid
              taxes.
            </p>
          </div>
        )}

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedRecords.length === taxRecords.length
                      && taxRecords.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="min-w-[120px]">Transaction</TableHead>
                <TableHead className="min-w-[100px] hidden sm:table-cell">Tax Rate</TableHead>
                <TableHead className="min-w-[100px] hidden md:table-cell">Category</TableHead>
                <TableHead className="min-w-[100px] text-right">Taxable Amount</TableHead>
                <TableHead className="min-w-[100px] text-right hidden lg:table-cell">Tax Amount</TableHead>
                <TableHead className="min-w-[120px] hidden md:table-cell">Period</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center h-32 sm:h-48 text-gray-500">
                      <p className="text-base sm:text-lg font-medium">Loading tax records...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : taxRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center h-32 sm:h-48 text-gray-500">
                      <p className="text-base sm:text-lg font-medium">No tax records found</p>
                      <p className="text-xs sm:text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                taxRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRecords.includes(record.id)}
                        onCheckedChange={() => toggleRecordSelection(record.id)}
                        aria-label={`Select row ${record.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-sm sm:text-base">
                      {record.order?.id || record.registerSession?.id || 'N/A'}
                      <div className="text-xs text-muted-foreground">
                        {format(
                          new Date(record.order?.createdAt
                              || record.registerSession?.createdAt
                              || record.createdAt),
                          'MMM d, yyyy',
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{record.taxRate.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {formatCategory(record.taxRate.category)}
                    </TableCell>
                    <TableCell className="text-right text-sm sm:text-base">
                      ${record.taxableAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-sm sm:text-base hidden lg:table-cell">
                      ${record.taxAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {format(new Date(record.periodStart), 'MMM d')} -{' '}
                      {format(new Date(record.periodEnd), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.isPaid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {record.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
