'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { createWarranty, updateWarranty } from './services/warrantyCrud';
import {
  WarrantyProps,
  WarrantyInput,
  inventoryItemProps,
  inventoryVariationProps,
  WarrantyTypeProps,
  WarrantyCoverage,
} from './types/types';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  getCustomersForSelect,
  getInventoryItemsForSelect,
} from './services/customerAndProductService';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { getAllWarrantyTypes } from './services/warrantyTypeService';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface WarrantyFormProps {
  warranty?: WarrantyProps;
  onSuccess?: () => void;
}

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

const COVERAGE_OPTIONS = [
  { id: 'defects', label: 'Manufacturing Defects' },
  { id: 'parts', label: 'Replacement Parts' },
  { id: 'labor', label: 'Labor' },
  { id: 'accidental', label: 'Accidental Damage' },
  { id: 'water', label: 'Water/Liquid Damage' },
  { id: 'priority', label: 'Priority Support' },
  { id: 'replacements', label: 'Full Replacements' },
];

const DEFAULT_COVERAGE: WarrantyCoverage = {
  defects: true,
  parts: true,
  labor: true,
  accidental: false,
  water: false,
  priority: false,
  replacements: false,
};

export function WarrantyForm ({ warranty, onSuccess }: WarrantyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WarrantyInput>({
    warrantyTypeId: warranty?.warrantyTypeId || '',
    startDate: warranty?.startDate || new Date(),
    endDate: warranty?.endDate || undefined,
    inventoryItemId: warranty?.inventoryItemId || '',
    inventoryVariationId: warranty?.inventoryVariationId || '',
    customerId: warranty?.customerId || '',
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventoryItems, setInventoryItems] = useState<inventoryItemProps[]>([]);
  const [variations, setVariations] = useState<inventoryVariationProps[]>([]);
  const [warrantyTypes, setWarrantyTypes] = useState<WarrantyTypeProps[]>([]);
  const [selectedWarrantyType, setSelectedWarrantyType]
    = useState<WarrantyTypeProps | null>(null);
  const [showEndDate, setShowEndDate] = useState(warranty?.endDate !== null && warranty?.endDate !== undefined);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  useEffect(() => {
    async function fetchData () {
      try {
        const [customersData, itemsData, warrantyTypesData] = await Promise.all([
          getCustomersForSelect(),
          getInventoryItemsForSelect(),
          getAllWarrantyTypes(),
        ]);

        setCustomers(customersData);
        setInventoryItems(itemsData);
        setWarrantyTypes(warrantyTypesData);

        // If editing, set the selected warranty type
        if (warranty?.warrantyTypeId) {
          const type = warrantyTypesData.find((t) => t.id === warranty.warrantyTypeId);

          if (type) {
            setSelectedWarrantyType(type);
          }
        }

        // If editing and we have an inventoryItemId, set the variations
        if (warranty?.inventoryItemId) {
          const selectedItem = itemsData.find((item) => item.id === warranty.inventoryItemId);

          if (selectedItem && selectedItem.variations) {
            setVariations(selectedItem.variations);
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data for the form. Please try again.',
          variant: 'destructive',
        });
      }
    }

    fetchData();
  }, [warranty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.warrantyTypeId) {
        throw new Error('Please select a warranty type');
      }

      if (!formData.inventoryItemId) {
        throw new Error('Please select an inventory item');
      }

      if (!formData.inventoryVariationId) {
        throw new Error('Please select a product variation');
      }

      if (!formData.customerId) {
        throw new Error('Please select a customer');
      }

      console.log('Submitting warranty data:', formData);

      if (warranty) {
        await updateWarranty(warranty.id, formData);
        toast({
          title: 'Success',
          description: 'Warranty updated successfully',
        });
      } else {
        await createWarranty(formData);
        toast({
          title: 'Success',
          description: 'Warranty created successfully',
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving warranty:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to save warranty. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleWarrantyTypeChange = (warrantyTypeId: string) => {
    // Find the selected warranty type to get its duration
    const selectedType = warrantyTypes.find((wt) => wt.id === warrantyTypeId);

    setSelectedWarrantyType(selectedType || null);

    // Update form data with the new type
    setFormData((prev) => {
      const newData = { ...prev, warrantyTypeId };

      // If the warranty type has a duration, calculate end date automatically
      if (selectedType && selectedType.duration > 0) {
        const startDate = new Date(prev.startDate);
        const endDate = new Date(startDate);

        endDate.setMonth(endDate.getMonth() + selectedType.duration);
        newData.endDate = endDate;
        setShowEndDate(true);
      }
      // If duration is 0 (lifetime), set endDate to null
      else if (selectedType && selectedType.duration === 0) {
        newData.endDate = null;
        setShowEndDate(false);
      }

      return newData;
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) { return; }

    setFormData((prev) => {
      const newData = { ...prev, startDate: date };

      // Recalculate end date if a warranty type is selected
      if (prev.warrantyTypeId) {
        const selectedType = warrantyTypes.find((wt) => wt.id === prev.warrantyTypeId);

        if (selectedType && selectedType.duration > 0) {
          const endDate = new Date(date);

          endDate.setMonth(endDate.getMonth() + selectedType.duration);
          newData.endDate = endDate;
        }
      }

      return newData;
    });
  };

  const handleItemChange = (itemId: string) => {
    // Find the selected item first
    const selectedItem = inventoryItems.find((item) => item.id === itemId);

    // Reset variation and update item ID
    setFormData({
      ...formData,
      inventoryItemId: itemId,
      inventoryVariationId: '',
    });

    // Find and set variations for the selected item
    if (selectedItem && selectedItem.variations) {
      setVariations(selectedItem.variations);
    } else {
      setVariations([]);
    }
  };

  // Get the current coverage from the selected warranty type
  const getCurrentCoverage = (): WarrantyCoverage => {
    if (selectedWarrantyType?.coverage) {
      // If the coverage is a JSON string, parse it
      if (typeof selectedWarrantyType.coverage === 'string') {
        try {
          return JSON.parse(selectedWarrantyType.coverage);
        } catch (e) {
          console.error('Error parsing coverage JSON:', e);

          return DEFAULT_COVERAGE;
        }
      }

      // If it's already an object, use it
      return selectedWarrantyType.coverage as WarrantyCoverage;
    }

    return DEFAULT_COVERAGE;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="warrantyTypeId">Warranty Type</Label>
          <Select
            value={formData.warrantyTypeId}
            onValueChange={handleWarrantyTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a warranty type" />
            </SelectTrigger>
            <SelectContent>
              {warrantyTypes.length === 0 ? (
                <SelectItem value="none" disabled>
                  No warranty types available
                </SelectItem>
              ) : (
                warrantyTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} -{' '}
                    {type.duration === 0
                      ? 'Lifetime'
                      : `${type.duration} month${
                        type.duration !== 1 ? 's' : ''
                      }`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formData.warrantyTypeId && (
            <p className="text-sm text-muted-foreground mt-1">
              {
                warrantyTypes.find((t) => t.id === formData.warrantyTypeId)
                  ?.description
              }
            </p>
          )}
          {warrantyTypes.length === 0 && (
            <p className="text-sm text-yellow-600 mt-1">
              No warranty types found. Please create warranty types first.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.startDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? (
                    format(formData.startDate, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formData.startDate
                      ? new Date(formData.startDate)
                      : undefined
                  }
                  onSelect={handleStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="endDate">End Date</Label>
              {formData.warrantyTypeId && (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showEndDate}
                    onCheckedChange={(checked) => {
                      setShowEndDate(checked);
                      if (!checked) {
                        setFormData({
                          ...formData,
                          endDate: null,
                        });
                      } else if (formData.startDate) {
                        // Find warranty type to get duration
                        const selectedType = warrantyTypes.find((type) => type.id === formData.warrantyTypeId);

                        if (selectedType && selectedType.duration > 0) {
                          const endDate = new Date(formData.startDate);

                          endDate.setMonth(endDate.getMonth() + selectedType.duration);
                          setFormData({
                            ...formData,
                            endDate,
                          });
                        } else {
                          // Default to 1 year if no duration or type found
                          const endDate = new Date(formData.startDate);

                          endDate.setFullYear(endDate.getFullYear() + 1);
                          setFormData({
                            ...formData,
                            endDate,
                          });
                        }
                      }
                    }}
                    id="custom-end-date"
                  />
                  <Label htmlFor="custom-end-date" className="text-xs">
                    Custom End Date
                  </Label>
                </div>
              )}
            </div>
            {showEndDate ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.endDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      formData.endDate ? new Date(formData.endDate) : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        setFormData({
                          ...formData,
                          endDate: date,
                        });
                      }
                    }}
                    disabled={(date) => date < new Date(formData.startDate) || date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="w-full rounded-md border border-input px-3 py-2 text-sm text-muted-foreground">
                No Expiration (Lifetime Warranty)
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerId">Customer</Label>
            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerOpen}
                  className="w-full justify-between"
                >
                  {formData.customerId
                    ? `${customers.find((customer) => customer.id === formData.customerId)?.firstName
                    } ${
                      customers.find((customer) => customer.id === formData.customerId)?.lastName}`
                    : 'Select customer...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search customer..." />
                  <CommandList>
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      {customers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={`${customer.firstName} ${customer.lastName} ${customer.email}`}
                          onSelect={(currentValue) => {
                            const selectedCustomer = customers.find((c) => `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase()
                                === currentValue.toLowerCase());

                            setFormData({
                              ...formData,
                              customerId: selectedCustomer
                                ? selectedCustomer.id
                                : '',
                            });
                            setCustomerOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              formData.customerId === customer.id
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {customer.firstName} {customer.lastName} (
                          {customer.email})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="inventoryItemId">Product</Label>
            <Popover open={productOpen} onOpenChange={setProductOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={productOpen}
                  className="w-full justify-between"
                >
                  {formData.inventoryItemId
                    ? inventoryItems.find((item) => item.id === formData.inventoryItemId)?.name
                    : 'Select product...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search product..." />
                  <CommandList>
                    <CommandEmpty>No product found.</CommandEmpty>
                    <CommandGroup>
                      {inventoryItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={(currentValue) => {
                            const selectedItem = inventoryItems.find((i) => i.name.toLowerCase()
                                === currentValue.toLowerCase());

                            if (selectedItem) {
                              handleItemChange(selectedItem.id);
                            }
                            setProductOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              formData.inventoryItemId === item.id
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {item.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label htmlFor="inventoryVariationId">Product Variation</Label>
          <Select
            value={formData.inventoryVariationId}
            onValueChange={(value) => setFormData({ ...formData, inventoryVariationId: value })
            }
            disabled={!formData.inventoryItemId || variations.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a variation" />
            </SelectTrigger>
            <SelectContent>
              {variations.length === 0 ? (
                <SelectItem value="none" disabled>
                  {formData.inventoryItemId
                    ? 'No variations available for this product'
                    : 'Select a product first'}
                </SelectItem>
              ) : (
                variations.map((variation) => (
                  <SelectItem key={variation.id} value={variation.id}>
                    {variation.name} ({variation.sku})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedWarrantyType && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="coverage">
              <AccordionTrigger>Warranty Coverage</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  {COVERAGE_OPTIONS.map((option) => {
                    const coverage = getCurrentCoverage();
                    const isChecked
                      = coverage[option.id as keyof WarrantyCoverage] ?? false;

                    return (
                      <div
                        className="flex items-center space-x-2"
                        key={option.id}
                      >
                        <Checkbox
                          id={option.id}
                          checked={isChecked}
                          disabled={true} // Read-only as coverage is defined by warranty type
                        />
                        <Label
                          htmlFor={option.id}
                          className={`text-sm font-medium leading-none ${
                            isChecked ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>
                    Coverage is determined by the selected warranty type and
                    cannot be modified here.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              {warranty ? 'Updating...' : 'Creating...'}
            </>
          ) : warranty ? (
            'Update Warranty'
          ) : (
            'Create Warranty'
          )}
        </Button>
      </div>
    </form>
  );
}
