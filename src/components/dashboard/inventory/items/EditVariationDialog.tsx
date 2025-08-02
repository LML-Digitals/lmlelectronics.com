"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Pencil, ImagePlus, X, CircleDashed } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import {
  StockLevel,
  Variation,
  VariationFormData,
  VariationUpdateInput,
} from "./types/types";
import { updateVariation } from "./services/itemsCrud";
import {
  getDefaultShippingRate,
  getDefaultTaxRate,
} from "@/components/dashboard/settings/services/inventorySettings";

interface EditVariationDialogProps {
  variation: {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    image?: string | null;
    raw?: number;
    tax?: number;
    shipping?: number;
    markup?: number;
    visible?: boolean;
    stockLevels: {
      locationId: number;
      stock: number;
      purchaseCost?: number;
      location?: {
        id: number;
        name: string;
      };
    }[];
    useDefaultRates?: boolean;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  };
  locations: {
    id: number;
    name: string;
  }[];
  onUpdate?: () => void;
  trigger?: React.ReactNode;
  parentItemName?: string;
}

export function EditVariationDialog({
  variation,
  locations,
  onUpdate,
  trigger,
  parentItemName,
}: EditVariationDialogProps) {
  // Replace useDefaultRates hook with direct state management
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [defaultShippingRate, setDefaultShippingRate] = useState(0);
  const [loadingRates, setLoadingRates] = useState(true);

  // Fetch default rates directly from server functions
  useEffect(() => {
    const fetchDefaultRates = async () => {
      try {
        // Call server functions directly
        const taxRate = await getDefaultTaxRate();
        const shippingRate = await getDefaultShippingRate();

        setDefaultTaxRate(taxRate || 0);
        setDefaultShippingRate(shippingRate || 0);
        setLoadingRates(false);
      } catch (error) {
        console.error("Error fetching default rates:", error);
        setLoadingRates(false);
      }
    };

    fetchDefaultRates();
  }, []);

  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    variation.image || null
  );
  const [imageChanged, setImageChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Default stock levels based on the current variation
  const defaultStockLevels = locations.reduce((acc, location) => {
    const existingLevel = variation.stockLevels.find(
      (level) =>
        level.locationId === location.id || level.location?.id === location.id
    );

    return {
      ...acc,
      [location.id]: {
        stock: existingLevel?.stock || 0,
        purchaseCost: existingLevel?.purchaseCost || undefined,
        locationId: location.id,
        location: {
          id: location.id,
          name: location.name,
        },
      },
    };
  }, {} as Record<string, StockLevel>);

  // Form initialization
  const form = useForm<VariationFormData>({
    defaultValues: {
      id: variation.id,
      name: variation.name,
      sku: variation.sku,
      barcode: variation.barcode,
      image: variation.image,
      raw: variation.raw || 0,
      tax: variation.tax || 0,
      shipping: variation.shipping || 0,
      markup: variation.markup || 0.3,
      // sellingPrice: 0,
      // profit: 0,
      // totalCost: 0,
      visible: variation.visible !== false,
      useDefaultRates: variation.useDefaultRates !== false,
      weight: variation.weight || 0,
      length: variation.length || 0,
      width: variation.width || 0,
      height: variation.height || 0,
      stockLevels: locations.reduce((acc, location) => {
        const stockLevel = variation.stockLevels?.find(
          (sl) => sl.locationId === location.id
        );
        return {
          ...acc,
          [location.id]: {
            stock: stockLevel?.stock || 0,
            purchaseCost: stockLevel?.purchaseCost,
          },
        };
      }, {} as Record<string, StockLevel>),
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImageChanged(true);
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setImageChanged(true);
  };

  // Calculate derived values for preview
  const rawValue = form.watch("raw") || 0;
  const useDefaultRates = form.watch("useDefaultRates");
  const taxValue = useDefaultRates ? defaultTaxRate : form.watch("tax") || 0;
  const shippingValue = useDefaultRates
    ? defaultShippingRate
    : form.watch("shipping") || 0;
  const markupValue = form.watch("markup") || 0;

  const cost = rawValue + rawValue * (taxValue / 100) + shippingValue;
  const totalCost = cost + cost * (markupValue / 100);
  const profit = totalCost - cost;
  const sellingPrice = totalCost;

  const onSubmit = async (data: VariationFormData) => {
    try {
      setIsSubmitting(true);

      // Handle image upload
      let imageUrl = variation.image || null;
      if (imageChanged) {
        if (image) {
          try {
            // Upload image using API endpoint
            const fileName = `variation-${Date.now()}-${image.name.replace(
              /\s+/g,
              "-"
            )}`;

            const uploadResponse = await fetch(
              `/api/upload?filename=${image.name}`,
              {
                method: "POST",
                body: image,
              }
            );

            if (!uploadResponse.ok) {
              throw new Error("Failed to upload image");
            }

            const uploadResult = await uploadResponse.json();
            imageUrl = uploadResult.url;
          } catch (error) {
            console.error("Failed to upload image:", error);
            toast({
              variant: "destructive",
              title: "Image Upload Failed",
              description:
                "The image could not be uploaded, but other changes will be saved.",
            });
          }
        } else {
          // If image was removed
          imageUrl = "";
        }
      }

      // Convert stockLevels from form format to the format expected by the API
      const formattedStockLevels: Record<string, StockLevel> = {};

      // Make sure each location has an entry with at least stock: 0
      locations.forEach((location) => {
        const stockLevel = data.stockLevels[location.id.toString()];
        formattedStockLevels[location.id.toString()] = {
          stock: stockLevel?.stock || 0,
          purchaseCost: stockLevel?.purchaseCost,
          locationId: location.id,
          location: {
            id: location.id,
            name: location.name,
          },
        };
      });

      // Format the variation data for API
      const formattedData: VariationUpdateInput = {
        id: variation.id,
        name: data.name,
        sku: data.sku,
        barcode: data.barcode,
        image: imageUrl,
        raw: data.raw,
        tax: data.tax,
        shipping: data.shipping,
        markup: data.markup,
        visible: data.visible,
        useDefaultRates: data.useDefaultRates,
        weight: data.weight,
        length: data.length,
        width: data.width,
        height: data.height,
        stockLevels: formattedStockLevels,
      };

      await updateVariation(variation.id, formattedData);

      toast({
        title: "Success",
        description: "Variation updated successfully",
      });

      setOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update variation",
      });
      console.error("Error updating variation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Variation
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Variation</DialogTitle>
          {parentItemName && (
            <p className="text-sm text-muted-foreground">
              For item: {parentItemName}
            </p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Variation name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SKU code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-8">
                {preview ? (
                  <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                    <Image
                      src={preview}
                      alt="Variation image"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-0 right-0 h-6 w-6 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed rounded-md border-slate-300 cursor-pointer hover:border-slate-400">
                    <ImagePlus className="h-6 w-6 text-slate-400" />
                    <span className="text-xs text-slate-500 mt-1">Image</span>
                    <Input
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Visibility</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Make this variation visible in the inventory
                    </p>
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

            <Separator />

            <FormField
              control={form.control}
              name="useDefaultRates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Use Default Rates</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {field.value
                        ? "Using system default shipping and tax rates"
                        : "Using custom shipping and tax rates"}
                    </p>
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

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Pricing Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="raw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raw Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate</FormLabel>
                      <div className="flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={
                              useDefaultRates
                                ? `${defaultTaxRate} (Default)`
                                : "0.00"
                            }
                            {...field}
                            disabled={form.watch("useDefaultRates")}
                            onChange={(e) =>
                              field.onChange(
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </FormControl>
                        {form.watch("useDefaultRates") && (
                          <p className="text-xs text-muted-foreground">
                            Using system default tax rate: {defaultTaxRate}%
                          </p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shipping"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Cost</FormLabel>
                      <div className="flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={
                              useDefaultRates
                                ? `${defaultShippingRate} (Default)`
                                : "0.00"
                            }
                            {...field}
                            disabled={form.watch("useDefaultRates")}
                            onChange={(e) =>
                              field.onChange(
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </FormControl>
                        {form.watch("useDefaultRates") && (
                          <p className="text-xs text-muted-foreground">
                            Using system default shipping rate: $
                            {defaultShippingRate}
                          </p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="markup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Markup Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.30"
                          value={field.value !== undefined ? field.value : ""}
                          onChange={(e) => {
                            const value =
                              Number.parseFloat(e.target.value) || 0;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-md grid grid-cols-3 gap-x-6 gap-y-2 mt-2">
                <div>
                  <p className="text-xs text-slate-500">Total Cost</p>
                  <p className="font-medium">${totalCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Profit</p>
                  <p className="font-medium">${profit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Selling Price</p>
                  <p className="font-medium">${sellingPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Shipping Dimensions and Weight section */}
            <div className="space-y-4 mt-4">
              <h3 className="text-sm font-medium">
                Shipping Dimensions and Weight
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value || "0"))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length (in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value || "0"))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width (in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value || "0"))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (in)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value || "0"))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Stock Levels</h3>
              <p className="text-xs text-muted-foreground">
                Set the stock level for each location
              </p>

              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="grid grid-cols-2 gap-2 p-3 border rounded-md"
                  >
                    <p className="text-sm font-medium">{location.name}</p>
                    <FormField
                      control={form.control}
                      name={`stockLevels.${location.id}.stock` as any}
                      render={({ field }) => (
                        <FormItem className="mb-0">
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                              placeholder="Stock"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <CircleDashed className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Variation"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
