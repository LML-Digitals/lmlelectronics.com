'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon,
  Download,
  FileBarChart,
  FileCog,
  FileSpreadsheet,
  Loader2,
  Printer,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  generateInventoryStockReport,
  generateLowStockReport,
  generateSupplierReport,
  exportReport,
  type ReportFilters,
} from '../services/reportExportService';
import {
  getLocationsForReports,
  getCategoriesForReports,
  getSuppliersForReports,
  type LocationData,
  type CategoryData,
  type SupplierData,
} from '../services/reportDataService';

// Define the form schema
const reportFormSchema = z.object({
  reportType: z.string({
    error: 'Please select a report type.',
  }),
  dateRange: z.object({
    from: z.date({
      error: 'Start date is required.',
    }),
    to: z.date({
      error: 'End date is required.',
    }),
  }),
  locations: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  suppliers: z.array(z.number()).optional(), // Changed from z.array(z.string())
  includeZeroStock: z.boolean(),
  format: z.enum(['csv', 'pdf', 'excel'], {
    error: 'Please select an export format.',
  }),
  groupBy: z.enum(['none', 'category', 'location', 'supplier']),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export function InventoryReports() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [reportPreview, setReportPreview] = useState<any[]>([]);
  const [reportTotals, setReportTotals] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
  });
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: 'inventory',
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
      locations: [],
      categories: [],
      suppliers: [],
      includeZeroStock: false,
      format: 'pdf',
      groupBy: 'none',
    },
  });

  // Fetch form data on component mount
  useEffect(() => {
    async function fetchFilterData() {
      setIsDataLoading(true);
      try {
        // Fetch locations
        const locationsResult = await getLocationsForReports();
        if (locationsResult.success && locationsResult.data) {
          setLocations(locationsResult.data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load locations',
          });
        }

        // Fetch categories
        const categoriesResult = await getCategoriesForReports();
        if (categoriesResult.success && categoriesResult.data) {
          setCategories(categoriesResult.data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load categories',
          });
        }

        // Fetch suppliers
        const suppliersResult = await getSuppliersForReports();
        if (suppliersResult.success && suppliersResult.data) {
          setSuppliers(suppliersResult.data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load suppliers',
          });
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load form data',
        });
      } finally {
        setIsDataLoading(false);
      }
    }

    fetchFilterData();
  }, []);

  async function onSubmit(data: ReportFormValues) {
    setIsLoading(true);

    // Create base filters for any report type
    const filters: ReportFilters = {
      reportType: data.reportType,
      dateRange: data.dateRange,
      suppliers: data.suppliers,
      locations: data.locations,
      categories: data.categories,
      includeZeroStock: data.includeZeroStock,
      groupBy: data.groupBy,
    };

    // Generate the report based on type
    try {
      let result;
      switch (data.reportType) {
        case 'inventory':
          result = await generateInventoryStockReport(filters);
          break;
        case 'value':
          result = await generateInventoryStockReport(filters);
          break;
        case 'lowStock':
          result = await generateLowStockReport(filters, 5);
          break;
        case 'supplier':
          result = await generateSupplierReport(filters);
          break;
        default:
          result = await generateInventoryStockReport(filters);
      }

      if (result.success && result.data) {
        // Update preview with actual data
        setReportPreview(result.data.slice(0, 10)); // Show first 10 items

        // Update totals
        setReportTotals({
          totalItems: result.totalItems || 0,
          totalQuantity: result.totalQuantity || 0,
          totalValue: result.totalValue || 0,
        });

        setReportGenerated(true);
        setDialogOpen(false);

        // Show success toast
        toast({
          title: 'Report Generated',
          description: `Successfully generated report with ${result.totalItems} items.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to generate report',
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred while generating the report',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle exports
  const handleExport = async (format: string) => {
    setIsLoading(true);
    try {
      const result = await exportReport(reportPreview, format);

      if (result.success && result.data) {
        // Create blob from the content with proper content type
        const blob = new Blob([result.data.content], {
          type: result.data.contentType,
        });

        // Create download URL
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = result.data.fileName;
        document.body.appendChild(link);
        link.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }
      if (result.success) {
        toast({
          title: 'Export Successful',
          description: `Report exported as ${format.toUpperCase()} successfully.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Export Failed',
          description:
            result.error || `Failed to export as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'An error occurred during export',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Reports</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileCog className="mr-2 h-4 w-4" />
              Configure Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Configuration</DialogTitle>
              <DialogDescription>
                Customize your report parameters and choose what data to include
              </DialogDescription>
            </DialogHeader>

            {isDataLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading form options...</span>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Report Type */}
                  <FormField
                    control={form.control}
                    name="reportType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a report type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="inventory">
                              Inventory Stock
                            </SelectItem>
                            <SelectItem value="value">
                              Inventory Value
                            </SelectItem>
                            <SelectItem value="lowStock">
                              Low Stock Items
                            </SelectItem>
                            <SelectItem value="movement">
                              Stock Movement
                            </SelectItem>
                            <SelectItem value="supplier">
                              Supplier Analysis
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the type of report you want to generate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date Range */}
                  <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date Range</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value?.from ? (
                                  field.value.to ? (
                                    <>
                                      {format(field.value.from, 'LLL dd, y')} -{' '}
                                      {format(field.value.to, 'LLL dd, y')}
                                    </>
                                  ) : (
                                    format(field.value.from, 'LLL dd, y')
                                  )
                                ) : (
                                  <span>Pick a date range</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          The date range for the report
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Filters</h4>

                      {/* Locations */}
                      <FormField
                        control={form.control}
                        name="locations"
                        render={() => (
                          <FormItem>
                            <div className="mb-2">
                              <FormLabel>Locations</FormLabel>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {locations.map((location) => (
                                <FormField
                                  key={location.id}
                                  control={form.control}
                                  name="locations"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={location.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              location.id
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...(field.value || []),
                                                    location.id,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) =>
                                                        value !== location.id
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {location.name}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Categories */}
                      <FormField
                        control={form.control}
                        name="categories"
                        render={() => (
                          <FormItem>
                            <div className="mb-2">
                              <FormLabel>Categories</FormLabel>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {categories.map((category) => (
                                <FormField
                                  key={category.id}
                                  control={form.control}
                                  name="categories"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={category.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              category.id
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...(field.value || []),
                                                    category.id,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) =>
                                                        value !== category.id
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {category.name}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      {/* Suppliers */}
                      <FormField
                        control={form.control}
                        name="suppliers"
                        render={() => (
                          <FormItem>
                            <div className="mb-2">
                              <FormLabel>Suppliers</FormLabel>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {suppliers.map((supplier) => (
                                <FormField
                                  key={supplier.id}
                                  control={form.control}
                                  name="suppliers"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={supplier.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              supplier.id
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...(field.value || []),
                                                    supplier.id, // supplier.id is already a number
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) =>
                                                        value !== supplier.id
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {supplier.name}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Include Zero Stock */}
                      <FormField
                        control={form.control}
                        name="includeZeroStock"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Include zero stock items</FormLabel>
                              <FormDescription>
                                Show items that are currently out of stock
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Group By */}
                      <FormField
                        control={form.control}
                        name="groupBy"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Group By</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="none" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    None
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="category" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Category
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="location" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Location
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="supplier" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Supplier
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="mt-2"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="mt-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileBarChart className="mr-2 h-4 w-4" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Report Preview */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                {reportGenerated
                  ? 'Generated report data ready for export'
                  : 'Configure and generate a report to view data'}
              </CardDescription>
            </div>
            {reportGenerated && (
              <div className="print:hidden flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  disabled={isLoading}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  disabled={isLoading}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {reportPreview.length > 0 ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportPreview.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell className="text-right">
                          {item.stock}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.value?.toLocaleString() || '0.00'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div>
                  Showing {reportPreview.length} of {reportTotals.totalItems}{' '}
                  items
                </div>
                <div className="flex gap-4">
                  <div>
                    Total Items:{' '}
                    <span className="font-semibold">
                      {reportTotals.totalItems.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    Total Quantity:{' '}
                    <span className="font-semibold">
                      {reportTotals.totalQuantity.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    Total Value:{' '}
                    <span className="font-semibold">
                      ${reportTotals.totalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileBarChart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No Report Generated Yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Click the "Configure Report" button above to set up your report
                parameters, then generate a report to view the data.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Configure Report
              </Button>
            </div>
          )}
        </CardContent>
        {reportGenerated && (
          <CardFooter className="border-t bg-muted/40 flex justify-between">
            <div className="text-sm text-muted-foreground">
              Report generated on{' '}
              {format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDialogOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Modify Report
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
