'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  createInventoryAdjustment,
  updateInventoryAdjustment,
} from './services/inventory-adjustment';
import { useSession } from 'next-auth/react';
import { StoreLocation } from '@prisma/client';
import { InventoryItemWithRelations } from '../items/types/ItemType';
import { Plus, Edit, CircleDashed } from 'lucide-react';
import { AdjustmentsProps } from './types/types';
import { VariationWithStockLevels } from '../items/types/ItemType';

const formSchema = z.object({
  inventoryItemId: z.string().min(1, 'Item is required'),
  inventoryVariationId: z.string().min(1, 'Variation is required'),
  locationId: z.string().min(1, 'Location is required'),
  changeAmount: z.string().refine((val) => !isNaN(Number(val)) && val !== '0', {
    message: 'Change amount must be non-zero number',
  }),
  reason: z.string().min(3, 'Reason is required'),
});

interface AddAdjustmentDialogProps {
  inventoryItems: InventoryItemWithRelations[];
  locations: StoreLocation[];
  adjustment?: AdjustmentsProps | null; // Optional for edit mode
  isEditMode?: boolean;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean; // New prop for external control
  onOpenChange?: (open: boolean) => void; // New prop for external control
}

type Variation = {
  id: string;
  sku: string;
  name: string;
  stockLevels: { id: number; locationId: number; stock: number }[];
};

export const AddAdjustmentDialog = ({
  inventoryItems,
  locations,
  adjustment,
  isEditMode = false,
  onSuccess,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: AddAdjustmentDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external or internal state for open
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [variations, setVariations] = useState<VariationWithStockLevels[]>([]);
  const [isLoading, setIsloading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const currentUser = session?.user;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inventoryItemId: '',
      inventoryVariationId: '',
      changeAmount: '',
      reason: '',
    },
  });

  // Set form values when adjustment is provided for editing
  useEffect(() => {
    if (adjustment && isEditMode) {
      form.setValue('inventoryItemId', adjustment.inventoryItem.id.toString());
      form.setValue(
        'inventoryVariationId',
        adjustment.inventoryVariation.id.toString(),
      );
      form.setValue('changeAmount', adjustment.changeAmount.toString());
      form.setValue('reason', adjustment.reason);
      setSelectedItemId(adjustment.inventoryItem.id.toString());
    }
  }, [adjustment, form, isEditMode]);

  // Update variations when selected item changes
  useEffect(() => {
    if (selectedItemId) {
      const item = inventoryItems.find((item) => item.id.toString() === selectedItemId);

      if (item && item.variations) {
        setVariations(item.variations);
      } else {
        setVariations([]);
      }
    } else {
      setVariations([]);
    }
  }, [selectedItemId, inventoryItems]);

  const handleItemChange = (value: string) => {
    setSelectedItemId(value);
    form.setValue('inventoryVariationId', '');
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsloading(true);
    if (!currentUser?.id) {
      toast({
        title: 'Authentication error',
        description: 'You need to be logged in to perform this action',
        variant: 'destructive',
      });
      setIsloading(false);

      return;
    }

    const adjustmentData = {
      inventoryItemId: values.inventoryItemId,
      inventoryVariationId: values.inventoryVariationId,
      locationId: parseInt(values.locationId),
      changeAmount: parseInt(values.changeAmount),
      stockBefore:
        variations
          .find((v) => v.id.toString() === values.inventoryVariationId)
          ?.stockLevels.find((sl) => sl.locationId === parseInt(values.locationId))?.stock || 0,
      reason: values.reason,
      adjustedById: currentUser.id,
    };

    let result;

    if (isEditMode && adjustment) {
      result = await updateInventoryAdjustment(adjustment.id, {
        inventoryItemId: values.inventoryItemId,
        inventoryVariationId: values.inventoryVariationId,
        changeAmount: parseInt(values.changeAmount),
        reason: values.reason,
      });
    } else {
      result = await createInventoryAdjustment(adjustmentData);
    }

    if (result.success) {
      toast({
        title: 'Success',
        description: isEditMode
          ? 'Inventory adjustment updated successfully'
          : 'Inventory adjustment created successfully',
      });
      setIsloading(false);
      form.reset();
      setOpen(false);
      router.refresh();
      if (onSuccess) { onSuccess(); }
    } else {
      toast({
        title: 'Error',
        description: isEditMode
          ? 'Failed to update inventory adjustment'
          : 'Failed to create inventory adjustment',
        variant: 'destructive',
      });
      setIsloading(false);
    }
  };

  const dialogTrigger = trigger || (
    <Button variant={isEditMode ? 'outline' : 'default'}>
      {isEditMode ? (
        <Edit className="h-4 w-4 mr-2" />
      ) : (
        <Plus className="h-4 w-4 mr-2" />
      )}
      {isEditMode ? 'Edit Adjustment' : 'Add Adjustment'}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Adjustment
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? 'Edit Inventory Adjustment'
              : 'Create Inventory Adjustment'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update an inventory adjustment record.'
              : 'Add a new inventory adjustment record.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="inventoryItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleItemChange(value);
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name}
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
              name="inventoryVariationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={!selectedItemId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select variation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {variations.map((variation) => (
                        <SelectItem
                          key={variation.id}
                          value={variation.id.toString()}
                        >
                          {variation.name || variation.sku}
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
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id.toString()}
                        >
                          {location.name}
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
              name="changeAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Change Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter change amount"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use positive values for additions and negative for removals.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Reason for adjustment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {isLoading && <CircleDashed className="animate-spin mr-2" />}
              {isEditMode ? 'Update Adjustment' : 'Create Adjustment'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
