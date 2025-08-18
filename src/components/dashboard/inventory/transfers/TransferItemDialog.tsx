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
import { createInventoryTransfer } from '@/components/dashboard/inventory/transfers/services/internalTransfersCrud';
import { CircleDashedIcon, Plus } from 'lucide-react';
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

// Define a type for stock levels with location
type StockWithLocation = {
  id: number;
  stock: number;
  locationId: number;
  location: StoreLocation;
};

type CreateInputs = {
  inventoryItemId: string;
  InventoryVariationId: string;
  quantity: string;
  fromLocationId: string;
  toLocationId: string;
};

export default function TransferItemDialog () {
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
  } = useForm<CreateInputs>();

  const [isPending, startTransition] = useTransition();
  const [inventoryItems, setInventoryItems] = useState<
    InventoryItemWithRelations[]
  >([]);
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem]
    = useState<InventoryItemWithRelations | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState<boolean>(false);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [variations, setVariations] = useState<any[]>([]);
  const [fromVariationLocations, setFromVariationLocations] = useState<
    StockWithLocation[]
  >([]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    if (inventoryItems.length > 0 && locations.length > 0) { return; }

    try {
      setInventoryLoading(true);
      setLocationLoading(true);
      const [items, locs] = await Promise.all([
        getInventoryItems(),
        getItemStoreLocations(),
      ]);

      setInventoryItems(items);
      setLocations(locs);
    } catch (error) {
      setInventoryError('Error fetching inventory data');
      setLocationError('Error fetching locations');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load required data',
      });
    } finally {
      setInventoryLoading(false);
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    if (selectedItem) {
      setVariations(selectedItem.variations || []);
    } else {
      setVariations([]);
    }
  }, [selectedItem]);

  useEffect(() => {
    if (variations.length > 0) {
      const selectedVariation = variations.find((vr) => vr.id === Number(getValues('InventoryVariationId')));

      if (selectedVariation) {
        setFromVariationLocations(selectedVariation.stockLevels.map((sl: any) => ({
          id: sl.id,
          stock: sl.stock,
          locationId: sl.locationId,
          location: sl.location,
        })));
      } else {
        setFromVariationLocations([]);
      }
    }
  }, [variations, getValues]);

  const handleItemChange = (itemId: string) => {
    const selectedItem = inventoryItems.find((item) => item.id === itemId);

    setSelectedItem(selectedItem || null);
  };

  const handleVariationChange = (variationId: string) => {
    const selectedVariation = variations.find((vr) => vr.id === variationId);

    if (selectedVariation) {
      setFromVariationLocations(selectedVariation.stockLevels.map((sl: any) => ({
        id: sl.id,
        stock: sl.stock,
        locationId: sl.locationId,
        location: sl.location,
      })));
    } else {
      setFromVariationLocations([]);
    }
  };

  const onSubmit: SubmitHandler<CreateInputs> = (data) => {
    if (data.fromLocationId === data.toLocationId) {
      setError('toLocationId', {
        type: 'manual',
        message: "You can't transfer this variation to the same location.",
      });

      return;
    }

    const locationStockLevel = fromVariationLocations.find((sl) => sl.locationId === Number(data.fromLocationId));

    if (!locationStockLevel) {
      setError('fromLocationId', {
        type: 'manual',
        message: 'This variation is not available in the selected location',
      });

      return;
    }

    const inValidVariationQuantity
      = locationStockLevel.stock < Number(data.quantity);

    if (inValidVariationQuantity) {
      setError('quantity', {
        type: 'manual',
        message: `Insufficient quantity, try less you have (${locationStockLevel.stock}) in the from location selected`,
      });

      return;
    }

    startTransition(async () => {
      try {
        const res = await createInventoryTransfer(data);

        if (res.status === 'success') {
          toast({
            title: 'Success',
            description: 'Transfer has been created successfully',
          });
          router.refresh();
          setOpen(false);
          reset();
          setSelectedItem(null);
          setVariations([]);
          setFromVariationLocations([]);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create transfer',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Transfer</DialogTitle>
        </DialogHeader>

        {isPending ? (
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
                {inventoryLoading ? (
                  <div className="flex items-center space-x-2">
                    <CircleDashedIcon className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Loading items...
                    </span>
                  </div>
                ) : (
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
                )}
                {formErrors.inventoryItemId && (
                  <p className="text-sm text-destructive">
                    {formErrors.inventoryItemId.message}
                  </p>
                )}
              </div>

              {/* Variation Selection */}
              {selectedItem && variations.length > 0 && (
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
              {fromVariationLocations.length > 0 && (
                <div className="grid gap-2">
                  <Label
                    htmlFor="fromLocationId"
                    className="text-sm font-medium"
                  >
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
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                          {fromVariationLocations.map((stockLocation) => (
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
              )}

              {/* To Location Selection */}
              {locations.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="toLocationId" className="text-sm font-medium">
                    To Location
                  </Label>
                  <Controller
                    control={control}
                    name="toLocationId"
                    rules={{ required: 'To location is required' }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
              )}

              {/* Quantity Input */}
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
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
                    Creating...
                  </>
                ) : (
                  'Create Transfer'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
