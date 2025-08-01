import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getInventoryItems } from "@/components/dashboard/inventory/items/services/itemsCrud";
import { getItemStoreLocations } from "@/components/dashboard/inventory/location/services/itemLocationCrud";
import { updateReturnedItem } from "@/components/dashboard/inventory/returns/services/returnItemCrud";
import { StoreLocation, Vendor as Supplier } from "@prisma/client";
import { Loader2, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useToast } from "../../../ui/use-toast";
import { InventoryItemWithRelations } from "../items/types/ItemType";
import { ItemReturnExtended } from "@/types/type";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getSuppliers } from "@/components/dashboard/inventory/supplier/services/supplierCrud";
import { getCustomers } from "@/components/dashboard/customers/services/customerCrud";
import { Customer } from "@prisma/client";

type EditFormData = {
  reason: string;
  returnedAt: Date | string;
  request?: "refund" | "credit";
  // status: string;
  returningParty: "customer" | "shop";
  supplier?: string;
  quantity: string;
  amount: string;
  locationId: string;
  variationId: string;
  inventoryItemId: string;
  customerId?: string;
  comments: string[];
};

interface EditReturnFormContentProps {
  returnedItem: ItemReturnExtended;
  closeDialog: () => void;
}

function EditReturnFormContent({
  returnedItem,
  closeDialog,
}: EditReturnFormContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors: formErrors, isSubmitting },
    watch,
    reset,
  } = useForm<EditFormData>();

  const [isPending, startTransition] = useTransition();
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState<boolean>(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [inventoryItems, setInventoryItems] = useState<
    InventoryItemWithRelations[]
  >([]);
  const [inventoryLoading, setInventoryLoading] = useState<boolean>(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [variations, setVariations] = useState<any>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState<boolean>(true);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);
  const [itemPopoverOpen, setItemPopoverOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState<boolean>(true);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);

  // Watch form values for conditional rendering
  const selectedItemId = watch("inventoryItemId");
  const selectedVariationId = watch("variationId");
  const comments = watch("comments") || [];
  const returningParty = watch("returningParty");

  // Get today's date in YYYY-MM-DD format for the max attribute
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Create a flag to track if the component is still mounted
    let isMounted = true;

    const initializeForm = async () => {
      try {
        // Start loading resources in parallel
        const [
          itemsPromise,
          locationsPromise,
          suppliersPromise,
          customersPromise,
        ] = await Promise.allSettled([
          getInventoryItems(),
          getItemStoreLocations(),
          getSuppliers(),
          getCustomers(),
        ]);

        if (!isMounted) return;

        // Handle inventory items result
        if (itemsPromise.status === "fulfilled") {
          setInventoryItems(itemsPromise.value);
        } else {
          setInventoryError("Error fetching inventory items");
        }

        // Handle locations result
        if (locationsPromise.status === "fulfilled") {
          setLocations(locationsPromise.value);
        } else {
          setLocationsError("Error fetching locations");
        }

        // Handle suppliers result
        if (suppliersPromise.status === "fulfilled") {
          const fetchedSuppliers = suppliersPromise.value;
          setSuppliers(Array.isArray(fetchedSuppliers) ? fetchedSuppliers : []);
        } else {
          setSuppliersError("Error fetching suppliers");
        }

        // Handle customers result
        if (customersPromise.status === "fulfilled") {
          setCustomers(customersPromise.value);
        } else {
          setCustomersError("Error fetching customers");
        }

        // Initialize form with returnedItem data only after resources are loaded
        if (returnedItem) {
          // Set form values
          setValue("reason", returnedItem.reason);
          setValue(
            "returningParty",
            returnedItem.returningParty as "customer" | "shop"
          );
          setValue(
            "request",
            returnedItem?.request as "refund" | "credit" | undefined
          );
          setValue("locationId", String(returnedItem.locationId));
          setValue("variationId", String(returnedItem.inventoryVariationId));
          setValue("quantity", String(returnedItem.quantity));
          setValue("inventoryItemId", String(returnedItem.inventoryItemId));
          setValue("amount", String(returnedItem.amount || ""));
          // Format the date correctly for the input type='date'
          if (returnedItem.returnedAt) {
            const formattedDate = new Date(returnedItem.returnedAt)
              .toISOString()
              .split("T")[0];
            setValue("returnedAt", formattedDate);
          }

          // Set customerId if it exists and party is customer
          if (
            returnedItem.returningParty === "customer" &&
            returnedItem.customerId
          ) {
            setValue("customerId", returnedItem.customerId);
          }
          // Set supplier if it exists and party is shop
          if (returnedItem.returningParty === "shop" && returnedItem.supplier) {
            setValue("supplier", returnedItem.supplier);
          }

          if (returnedItem.Comment && returnedItem.Comment.length > 0) {
            setValue(
              "comments",
              returnedItem.Comment.map((comment: any) => comment.text)
            );
            setShowComments(true);
          }

          // Set selected item and variations
          if (itemsPromise.status === "fulfilled") {
            const itemData = itemsPromise.value.find(
              (item: InventoryItemWithRelations) =>
                item.id === returnedItem.inventoryItemId
            );

            if (itemData) {
              setSelectedItem(itemData);
              setVariations(itemData.variations);
            }
          }
        }
      } catch (error) {
        console.log(error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load data",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          // Set all loading states to false at once
          setInventoryLoading(false);
          setLocationsLoading(false);
          setSuppliersLoading(false);
          setCustomersLoading(false);
          setIsInitializing(false);
        }
      }
    };

    initializeForm();

    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isMounted = false;
    };
  }, [returnedItem, setValue, toast]);

  const handleItemChange = (itemId: string) => {
    const selectedItem = inventoryItems.find(
      (item: InventoryItemWithRelations) => item.id === itemId
    );
    setSelectedItem(selectedItem || null);
    if (selectedItem) {
      setVariations(selectedItem.variations);
    } else {
      setVariations([]);
    }
  };

  const onSubmit = async (data: EditFormData) => {
    // Add validation for customer/supplier based on party
    if (data.returningParty === "customer" && !data.customerId) {
      toast({
        title: "Missing Information",
        description: "Please select a customer.",
        variant: "destructive",
      });
      return;
    }
    if (data.returningParty === "shop" && !data.supplier) {
      toast({
        title: "Missing Information",
        description: "Please select a supplier.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const returnedAt = new Date(data.returnedAt); // Ensure date is handled correctly
        const quantityValue = parseInt(data.quantity, 10);
        const amountValue = parseFloat(data.amount);

        // Validate parsed numbers
        if (isNaN(quantityValue) || quantityValue <= 0) {
          toast({
            title: "Invalid Input",
            description: "Quantity must be a positive whole number.",
            variant: "destructive",
          });
          return;
        }
        if (isNaN(amountValue) || amountValue <= 0) {
          toast({
            title: "Invalid Input",
            description: "Amount must be a positive number.",
            variant: "destructive",
          });
          return;
        }

        const payload = {
          reason: data.reason,
          returnedAt: returnedAt,
          returningParty: data.returningParty,
          quantity: data.quantity,
          amount: amountValue,
          locationId: data.locationId,
          comments:
            data.comments?.filter((comment) => comment.trim() !== "") || [],
          variationId: data.variationId,
          inventoryItemId: data.inventoryItemId,
          // Conditional fields based on returning party
          ...(data.returningParty === "customer" && {
            customerId: data.customerId,
            request: data.request,
            supplier: data.supplier || undefined, // Explicitly nullify supplier if party is customer
          }),
          ...(data.returningParty === "shop" && {
            supplier: data.supplier,
            customerId: data.customerId || undefined, // Explicitly nullify customer if party is shop
            request: data.request, // Explicitly nullify request if party is shop
          }),
        };

        // console.log("Update Payload:", payload);

        const res = await updateReturnedItem(returnedItem.id, payload);

        if (res.status === "success") {
          toast({
            title: "Return Updated",
            description: "Return details updated successfully.",
          });
          router.refresh();
          closeDialog(); // Close the dialog on success
        } else {
          toast({
            title: "Update Failed",
            description: (res as any).message || "Failed to update return.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error updating return:", error);
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  // Render loading state if data is initializing
  if (isInitializing) {
    return (
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Return Item</DialogTitle>
          <DialogDescription>
            Update the details for this returned item.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading return item data...
            </p>
          </div>
        </div>
      </DialogContent>
    );
  }

  // Render the form once data is loaded
  return (
    <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Return Item</DialogTitle>
        <DialogDescription>
          Update the details for this returned item.
        </DialogDescription>
      </DialogHeader>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Item Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Item Selection Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="inventoryItemId"
                  className="text-sm font-medium"
                >
                  Inventory Item <span className="text-red-500">*</span>
                </Label>
                {inventoryLoading ? (
                  <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/20">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading items...</span>
                  </div>
                ) : inventoryError ? (
                  <div className="text-red-500 text-sm p-2 border border-red-200 rounded-md bg-red-50">
                    {inventoryError}
                  </div>
                ) : (
                  <Controller
                    control={control}
                    name="inventoryItemId"
                    rules={{ required: "Item selection is required" }}
                    render={({ field }) => (
                      <Popover
                        open={itemPopoverOpen}
                        onOpenChange={setItemPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={itemPopoverOpen}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground",
                              formErrors.inventoryItemId &&
                                "border-red-500 focus:ring-red-500"
                            )}
                          >
                            {field.value
                              ? inventoryItems.find(
                                  (item) => item.id === field.value
                                )?.name
                              : "Select item"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search item..." />
                            <CommandList>
                              <CommandEmpty>No item found.</CommandEmpty>
                              <CommandGroup>
                                {inventoryItems.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={item.name} // Use name for searching
                                    onSelect={() => {
                                      field.onChange(item.id);
                                      handleItemChange(item.id);
                                      setItemPopoverOpen(false);
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
                    )}
                  />
                )}
                {formErrors.inventoryItemId && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.inventoryItemId.message}
                  </p>
                )}
              </div>

              {selectedItemId && variations.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="variationId" className="text-sm font-medium">
                    Variation <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="variationId"
                    rules={{ required: "Variation selection is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full",
                            formErrors.variationId &&
                              "border-red-500 focus:ring-red-500"
                          )}
                        >
                          <SelectValue placeholder="Select a variation" />
                        </SelectTrigger>
                        <SelectContent>
                          {variations.map((variation: any) => (
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
                  {formErrors.variationId && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.variationId.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Location and Quantity Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locationId" className="text-sm font-medium">
                  Location <span className="text-red-500">*</span>
                </Label>
                {locationsLoading ? (
                  <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/20">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading locations...</span>
                  </div>
                ) : locationsError ? (
                  <div className="text-red-500 text-sm p-2 border border-red-200 rounded-md bg-red-50">
                    {locationsError}
                  </div>
                ) : (
                  <Controller
                    control={control}
                    name="locationId"
                    rules={{ required: "Location is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full",
                            formErrors.locationId &&
                              "border-red-500 focus:ring-red-500"
                          )}
                        >
                          <SelectValue placeholder="Select location" />
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
                )}
                {formErrors.locationId && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.locationId.message}
                  </p>
                )}
              </div>

              {/* Quantity field remains unchanged */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  className={cn(
                    formErrors.quantity && "border-red-500 focus:ring-red-500"
                  )}
                  {...register("quantity", {
                    required: "Quantity is required",
                    min: {
                      value: 1,
                      message: "Quantity must be at least 1",
                    },
                  })}
                />
                {formErrors.quantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.quantity.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Rest of the form remains unchanged */}
        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Return Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Return Information Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="returningParty" className="text-sm font-medium">
                  Returning Party <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="returningParty"
                  rules={{ required: "Returning party is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          formErrors.returningParty &&
                            "border-red-500 focus:ring-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select party" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="shop">Shop</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {formErrors.returningParty && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.returningParty.message}
                  </p>
                )}
              </div>

              {/* Customer Select (Conditional) */}
              {returningParty === "customer" && (
                <div className="space-y-2">
                  <Label htmlFor="customerId" className="text-sm font-medium">
                    Customer <span className="text-red-500">*</span>
                  </Label>
                  {customersLoading ? (
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/20">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading customers...</span>
                    </div>
                  ) : customersError ? (
                    <div className="text-red-500 text-sm p-2 border border-red-200 rounded-md bg-red-50">
                      {customersError}
                    </div>
                  ) : (
                    <Controller
                      control={control}
                      name="customerId"
                      rules={{
                        required:
                          returningParty === "customer"
                            ? "Customer is required when returning to customer"
                            : false,
                      }}
                      render={({ field }) => (
                        <Popover
                          open={customerPopoverOpen}
                          onOpenChange={setCustomerPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={customerPopoverOpen}
                              className={cn(
                                "w-full justify-between text-left h-10",
                                !field.value && "text-muted-foreground",
                                formErrors.customerId &&
                                  "border-red-500 focus:ring-red-500"
                              )}
                            >
                              <span className="truncate">
                                {field.value
                                  ? customers.find(
                                      (customer) => customer.id === field.value
                                    )?.firstName +
                                    " " +
                                    customers.find(
                                      (customer) => customer.id === field.value
                                    )?.lastName
                                  : "Select customer"}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Search customer by email or name..." />
                              <CommandList>
                                <CommandEmpty>No customer found.</CommandEmpty>
                                <CommandGroup>
                                  {customers.map((customer) => (
                                    <CommandItem
                                      key={customer.id}
                                      value={`${customer.firstName || ""} ${
                                        customer.lastName || ""
                                      } ${customer.email}`}
                                      onSelect={() => {
                                        field.onChange(customer.id);
                                        setCustomerPopoverOpen(false);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === customer.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                          {customer.firstName ||
                                          customer.lastName
                                            ? `${customer.firstName || ""} ${
                                                customer.lastName || ""
                                              }`.trim()
                                            : "No Name"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {customer.email}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  )}
                  {formErrors.customerId && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.customerId.message}
                    </p>
                  )}
                </div>
              )}

              {/* Supplier Select (Conditional) */}
              {returningParty === "shop" && (
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-sm font-medium">
                    Supplier <span className="text-red-500">*</span>
                  </Label>
                  {suppliersLoading ? (
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/20">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading suppliers...</span>
                    </div>
                  ) : suppliersError ? (
                    <div className="text-red-500 text-sm p-2 border border-red-200 rounded-md bg-red-50">
                      {suppliersError}
                    </div>
                  ) : (
                    <Controller
                      control={control}
                      name="supplier"
                      rules={{
                        required:
                          returningParty === "shop"
                            ? "Supplier is required when returning to shop"
                            : false,
                      }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-full",
                              formErrors.supplier &&
                                "border-red-500 focus:ring-red-500"
                            )}
                          >
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem
                                key={supplier.id}
                                value={supplier.name}
                              >
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                  {formErrors.supplier && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.supplier.message}
                    </p>
                  )}
                </div>
              )}

              {/* Status Select (remains here) */}
              {/* <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                
              </div> */}
            </div>

            {/* Column 2: Request Details & Reason */}
            <div className="space-y-4">
              {/* MOVED: Return Date */}
              <div className="space-y-2">
                <Label htmlFor="returnedAt" className="text-sm font-medium">
                  Return Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="returnedAt"
                  type="date"
                  max={today} // Assuming 'today' is defined as in Create form
                  className={cn(
                    formErrors.returnedAt && "border-red-500 focus:ring-red-500"
                  )}
                  {...register("returnedAt", {
                    required: "Return date is required",
                  })}
                />
                {formErrors.returnedAt && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.returnedAt.message}
                  </p>
                )}
              </div>

              {/* MOVED: Request Type (Conditional) */}
              {returningParty === "customer" && (
                <div className="space-y-2">
                  <Label htmlFor="request" className="text-sm font-medium">
                    Request Type <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="request"
                    rules={{
                      required:
                        returningParty === "customer"
                          ? "Request type is required"
                          : false,
                    }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "refund"}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full",
                            formErrors.request &&
                              "border-red-500 focus:ring-red-500"
                          )}
                        >
                          <SelectValue placeholder="Select request type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="refund">Refund</SelectItem>
                          <SelectItem value="credit">Store Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {formErrors.request && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.request.message}
                    </p>
                  )}
                </div>
              )}

              {/* ADDED: Amount Field */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Return Amount <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className={cn(
                      "pl-7", // Add padding for the $ sign
                      formErrors.amount && "border-red-500 focus:ring-red-500"
                    )}
                    {...register("amount", {
                      required: "Return amount is required",
                      validate: (value) => {
                        const num = parseFloat(value);
                        if (isNaN(num)) return "Please enter a valid number";
                        if (num <= 0) return "Amount must be positive";
                        return true;
                      },
                    })}
                  />
                </div>
                {formErrors.amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.amount.message}
                  </p>
                )}
              </div>

              {/* Reason Textarea (remains here) */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium">
                  Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Why is the item being returned?"
                  className={cn(
                    "min-h-[80px]",
                    formErrors.reason && "border-red-500 focus:ring-red-500"
                  )}
                  {...register("reason", {
                    required: "Reason is required",
                    minLength: {
                      value: 5,
                      message: "Please provide a more detailed reason",
                    },
                  })}
                />
                {formErrors.reason && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.reason.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <Card className="p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Additional Comments</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-sm"
            >
              {showComments ? "Hide Comments" : "Add Comments"}
            </Button>
          </div>

          {showComments && (
            <Controller
              control={control}
              name="comments"
              defaultValue={[]}
              render={({ field }) => (
                <div className="space-y-3">
                  {field.value && field.value.length > 0 ? (
                    field.value.map((comment, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Textarea
                          rows={2}
                          placeholder={`Enter comment ${index + 1}`}
                          value={comment}
                          className="flex-1"
                          onChange={(e) => {
                            const newComments = [...field.value];
                            newComments[index] = e.target.value;
                            field.onChange(newComments);
                          }}
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-100"
                                onClick={() => {
                                  const newComments = [...field.value];
                                  newComments.splice(index, 1);
                                  field.onChange(newComments);
                                }}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove comment</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No comments added. Click below to add a comment.
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => field.onChange([...(field.value || []), ""])}
                    className="mt-2 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Comment
                  </Button>
                </div>
              )}
            />
          )}
        </Card>

        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending || isSubmitting}
            className="min-w-[100px]"
          >
            {isPending || isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isPending || isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// New default export Dialog component
export default function EditReturnItemDialog({
  returnedItem,
  trigger,
}: {
  returnedItem: ItemReturnExtended;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Use provided trigger or default button */}
        {trigger || <Button variant="outline">Edit</Button>}
      </DialogTrigger>
      {/* Render form content only when open to fetch data */}
      {open && (
        <EditReturnFormContent
          returnedItem={returnedItem}
          closeDialog={() => setOpen(false)}
        />
      )}
    </Dialog>
  );
}
