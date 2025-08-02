"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Loader2,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { createExchange } from "./services/exchangeCrud";
import { CreateExchangeInput } from "./services/types";
import { Customer, Staff, InventoryItem, StoreLocation } from "@prisma/client";
import { useState as useHookState } from "react";
import { InventoryVariationData } from "./services/types";
import { InventoryItemWithRelations } from "../items/types/ItemType";
import { getItemStoreLocations } from "@/components/dashboard/inventory/location/services/itemLocationCrud";
import { getVariationsStockForLocation } from "@/components/dashboard/inventory/items/services/itemsCrud";

// Define the form schema
const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  locationId: z.number().min(1, "Location is required"),
  returnedItemId: z.string(),
  newItemId: z.string(),
  returnedVariationId: z.string(),
  newVariationId: z.string(),
  reason: z.string().min(3, "Reason is required"),
  processedBy: z.string().min(1, "Staff member is required"),
  exchangedAt: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddExchangeFormProps {
  customers: Customer[];
  staff: Staff[];
  inventoryItems: InventoryItemWithRelations[];
  isLoading: boolean;
}

export default function AddExchangeForm({
  customers,
  staff,
  inventoryItems,
  isLoading,
}: AddExchangeFormProps) {
  const [open, setOpen] = useState(false);
  const [returnedItemPopoverOpen, setReturnedItemPopoverOpen] = useState(false);
  const [newItemPopoverOpen, setNewItemPopoverOpen] = useState(false);
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [isFetchingLocations, setIsFetchingLocations] = useState(true);
  const [selectedReturnedItemId, setSelectedReturnedItemId] = useHookState<
    string | null
  >(null);
  const [selectedNewItemId, setSelectedNewItemId] = useHookState<string | null>(
    null
  );
  const [returnedItemVariations, setReturnedItemVariations] = useHookState<
    InventoryVariationData[]
  >([]);
  const [newItemVariations, setNewItemVariations] = useHookState<
    InventoryVariationData[]
  >([]);
  const [stockLevels, setStockLevels] = useState<Record<string, number>>({});
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      returnedItemId: "",
      newItemId: "",
      reason: "",
      processedBy: "",
      locationId: 0,
      exchangedAt: undefined,
    },
  });

  useEffect(() => {
    const fetchLocations = async () => {
      setIsFetchingLocations(true);
      try {
        const fetchedLocations = await getItemStoreLocations();
        setLocations(fetchedLocations);
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast({
          variant: "destructive",
          title: "Error fetching locations",
          description: (error as Error).message || "Could not fetch locations.",
        });
      } finally {
        setIsFetchingLocations(false);
      }
    };
    fetchLocations();
  }, [toast]);

  // Add function to check stock availability
  const checkStockAvailability = useCallback(
    async (variationId: string, locationId: number) => {
      if (!variationId || !locationId) return false;

      setIsCheckingStock(true);
      try {
        const stockData = await getVariationsStockForLocation(
          [variationId],
          locationId
        );
        setStockLevels(stockData);

        // Check if the stock is available
        const available = stockData[variationId] > 0;
        if (!available) {
          const selectedVariation = newItemVariations.find(
            (v) => v.id === variationId
          );
          const variationName = selectedVariation
            ? selectedVariation.name || selectedVariation.sku
            : "Selected item";
          const locationName =
            locations.find((l) => l.id === locationId)?.name ||
            "selected location";

          setStockError(
            `${variationName} is out of stock at ${locationName}. Current stock: ${stockData[variationId]} units.`
          );
        }
        return available;
      } catch (error) {
        console.error("Error checking stock:", error);
        setStockError("Could not verify stock availability.");
        return false;
      } finally {
        setIsCheckingStock(false);
      }
    },
    [newItemVariations, locations]
  );

  useEffect(() => {
    // Clear stock error when location, new item, or new variation changes
    setStockError(null);
  }, [
    form.watch("locationId"),
    form.watch("newItemId"),
    form.watch("newVariationId"),
    form,
  ]);

  // Add effect to check stock when both variation and location are selected
  useEffect(() => {
    const newVariationId = form.watch("newVariationId");
    const locationId = form.watch("locationId");

    if (newVariationId && locationId) {
      checkStockAvailability(newVariationId, locationId);
    }
  }, [
    form.watch("newVariationId"),
    form.watch("locationId"),
    form,
    checkStockAvailability,
  ]);

  const getVariationsForItem = (itemId: string) => {
    const selectedItem = inventoryItems.find((item) => item.id === itemId);
    if (selectedItem && selectedItem.variations) {
      return selectedItem.variations.map((variation) => ({
        id: variation.id,
        sku: variation.sku,
        name: variation.name,
        image: variation.image,
      }));
    }
    return [];
  };

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        // Check stock availability before processing
        const hasStock = await checkStockAvailability(
          values.newVariationId,
          values.locationId
        );

        if (!hasStock) {
          throw new Error("Selected item is out of stock at this location");
        }

        const exchangeData: CreateExchangeInput = {
          customerId: values.customerId,
          returnedItemId: values.returnedItemId,
          newItemId: values.newItemId,
          returnedVariationId: values.returnedVariationId,
          newVariationId: values.newVariationId,
          reason: values.reason,
          processedBy: values.processedBy,
          locationId: values.locationId,
          exchangedAt: values.exchangedAt,
        };

        const response = await createExchange(exchangeData);

        if (!response.success) {
          throw new Error(response.error || "Failed to create exchange");
        }

        toast({
          title: "Exchange created",
          description: "The exchange has been successfully created",
        });

        form.reset();
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error creating exchange",
          description:
            (error as Error).message || "An unexpected error occurred",
        });
      }
    });
  }

  // Helper to determine when we should show stock information
  const shouldDisplayStockMessage = () => {
    const newVariationId = form.watch("newVariationId");
    const locationId = form.watch("locationId");
    return (
      newVariationId && locationId && stockLevels[newVariationId] !== undefined
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Add Exchange
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Exchange</DialogTitle>
          <DialogDescription>
            Record a customer exchange request for inventory items
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Customer</FormLabel>
                  <Popover
                    open={customerPopoverOpen}
                    onOpenChange={setCustomerPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={customerPopoverOpen}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={
                            isPending || isLoading || isFetchingLocations
                          }
                        >
                          {field.value
                            ? `${
                                customers.find(
                                  (customer) => customer.id === field.value
                                )?.firstName
                              } ${
                                customers.find(
                                  (customer) => customer.id === field.value
                                )?.lastName
                              }`
                            : "Select a customer"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                      <Command>
                        <CommandInput placeholder="Search customer..." />
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup>
                            {customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={`${customer.firstName} ${customer.lastName}`.toLowerCase()}
                                onSelect={() => {
                                  form.setValue("customerId", customer.id);
                                  setCustomerPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === customer.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {customer.firstName} {customer.lastName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Location</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={String(field.value || "")}
                    disabled={isPending || isLoading || isFetchingLocations}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="returnedItemId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Returned Item</FormLabel>
                      <Popover
                        open={returnedItemPopoverOpen}
                        onOpenChange={setReturnedItemPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={returnedItemPopoverOpen}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={
                                isPending || isLoading || isFetchingLocations
                              }
                            >
                              {field.value
                                ? inventoryItems.find(
                                    (item) => item.id === field.value
                                  )?.name
                                : "Select returned item"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                          <Command>
                            <CommandInput placeholder="Search item..." />
                            <CommandList>
                              <CommandEmpty>No item found.</CommandEmpty>
                              <CommandGroup>
                                {inventoryItems.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={item.name}
                                    onSelect={() => {
                                      form.setValue("returnedItemId", item.id);
                                      const itemId = item.id;
                                      setSelectedReturnedItemId(itemId);
                                      const variations =
                                        getVariationsForItem(itemId);
                                      setReturnedItemVariations(variations);
                                      form.setValue("returnedVariationId", "");
                                      setReturnedItemPopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === item.id
                                          ? "opacity-100"
                                          : "opacity-0"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {returnedItemVariations.length > 0 && (
                  <FormField
                    control={form.control}
                    name="returnedVariationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Returned Variation</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                          disabled={
                            isPending || isLoading || isFetchingLocations
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select variation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {returnedItemVariations.map((variation) => (
                              <SelectItem
                                key={variation.id}
                                value={String(variation.id)}
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
                )}
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="newItemId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>New Item</FormLabel>
                      <Popover
                        open={newItemPopoverOpen}
                        onOpenChange={setNewItemPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={newItemPopoverOpen}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={
                                isPending || isLoading || isFetchingLocations
                              }
                            >
                              {field.value
                                ? inventoryItems.find(
                                    (item) => item.id === field.value
                                  )?.name
                                : "Select new item"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                          <Command>
                            <CommandInput placeholder="Search item..." />
                            <CommandList>
                              <CommandEmpty>No item found.</CommandEmpty>
                              <CommandGroup>
                                {inventoryItems.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={item.name}
                                    onSelect={() => {
                                      form.setValue("newItemId", item.id);
                                      const itemId = item.id;
                                      setSelectedNewItemId(itemId);
                                      const variations =
                                        getVariationsForItem(itemId);
                                      setNewItemVariations(variations);
                                      form.setValue("newVariationId", "");
                                      setNewItemPopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === item.id
                                          ? "opacity-100"
                                          : "opacity-0"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {newItemVariations.length > 0 && (
                  <FormField
                    control={form.control}
                    name="newVariationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Variation</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                          disabled={
                            isPending || isLoading || isFetchingLocations
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select variation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {newItemVariations.map((variation) => (
                              <SelectItem
                                key={variation.id}
                                value={String(variation.id)}
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
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exchange Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the reason for the exchange..."
                      disabled={isPending || isLoading || isFetchingLocations}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exchangedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exchange Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={
                              isPending || isLoading || isFetchingLocations
                            }
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs">
                      Leave blank to use current date/time
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="processedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Processed By</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending || isLoading || isFetchingLocations}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {`${member.firstName} ${member.lastName}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {shouldDisplayStockMessage() && !stockError && (
              <div
                className={`rounded-md ${
                  stockLevels[form.watch("newVariationId")] > 0
                    ? "bg-green-50"
                    : "bg-amber-50"
                } p-3 flex items-center gap-2 ${
                  stockLevels[form.watch("newVariationId")] > 0
                    ? "text-green-700"
                    : "text-amber-700"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">
                  {stockLevels[form.watch("newVariationId")] > 0
                    ? `Item is in stock: ${
                        stockLevels[form.watch("newVariationId")]
                      } units available.`
                    : "This item is currently out of stock."}
                </p>
              </div>
            )}

            {stockError && (
              <div className="rounded-md bg-destructive/15 p-3 flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{stockError}</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending || isCheckingStock}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  isLoading ||
                  isFetchingLocations ||
                  isCheckingStock ||
                  !!stockError
                }
              >
                {isPending || isCheckingStock
                  ? "Processing..."
                  : "Create Exchange"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
