"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  createInventoryAudit,
  updateInventoryAudit,
} from "./services/inventory-audit";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { InventoryItemWithRelations } from "../items/types/ItemType";
import { StoreLocation } from "@prisma/client";
import { Plus, Edit, Check, ChevronsUpDown } from "lucide-react";
import { AuditProps } from "./types";
import { cn } from "@/lib/utils";

export const AuditForm = ({
  inventoryItems,
  locations,
  audit,
  isEditMode = false,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onClose,
}: {
  inventoryItems: InventoryItemWithRelations[];
  locations: StoreLocation[];
  audit?: AuditProps | null;
  isEditMode?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external or internal state for open
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const currentUser = session?.user;

  const [formData, setFormData] = useState({
    inventoryItemId: "",
    inventoryVariationId: "",
    locationId: "",
    recordedStock: 0,
    actualStock: "",
  });

  const [variations, setVariations] = useState<
    {
      id: string;
      sku: string;
      name: string;
      stockLevels: { id: number; locationId: number; stock: number }[];
    }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [itemPopoverOpen, setItemPopoverOpen] = useState(false);

  // Populate form with audit data when in edit mode
  useEffect(() => {
    if (isEditMode && audit && open) {
      setFormData({
        inventoryItemId: audit.inventoryItem.id.toString(),
        inventoryVariationId: audit.inventoryVariation.id.toString(),
        locationId: audit.location.id.toString(),
        recordedStock: audit.recordedStock,
        actualStock: audit.actualStock.toString(),
      });
    } else if (open && !isEditMode) {
      // Reset form when opening in create mode
      setFormData({
        inventoryItemId: "",
        inventoryVariationId: "",
        locationId: "",
        recordedStock: 0,
        actualStock: "",
      });
    }
  }, [audit, isEditMode, open]);

  // Update variations when item changes
  useEffect(() => {
    if (formData.inventoryItemId) {
      const item = inventoryItems.find(
        (item) => item.id === formData.inventoryItemId
      );
      if (item) {
        setVariations(
          item.variations.map((v) => ({
            id: v.id,
            sku: v.sku,
            name: v.name,
            stockLevels: v.stockLevels.map((sl) => ({
              id: parseInt(sl.id),
              locationId: sl.locationId,
              stock: sl.stock,
            })),
          }))
        );
        if (!isEditMode) {
          setFormData((prev) => ({
            ...prev,
            inventoryVariationId: "",
            locationId: "",
            recordedStock: 0,
          }));
        }
      }
    } else {
      setVariations([]);
    }
  }, [formData.inventoryItemId, inventoryItems, isEditMode]);

  // Update recorded stock when variation and location changes
  useEffect(() => {
    if (formData.inventoryVariationId && formData.locationId && !isEditMode) {
      const variation = variations.find(
        (v) => v.id === formData.inventoryVariationId
      );
      if (variation) {
        const stockLevel = variation.stockLevels.find(
          (sl) => sl.locationId === parseInt(formData.locationId)
        );
        setFormData((prev) => ({
          ...prev,
          recordedStock: stockLevel?.stock || 0,
        }));
      }
    }
  }, [
    formData.inventoryVariationId,
    formData.locationId,
    variations,
    isEditMode,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleItemSelect = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      inventoryItemId: itemId,
      inventoryVariationId: "",
      locationId: "",
      recordedStock: 0,
    }));
    setItemPopoverOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.id) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    let result;
    if (isEditMode && audit) {
      // Update existing audit
      result = await updateInventoryAudit(audit.id, {
        actualStock: parseInt(formData.actualStock),
        recordedStock: audit.recordedStock,
      });
    } else {
      // Create new audit
      result = await createInventoryAudit({
        inventoryItemId: formData.inventoryItemId,
        inventoryVariationId: formData.inventoryVariationId,
        locationId: parseInt(formData.locationId),
        recordedStock: formData.recordedStock,
        actualStock: parseInt(formData.actualStock),
        auditedBy: currentUser.id,
      });
    }

    setLoading(false);

    if (result.success) {
      toast({
        title: "Success",
        description: isEditMode
          ? "Inventory audit updated successfully"
          : "Inventory audit created successfully",
      });
      setOpen(false);
      router.refresh(); // Refresh the page data
    } else {
      toast({
        title: "Error",
        description: isEditMode
          ? "Failed to update inventory audit"
          : "Failed to create inventory audit",
        variant: "destructive",
      });
    }
  };

  const dialogTitle = isEditMode
    ? "Edit Inventory Audit"
    : "Create Inventory Audit";
  const dialogDescription = isEditMode
    ? "Update actual stock count for this inventory audit."
    : "Record a new inventory audit by counting and comparing actual stock levels.";
  const submitButtonText = isEditMode ? "Update Audit" : "Submit Audit";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Audit
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{dialogTitle}</DialogTitle>
          <DialogDescription className="text-sm">{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="inventoryItemId" className="text-sm font-medium">Inventory Item</label>
              <Popover open={itemPopoverOpen} onOpenChange={setItemPopoverOpen}>
                <PopoverTrigger asChild disabled={isEditMode}>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={itemPopoverOpen}
                    className={cn(
                      "w-full justify-between h-10",
                      isEditMode && "bg-gray-100 cursor-not-allowed"
                    )}
                  >
                    {formData.inventoryItemId
                      ? inventoryItems.find(
                          (item) => item.id === formData.inventoryItemId
                        )?.name
                      : "Select an item..."}
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
                            value={item.id}
                            onSelect={(currentValue) => {
                              handleItemSelect(
                                currentValue === formData.inventoryItemId
                                  ? ""
                                  : currentValue
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.inventoryItemId === item.id
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
            </div>

            {(variations.length > 0 || isEditMode) && (
              <div className="space-y-2">
                <label htmlFor="inventoryVariationId" className="text-sm font-medium">Variation</label>
                <Select
                  value={formData.inventoryVariationId}
                  onValueChange={(value) =>
                    handleSelectChange("inventoryVariationId", value)
                  }
                  disabled={isEditMode}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a variation" />
                  </SelectTrigger>
                  <SelectContent>
                    {variations.map((variation) => (
                      <SelectItem
                        key={variation.id}
                        value={variation.id.toString()}
                      >
                        {variation.name} (SKU: {variation.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="locationId" className="text-sm font-medium">Location</label>
              <Select
                value={formData.locationId}
                onValueChange={(value) =>
                  handleSelectChange("locationId", value)
                }
                disabled={isEditMode}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <label htmlFor="recordedStock" className="text-sm font-medium">Recorded Stock</label>
              <Input
                id="recordedStock"
                name="recordedStock"
                type="number"
                value={formData.recordedStock}
                disabled
                className="bg-gray-100 h-10"
              />
              <p className="text-xs text-gray-500">
                Current stock level recorded in the system
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="actualStock" className="text-sm font-medium">Actual Stock</label>
              <Input
                id="actualStock"
                name="actualStock"
                type="number"
                value={formData.actualStock}
                onChange={handleChange}
                placeholder="Enter the actual count found during audit"
                required
                min="0"
                className="h-10"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setOpen(false);
                if (onClose) onClose();
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                (!isEditMode &&
                  (!formData.inventoryVariationId || !formData.locationId)) ||
                !formData.actualStock
              }
              className="w-full sm:w-auto"
            >
              {loading ? "Submitting..." : submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
