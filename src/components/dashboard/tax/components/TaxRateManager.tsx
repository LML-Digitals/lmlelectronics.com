'use client';

import { useState } from 'react';
import { TaxCategory, TaxRate as TaxRateType } from '@prisma/client';
import {
  createTaxRate,
  updateTaxRate,
  deleteTaxRate,
  TaxRateInput,
} from '../services/taxService';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const taxRateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.nativeEnum(TaxCategory),
  rate: z.number().min(0, 'Rate must be a positive number'),
  isActive: z.boolean(),
});

type TaxRateFormValues = z.infer<typeof taxRateSchema>;

export default function TaxRateManager({
  taxRates,
  onTaxRatesChange,
}: {
  taxRates: TaxRateType[];
  onTaxRatesChange?: () => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRateType | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localTaxRates, setLocalTaxRates] = useState<TaxRateType[]>(taxRates);

  const form = useForm<TaxRateFormValues>({
    resolver: zodResolver(taxRateSchema),
    defaultValues: {
      name: '',
      description: '',
      category: TaxCategory.STATE,
      rate: 0,
      isActive: true,
    },
  });

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      form.reset({
        name: '',
        description: '',
        category: TaxCategory.STATE,
        rate: 0,
        isActive: true,
      });
      setEditingTaxRate(null);
      setIsEditing(false);
    }
  };

  const editTaxRate = (taxRate: TaxRateType) => {
    setEditingTaxRate(taxRate);
    setIsEditing(true);

    form.reset({
      id: taxRate.id,
      name: taxRate.name,
      description: taxRate.description || '',
      category: taxRate.category,
      rate: taxRate.rate,
      isActive: taxRate.isActive,
    });

    setOpen(true);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleting(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const result = await deleteTaxRate(deletingId);

    if (result.success) {
      toast({
        title: 'Tax rate deleted',
        description: 'The tax rate has been successfully deleted.',
      });
      handleTaxRatesChange();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete tax rate',
        variant: 'destructive',
      });
    }

    setIsDeleting(false);
    setDeletingId(null);
  };

  const onSubmit = async (data: TaxRateFormValues) => {
    const taxRateInput: TaxRateInput = {
      name: data.name,
      description: data.description,
      category: data.category,
      rate: data.rate,
      isActive: data.isActive,
    };

    const result =
      isEditing && data.id
        ? await updateTaxRate(data.id, taxRateInput)
        : await createTaxRate(taxRateInput);

    if (result.success) {
      toast({
        title: isEditing ? 'Tax rate updated' : 'Tax rate created',
        description: isEditing
          ? 'The tax rate has been successfully updated'
          : 'A new tax rate has been successfully created',
      });
      handleTaxRatesChange();
      handleOpenChange(false);
    } else {
      toast({
        title: 'Error',
        description:
          result.error ||
          `Failed to ${isEditing ? 'update' : 'create'} tax rate`,
        variant: 'destructive',
      });
    }
  };

  const formatCategory = (category: TaxCategory) => {
    return category
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleTaxRatesChange = () => {
    if (onTaxRatesChange) {
      onTaxRatesChange();
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg sm:text-xl">Tax Rates</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Configure tax rates applied to sales
            </CardDescription>
          </div>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Tax Rate</span>
                <span className="sm:hidden">Add Rate</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{isEditing ? 'Edit' : 'Add'} Tax Rate</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  {isEditing
                    ? 'Update the tax rate details below.'
                    : 'Create a new tax rate for calculating taxes on sales.'}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 pt-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. California State Tax"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add details about this tax rate"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(TaxCategory).map((category) => (
                                <SelectItem key={category} value={category}>
                                  {formatCategory(category)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm sm:text-base">Active</FormLabel>
                          <FormDescription className="text-xs sm:text-sm">
                            Only active tax rates will be used in calculations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" className="w-full sm:w-auto">
                      {isEditing ? 'Update' : 'Create'} Tax Rate
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption className="text-sm">List of configured tax rates</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[100px] hidden sm:table-cell">Category</TableHead>
                  <TableHead className="min-w-[80px] text-right">Rate (%)</TableHead>
                  <TableHead className="min-w-[80px] hidden sm:table-cell">Status</TableHead>
                  <TableHead className="min-w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxRates.map((taxRate) => (
                  <TableRow key={taxRate.id}>
                    <TableCell className="font-medium text-sm sm:text-base">{taxRate.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{formatCategory(taxRate.category)}</TableCell>
                    <TableCell className="text-right text-sm sm:text-base">
                      {taxRate.rate.toFixed(2)}%
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          taxRate.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {taxRate.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 sm:gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => editTaxRate(taxRate)}
                          className="h-7 w-7 sm:h-8 sm:w-8"
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(taxRate.id)}
                          className="h-7 w-7 sm:h-8 sm:w-8"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {taxRates.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      <div className="flex flex-col items-center justify-center h-32 sm:h-48 text-gray-500">
                        <p className="text-base sm:text-lg font-medium">No tax rates configured</p>
                        <p className="text-xs sm:text-sm">Add a tax rate to get started.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Are you sure?</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete the tax
              rate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDeleting(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
