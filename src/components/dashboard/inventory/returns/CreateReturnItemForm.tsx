"use client";

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
import { useToast } from "@/components/ui/use-toast";
import { getInventoryItems } from "@/components/dashboard/inventory/items/services/itemsCrud";
import { getItemStoreLocations } from "@/components/dashboard/inventory/location/services/itemLocationCrud";
import { createReturnedItem } from "@/components/dashboard/inventory/returns/services/returnItemCrud";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { InventoryItemWithRelations } from "../items/types/ItemType";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  InventoryItem,
  InventoryVariation,
  StoreLocation,
  Vendor as Supplier,
} from "@prisma/client";
import { Loader2, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { getSuppliers } from "@/components/dashboard/inventory/supplier/services/supplierCrud";
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
import { getCustomers } from "@/components/dashboard/customers/services/customerCrud";
import { Customer } from "@prisma/client";

type Variation = {
  variationId: number;
  name: string;
  quantity: number;
  image: string;
  sku: string;
};

type FormData = {
  reason: string;
  returningParty: "customer" | "shop";
  returnedAt: Date;
  variationId: string;
  request?: "refund" | "credit";
  result?: "success" | "rejected";
  itemId: string;
  locationId: string;
  quantity: string;
  amount: string;
  comments: string[];
  supplier?: string;
  customerId?: string;
};

type InventoryWithVariations = InventoryItem & {
  variations: InventoryVariation[];
};

function ReturnFormContent({ closeDialog }: { closeDialog: () => void }) {
  const { toast } = useToast();
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting },
    watch,
    setValue,
  } = useForm<FormData>({ defaultValues: { request: "refund", comments: [] } });
  const [isPending, startTransition] = useTransition();
  const [inventoryItems, setInventoryItems] = useState<
    InventoryItemWithRelations[]
  >([]);
  const [locations, setLocations] = useState<StoreLocation[] | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [variations, setVariations] = useState<InventoryVariation[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState<boolean>(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [locationsLoading, setLocationsLoading] = useState<boolean>(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState<boolean>(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [itemPopoverOpen, setItemPopoverOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState<boolean>(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);

  const selectedItemId = watch("itemId");
  const selectedVariationId = watch("variationId");
  const comments = watch("comments") || [];
  const returningParty = watch("returningParty");
  const selectedCustomerId = watch("customerId");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchInventoryItems = async () => {
      setInventoryLoading(true);
      setInventoryError(null);
      try {
        const items = await getInventoryItems();
        setInventoryItems(items);
      } catch (error) {
        console.error("Error fetching inventory items:", error);
        setInventoryError("Error fetching inventory items");
        toast({
          title: "Error",
          description: "Could not fetch inventory items.",
          variant: "destructive",
        });
      } finally {
        setInventoryLoading(false);
      }
    };

    const fetchLocations = async () => {
      setLocationsLoading(true);
      setLocationsError(null);
      try {
        const locs = await getItemStoreLocations();
        setLocations(locs);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocationsError("Error fetching locations");
        toast({
          title: "Error",
          description: "Could not fetch store locations.",
          variant: "destructive",
        });
      } finally {
        setLocationsLoading(false);
      }
    };

    const fetchSuppliers = async () => {
      setSuppliersLoading(true);
      setSuppliersError(null);
      try {
        const fetchedSuppliers = await getSuppliers();
        setSuppliers(Array.isArray(fetchedSuppliers) ? fetchedSuppliers : []);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setSuppliersError("Error fetching suppliers");
        toast({
          title: "Error",
          description: "Could not fetch suppliers.",
          variant: "destructive",
        });
      } finally {
        setSuppliersLoading(false);
      }
    };

    const fetchCustomers = async () => {
      setCustomersLoading(true);
      setCustomersError(null);
      try {
        const fetchedCustomers = await getCustomers();
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomersError("Error fetching customers");
        toast({
          title: "Error",
          description: "Could not fetch customers.",
          variant: "destructive",
        });
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchInventoryItems();
    fetchLocations();
    fetchSuppliers();
    fetchCustomers();
  }, [toast]);

  useEffect(() => {
    if (returningParty === "shop") {
      setValue("customerId", undefined);
      setValue("request", "refund");
    }
  }, [returningParty, setValue]);

  const handleItemChange = (itemId: string) => {
    const selectedItemData = inventoryItems.find(
      (item: InventoryItemWithRelations) => item.id === itemId
    );
    setSelectedItem(selectedItemData || null);
    if (selectedItemData) {
      setVariations(selectedItemData.variations);
      setValue("variationId", "");
    } else {
      setVariations([]);
    }
  };

  const onSubmit = async (data: FormData) => {
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
        const returnedAt = new Date(data.returnedAt);
        const quantityValue = parseInt(data.quantity, 10);
        const amountValue = parseFloat(data.amount);

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
          inventoryItemId: data.itemId,
          locationId: data.locationId,
          reason: data.reason as string,
          variationId: data.variationId,
          quantity: quantityValue,
          amount: amountValue,
          returningParty: data.returningParty,
          returnedAt: returnedAt,
          comments:
            data.comments?.filter((comment) => comment.trim() !== "") || [],
          ...(data.returningParty === "customer" && {
            customerId: data.customerId,
            request: data.request,
          }),
          ...(data.returningParty === "shop" && {
            supplier: data.supplier,
          }),
        };

        const res = await createReturnedItem(payload as any);

        if (res.status === "success") {
          toast({
            title: "Item Returned",
            description: "The Item has been returned successfully.",
          });
          router.refresh();
          closeDialog();
        } else {
          toast({
            title: "Return Failed",
            description:
              (res as any).message ||
              "Failed to record the return. Please check details.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error submitting return:", error);
        toast({
          title: "Submission Error",
          description:
            error.message ||
            "An unexpected error occurred while saving the return.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add Return Item</DialogTitle>
        <DialogDescription>
          Fill in the details below to record a returned item.
        </DialogDescription>
      </DialogHeader>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Item Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemId" className="text-sm font-medium">
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
                    name="itemId"
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
                              formErrors.itemId &&
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
                                    value={item.name}
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
                {formErrors.itemId && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.itemId.message}
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
                          {variations.map((variation: InventoryVariation) => (
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
                          {locations?.map((location) => (
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
                    min: { value: 1, message: "Quantity must be at least 1" },
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

        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Return Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="space-y-2">
                <Label htmlFor="returnedAt" className="text-sm font-medium">
                  Return Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="returnedAt"
                  type="date"
                  max={today}
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
            </div>

            {returningParty === "customer" && (
              <div className="space-y-4">
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
                            ? "Customer selection is required"
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
              </div>
            )}

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

            <div className="space-y-4">
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
                      "pl-7",
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
            {isPending || isSubmitting ? "Saving..." : "Save Return"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function CreateReturnItemDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus size={16} className="mr-2" />
            Add Return Item
          </Button>
        )}
      </DialogTrigger>
      <ReturnFormContent closeDialog={() => setOpen(false)} />
    </Dialog>
  );
}
