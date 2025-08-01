"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Edit,
  Loader2,
  CalendarIcon,
  Check,
  ChevronsUpDown,
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

import { updateExchange } from "./services/exchangeCrud";
import { UpdateExchangeInput, ExchangeWithRelations } from "./services/types";
import { Customer, Staff, InventoryItem, StoreLocation } from "@prisma/client";
import { useState as useHookState } from "react";
import { InventoryVariationData } from "./services/types";
import { InventoryItemWithRelations } from "../items/types/ItemType";
import { getItemStoreLocations } from "@/components/dashboard/inventory/location/services/itemLocationCrud";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the form schema similar to AddExchangeForm but adapting as needed
const formSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, "Customer is required"),
  locationId: z.number().min(1, "Location is required"),
  returnedItemId: z.string(),
  newItemId: z.string(),
  returnedVariationId: z.string(),
  newVariationId: z.string(),
  reason: z.string().min(3, "Reason is required"),
  processedBy: z.string().min(1, "Staff member is required"),
  status: z.string(),
  exchangedAt: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditExchangeDialogProps {
  exchange: ExchangeWithRelations;
  customers: Customer[];
  staff: Staff[];
  inventoryItems: InventoryItemWithRelations[];
  isLoading: boolean;
}

export default function EditExchangeDialog({
  exchange,
  customers,
  staff,
  inventoryItems,
  isLoading,
}: EditExchangeDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [isFetchingLocations, setIsFetchingLocations] = useState(true);
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  const [returnedItemPopoverOpen, setReturnedItemPopoverOpen] = useState(false);
  const [newItemPopoverOpen, setNewItemPopoverOpen] = useState(false);
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [selectedReturnedItemId, setSelectedReturnedItemId] = useHookState<
    string | null
  >(exchange.returnedItemId);
  const [selectedNewItemId, setSelectedNewItemId] = useHookState<string | null>(
    exchange.newItemId
  );
  const [returnedItemVariations, setReturnedItemVariations] = useHookState<
    InventoryVariationData[]
  >([]);
  const [newItemVariations, setNewItemVariations] = useHookState<
    InventoryVariationData[]
  >([]);

  // Initialize form with exchange data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: exchange.id,
      customerId: exchange.customerId,
      locationId: exchange.locationId,
      returnedItemId: exchange.returnedItemId,
      newItemId: exchange.newItemId,
      returnedVariationId: exchange.returnedVariationId,
      newVariationId: exchange.newVariationId,
      reason: exchange.reason,
      processedBy: exchange.processedBy,
      status: exchange.status,
      exchangedAt: new Date(exchange.exchangedAt),
    },
  });

  // Fetch locations and load variations when dialog opens or exchange changes
  useEffect(() => {
    if (open) {
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
            description:
              (error as Error).message || "Could not fetch locations.",
          });
        } finally {
          setIsFetchingLocations(false);
        }
      };

      fetchLocations();

      // Load variations based on current form values or initial exchange data
      const initialReturnedItemId =
        form.getValues("returnedItemId") || exchange.returnedItemId;
      const initialNewItemId =
        form.getValues("newItemId") || exchange.newItemId;

      if (initialReturnedItemId) {
        const returnedVariations = getVariationsForItem(initialReturnedItemId);
        setReturnedItemVariations(returnedVariations);
      }
      if (initialNewItemId) {
        const newVariations = getVariationsForItem(initialNewItemId);
        setNewItemVariations(newVariations);
      }
    }
  }, [open, exchange.returnedItemId, exchange.newItemId, toast, form]);

  // Get variations from inventory items directly
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
        const updateData: UpdateExchangeInput = {
          id: values.id,
          customerId: values.customerId,
          locationId: values.locationId,
          returnedItemId: values.returnedItemId,
          newItemId: values.newItemId,
          returnedVariationId: values.returnedVariationId,
          newVariationId: values.newVariationId,
          reason: values.reason,
          processedBy: values.processedBy,
          status: values.status as any,
        };

        // If exchangedAt wasn't changed or is invalid, don't include it in the update
        if (
          !values.exchangedAt ||
          isNaN(new Date(values.exchangedAt).getTime())
        ) {
          delete updateData.exchangedAt;
        } else {
          updateData.exchangedAt = new Date(values.exchangedAt);
        }

        const response = await updateExchange(updateData);

        if (!response.success) {
          throw new Error(response.error || "Failed to update exchange");
        }

        toast({
          title: "Exchange updated",
          description: "The exchange has been successfully updated",
        });

        setOpen(false);
        router.refresh();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error updating exchange",
          description:
            (error as Error).message || "An unexpected error occurred",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isLoading || isPending}
              >
                <Edit size={18} className="text-blue-600" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Edit exchange</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[600px] h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Exchange</DialogTitle>
          <DialogDescription>
            Update the details of this exchange record
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            {/* Customer Selection */}
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

            {/* Location Selection */}
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Store Location</FormLabel>
                  <Popover
                    open={locationPopoverOpen}
                    onOpenChange={setLocationPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={locationPopoverOpen}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={
                            isPending || isLoading || isFetchingLocations
                          }
                        >
                          {field.value
                            ? locations.find((loc) => loc.id === field.value)
                                ?.name
                            : "Select a location"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                      <Command>
                        <CommandInput placeholder="Search location..." />
                        <CommandList>
                          <CommandEmpty>No location found.</CommandEmpty>
                          <CommandGroup>
                            {locations.map((location) => (
                              <CommandItem
                                key={location.id}
                                value={location.name}
                                onSelect={() => {
                                  form.setValue("locationId", location.id);
                                  setLocationPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === location.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {location.name}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Returned Item */}
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

                {/* Returned Item Variation - if available */}
                {returnedItemVariations.length > 0 && (
                  <FormField
                    control={form.control}
                    name="returnedVariationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Returned Variation</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                          disabled={isPending || isLoading}
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

              {/* New Item */}
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

                {/* New Item Variation - if available */}
                {newItemVariations.length > 0 && (
                  <FormField
                    control={form.control}
                    name="newVariationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Variation</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString()}
                          disabled={isPending || isLoading}
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

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exchange Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the reason for the exchange..."
                      disabled={isPending || isLoading}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Selection */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date field */}
              <FormField
                control={form.control}
                name="exchangedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exchange Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isPending || isLoading}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Processed By */}
              <FormField
                control={form.control}
                name="processedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Processed By</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending || isLoading}
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || isLoading || isFetchingLocations}
              >
                {isPending ? "Updating..." : "Update Exchange"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
