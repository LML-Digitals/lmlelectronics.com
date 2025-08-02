'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getInventoryItems } from '@/components/dashboard/inventory/items/services/itemsCrud';
import { getItemStoreLocations } from '@/components/dashboard/inventory/location/services/itemLocationCrud';
import {
  ExtendedInventoryTransfer,
  getInventoryTransferById,
  updateInventoryTransfer,
} from '@/components/dashboard/inventory/transfers/services/internalTransfersCrud';
import { CircleDashedIcon, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { InventoryItemWithRelations } from '../items/types/ItemType';
import { StoreLocation } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';

// Define a type for stock levels with location
type StockWithLocation = {
  id: string;
  stock: number;
  locationId: number;
  location: StoreLocation;
};

type EditInputs = {
  inventoryItemId: string;
  InventoryVariationId: string;
  quantity: string;
  fromLocationId: string;
  toLocationId: string;
};

type TransferItem = {
  id: number;
  status: string;
  quantity: number;
  inventoryItemId: number;
  InventoryVariationId: number;
  fromLocationId: number;
  toLocationId: number;
  transferDate: string;
  inventoryItem: { name: string };
};

interface EditTransferItemDialogProps {
  transfer: ExtendedInventoryTransfer;
}

export function EditTransferItemDialog({
  transfer,
}: EditTransferItemDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    getValues,
    reset,
    formState: { errors: formErrors },
  } = useForm<EditInputs>();

  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<
    InventoryItemWithRelations[]
  >([]);
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] =
    useState<InventoryItemWithRelations | null>(null);
  const [variations, setVariations] = useState<any[]>([]);
  const [fromVariationLocations, setFromVariationLocations] = useState<
    StockWithLocation[]
  >([]);

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  // Fetch transfer, inventory items and locations
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch transfer details, inventory items and locations concurrently
      const [items, locs] = await Promise.all([
        getInventoryItems(),
        getItemStoreLocations(),
      ]);
      setInventoryItems(items);
      setLocations(locs);

      // Find the selected item
      const item = items.find(
        (item: InventoryItemWithRelations) =>
          transfer && item.id === transfer.inventoryItemId
      );
      setSelectedItem(item || null);

      // Set form values
      if (transfer) {
        setValue('inventoryItemId', String(transfer.inventoryItemId));
        setValue('InventoryVariationId', String(transfer.inventoryVariationId));
        setValue('quantity', String(transfer.quantity));
        setValue('fromLocationId', String(transfer.fromLocationId));
        setValue('toLocationId', String(transfer.toLocationId));
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load transfer data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selected item change
  useEffect(() => {
    if (selectedItem) {
      setVariations(selectedItem.variations || []);
    } else {
      setVariations([]);
    }
  }, [selectedItem]);

  // Handle selected variation change
  useEffect(() => {
    if (variations.length > 0) {
      const selectedVariation = variations.find(
        (vr) => vr.id === Number(getValues('InventoryVariationId'))
      );

      if (selectedVariation) {
        setFromVariationLocations(
          selectedVariation.stockLevels.map((sl: any) => ({
            id: sl.id,
            stock: sl.stock,
            locationId: sl.locationId,
            location: sl.location,
          }))
        );
      } else {
        setFromVariationLocations([]);
      }
    }
  }, [variations, getValues]);

  const handleItemChange = (itemId: string) => {
    const item = inventoryItems.find((item) => item.id === itemId);
    setSelectedItem(item || null);
  };

  const handleVariationChange = (variationId: string) => {
    const variation = variations.find((vr) => vr.id === variationId);

    if (variation) {
      setFromVariationLocations(
        variation.stockLevels.map((sl: any) => ({
          id: sl.id,
          stock: sl.stock,
          locationId: sl.locationId,
          location: sl.location,
        }))
      );
    } else {
      setFromVariationLocations([]);
    }
  };

  const onSubmit: SubmitHandler<EditInputs> = (data) => {
    if (data.fromLocationId === data.toLocationId) {
      setError('toLocationId', {
        type: 'manual',
        message: "You can't transfer this variation to the same location.",
      });
      return;
    }

    // In edit mode, we need to check if the from location has changed
    // If it has changed, we need to validate stock amount
    if (transfer && String(transfer.fromLocationId) !== data.fromLocationId) {
      const locationStockLevel = fromVariationLocations.find(
        (sl) => sl.locationId === Number(data.fromLocationId)
      );

      if (!locationStockLevel) {
        setError('fromLocationId', {
          type: 'manual',
          message: 'This variation is not available in the selected location',
        });
        return;
      }

      const inValidVariationQuantity =
        locationStockLevel.stock < Number(data.quantity);

      if (inValidVariationQuantity) {
        setError('quantity', {
          type: 'manual',
          message: `Insufficient quantity, try less you have (${locationStockLevel.stock}) in the from location selected`,
        });
        return;
      }
    }

    startTransition(async () => {
      try {
        const res = await updateInventoryTransfer(transfer.id, {
          ...data,
          inventoryItemId: data.inventoryItemId,
          InventoryVariationId: data.InventoryVariationId,
          quantity: Number(data.quantity),
          fromLocationId: Number(data.fromLocationId),
          toLocationId: Number(data.toLocationId),
        });
        if (res.status === 'success') {
          toast({
            title: 'Success',
            description: 'Transfer has been updated successfully',
          });
          router.refresh();
          setOpen(false);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update transfer',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="text-blue-500" size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Transfer</DialogTitle>
        </DialogHeader>

        {isLoading || isPending ? (
          <div className="flex items-center justify-center p-6">
            <CircleDashedIcon className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Item Selection */}
              <div className="grid gap-2">
                <Label
                  htmlFor="inventoryItemId"
                  className="text-sm font-medium"
                >
                  Item
                </Label>
                <Controller
                  control={control}
                  name="inventoryItemId"
                  rules={{ required: 'Item is required' }}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleItemChange(value);
                      }}
                      value={field.value}
                      disabled={transfer?.status === 'Completed'}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {formErrors.inventoryItemId && (
                  <p className="text-sm text-destructive">
                    {formErrors.inventoryItemId.message}
                  </p>
                )}
              </div>

              {/* Variation Selection */}
              {variations.length > 0 && (
                <div className="grid gap-2">
                  <Label
                    htmlFor="InventoryVariationId"
                    className="text-sm font-medium"
                  >
                    Variation
                  </Label>
                  <Controller
                    control={control}
                    name="InventoryVariationId"
                    rules={{ required: 'Variation is required' }}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleVariationChange(value);
                        }}
                        value={field.value}
                        disabled={transfer?.status === 'Completed'}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a variation" />
                        </SelectTrigger>
                        <SelectContent>
                          {variations.map((variation) => (
                            <SelectItem
                              key={variation.id}
                              value={String(variation.id)}
                            >
                              {variation.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {formErrors.InventoryVariationId && (
                    <p className="text-sm text-destructive">
                      {formErrors.InventoryVariationId.message}
                    </p>
                  )}
                </div>
              )}

              {/* From Location Selection */}
              <div className="grid gap-2">
                <Label htmlFor="fromLocationId" className="text-sm font-medium">
                  From Location
                </Label>
                <Controller
                  control={control}
                  name="fromLocationId"
                  rules={{ required: 'From location is required' }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={transfer?.status === 'Completed'}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        {fromVariationLocations.length > 0
                          ? fromVariationLocations.map((stockLocation) => (
                              <SelectItem
                                key={stockLocation.location.id}
                                value={String(stockLocation.locationId)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{stockLocation.location.name}</span>
                                  <span className="ml-2 px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs">
                                    Stock: {stockLocation.stock}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          : locations.map((location) => (
                              <SelectItem
                                key={location.id}
                                value={String(location.id)}
                              >
                                {location.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {formErrors.fromLocationId && (
                  <p className="text-sm text-destructive">
                    {formErrors.fromLocationId.message}
                  </p>
                )}
              </div>

              {/* To Location Selection */}
              <div className="grid gap-2">
                <Label htmlFor="toLocationId" className="text-sm font-medium">
                  To Location
                </Label>
                <Controller
                  control={control}
                  name="toLocationId"
                  rules={{ required: 'To location is required' }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem
                            key={location.id}
                            value={String(location.id)}
                          >
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {formErrors.toLocationId && (
                  <p className="text-sm text-destructive">
                    {formErrors.toLocationId.message}
                  </p>
                )}
              </div>

              {/* Quantity Input */}
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  disabled={transfer?.status === 'Completed'}
                  {...register('quantity', {
                    required: 'This field is required',
                    min: {
                      value: 1,
                      message: 'Quantity cannot be less than 1',
                    },
                  })}
                />
                {formErrors.quantity && (
                  <p className="text-sm text-destructive">
                    {formErrors.quantity.message}
                  </p>
                )}
              </div>

              {/* Status Selection */}
              {/* <div className="grid gap-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Controller
                  control={control}
                  name="status"
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Transit">In Transit</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {formErrors.status && (
                  <p className="text-sm text-destructive">
                    {formErrors.status.message}
                  </p>
                )}
              </div> */}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <CircleDashedIcon className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Transfer'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
