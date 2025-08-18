'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ImagePlus, X, CircleDashed } from 'lucide-react';
import type {
  Location,
  Variation,
  VariationFormData,
  StockLevel,
} from './types/types';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { generateSKU } from './utils/generateSKU';
import {
  getDefaultShippingRate,
  getDefaultTaxRate,
} from '@/components/dashboard/settings/services/inventorySettings';

interface VariationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (variation: VariationFormData) => void;
  onEdit?: (variation: VariationFormData, index: number) => void;
  locations: Location[];
  editingVariation?: Variation | null;
  editIndex?: number;
  variationImage?: { file: File | null; preview: string | null } | null;
}

export function VariationDialog ({
  open,
  onOpenChange,
  onAdd,
  onEdit,
  locations,
  editingVariation = null,
  editIndex = -1,
  variationImage = null,
}: VariationDialogProps) {
  // Initialize state with edit data if provided
  const [image, setImage] = useState<File | null>(variationImage?.file || null);
  const [preview, setPreview] = useState<string | null>(variationImage?.preview || null);
  const [imageChanged, setImageChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = editingVariation !== null;

  // Add default rates state
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [defaultShippingRate, setDefaultShippingRate] = useState(0);
  const [loadingRates, setLoadingRates] = useState(true);

  // Default stock levels for a new variation
  const defaultStockLevels = locations.reduce(
    (acc, location) => ({
      ...acc,
      [location.id]: {
        stock: 0,
      },
    }),
    {} as Record<string, { stock: number }>,
  );

  const variationForm = useForm<VariationFormData>({
    defaultValues: isEditing
      ? {
        ...editingVariation,
        stockLevels: editingVariation.stockLevels || defaultStockLevels,
        raw: editingVariation.raw || 0,
        tax: editingVariation.tax || 0,
        shipping: editingVariation.shipping || 0,
        markup: editingVariation.markup || 0.3,
        visible: editingVariation.visible !== false,
        useDefaultRates: editingVariation.useDefaultRates !== false,
        image: editingVariation.image || null,
        weight: editingVariation.weight || 0,
        length: editingVariation.length || 0,
        width: editingVariation.width || 0,
        height: editingVariation.height || 0,
      }
      : {
        name: '',
        sku: '',
        image: null,
        stockLevels: defaultStockLevels,
        raw: 0,
        tax: 0,
        shipping: 0,
        markup: 0.3,
        visible: true,
        useDefaultRates: true,
        barcode: undefined,
        imageFile: null,
        imagePreview: null,
        imageChanged: false,
        id: undefined,
      },
  });

  // Reset form when editing variation changes
  useEffect(() => {
    if (!open) { return; } // Don't reset form while dialog is open

    if (isEditing && editingVariation) {
      // Explicitly set price fields from editingVariation
      variationForm.reset({
        ...editingVariation, // Spread first to get name, sku, etc.
        // Explicitly set potentially missing/overwritten fields:
        raw: editingVariation.raw ?? 0,
        tax: editingVariation.tax ?? 0,
        shipping: editingVariation.shipping ?? 0,
        markup: editingVariation.markup ?? 0.3, // Keep default if undefined
        visible: editingVariation.visible !== false,
        stockLevels: editingVariation.stockLevels || defaultStockLevels,
        image: editingVariation.image || null,
        barcode: editingVariation.barcode,
        // Reset image state fields
        imageFile: null,
        imagePreview: null,
        imageChanged: false,
        useDefaultRates: editingVariation.useDefaultRates !== false,
        weight: editingVariation.weight ?? 0,
        length: editingVariation.length ?? 0,
        width: editingVariation.width ?? 0,
        height: editingVariation.height ?? 0,
      });
      setImage(variationImage?.file || null);
      setPreview(variationImage?.preview || editingVariation.image || null);
      setImageChanged(false);
    } else if (!isEditing) {
      variationForm.reset({
        name: '',
        sku: generateSKU(),
        image: null,
        stockLevels: defaultStockLevels,
        raw: 0,
        tax: 0,
        shipping: 0,
        markup: 0.3,
        visible: true,
        useDefaultRates: true,
        barcode: undefined,
        imageFile: null,
        imagePreview: null,
        imageChanged: false,
        id: undefined,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
      });
      setImage(null);
      setPreview(null);
      setImageChanged(false);
    }
  }, [editingVariation, variationImage, isEditing, open, variationForm]);

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
        console.error('Error fetching default rates:', error);
        setLoadingRates(false);
      }
    };

    fetchDefaultRates();
  }, []);

  // Auto-generate SKU only when adding a new variation and dialog opens
  useEffect(() => {
    if (!isEditing && open) {
      variationForm.setValue('sku', generateSKU());
    }
  }, [isEditing, open, variationForm]);

  // Cleanup effect when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset form and state when dialog closes
      setTimeout(() => {
        variationForm.reset();
        setImage(null);
        setPreview(null);
        setImageChanged(false);
      }, 100); // Small delay to ensure DOM cleanup
    }
  }, [open, variationForm]);

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
  const rawValue = variationForm.watch('raw') || 0;
  const useDefaultRates = variationForm.watch('useDefaultRates');
  const taxValue = useDefaultRates
    ? defaultTaxRate
    : variationForm.watch('tax') || 0;
  const shippingValue = useDefaultRates
    ? defaultShippingRate
    : variationForm.watch('shipping') || 0;
  const markupValue = variationForm.watch('markup') || 0;

  const cost = rawValue + rawValue * (taxValue / 100) + shippingValue;
  const totalCost = cost + cost * (markupValue / 100);
  const profit = totalCost - cost;
  const sellingPrice = totalCost;

  // Update the onSubmit function to use the API endpoint
  const onSubmit = async (data: VariationFormData) => {
    setIsSubmitting(true);
    // Handle image upload if needed
    let imageUrl = isEditing ? editingVariation?.image : null;

    if (imageChanged) {
      if (image) {
        try {
          // Upload image using API endpoint
          // const fileName = `variation-${Date.now()}-${image.name.replace(
          //   /\s+/g,
          //   "-"
          // )}`;

          // console.log({ fileName, image });

          const uploadResponse = await fetch(
            `/api/upload?filename=${image.name}`, // Keep fileName in query param for now
            {
              method: 'POST',
              body: image,
            },
          );

          if (!uploadResponse.ok) {
            console.error(
              'Failed to upload image:',
              await uploadResponse.text(),
            );
            throw new Error('Failed to upload image');
          }

          const uploadResult = await uploadResponse.json();

          imageUrl = uploadResult.url;
        } catch (error) {
          console.error('Failed to upload image:', error);
          setIsSubmitting(false);

          return;
        }
      } else {
        imageUrl = null;
      }
    }

    const formData: VariationFormData = {
      ...data,
      image: imageUrl,
      imageFile: image,
      imagePreview: preview,
      imageChanged,
      id: isEditing ? editingVariation?.id : undefined,
    };

    try {
      if (isEditing && onEdit) {
        onEdit(formData, editIndex);
      } else {
        onAdd(formData);
      }

      // Don't reset form immediately - let the cleanup effect handle it
      onOpenChange(false);
    } catch (error) {
      console.error('Error during variation save:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog key={`variation-dialog-${open}-${editIndex}`} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Variation' : 'Add Variation'}
          </DialogTitle>
        </DialogHeader>

        <Form {...variationForm}>
          <form
            onSubmit={variationForm.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="flex gap-4">
              <div className="flex-1 space-y-4 w-20">
                <FormField
                  control={variationForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-60">
                      <FormLabel>Variation Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={variationForm.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <div className="flex gap-2">
                        <FormControl className="w-36">
                          <Input {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => variationForm.setValue('sku', generateSKU())
                          }
                        >
                          Generate
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-8">
                {preview ? (
                  <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                    <Image
                      src={preview || '/placeholder.svg'}
                      alt="Variation Preview"
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
                    <span className="text-xs text-slate-500 mt-1">
                      Add Image
                    </span>
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

            {/* Visibility toggle */}
            <FormField
              control={variationForm.control}
              name="visible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Visibility</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {field.value
                        ? 'Visible to customers'
                        : 'Hidden from customers'}
                    </div>
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

            {/* Use Default Rates toggle - moved above pricing section */}
            <FormField
              control={variationForm.control}
              name="useDefaultRates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Use Default Rates</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {field.value
                        ? 'Using system default shipping and tax rates'
                        : 'Using custom shipping and tax rates'}
                    </div>
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

            {/* Pricing section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Pricing Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={variationForm.control}
                  name="raw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raw Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={variationForm.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate</FormLabel>
                      <div className="flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={
                              useDefaultRates
                                ? `${defaultTaxRate} (Default)`
                                : '0.00'
                            }
                            {...field}
                            disabled={variationForm.watch('useDefaultRates')}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        {variationForm.watch('useDefaultRates') && (
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
                  control={variationForm.control}
                  name="shipping"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Cost</FormLabel>
                      <div className="flex flex-col space-y-1">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={
                              useDefaultRates
                                ? `${defaultShippingRate} (Default)`
                                : '0.00'
                            }
                            {...field}
                            disabled={variationForm.watch('useDefaultRates')}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        {variationForm.watch('useDefaultRates') && (
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
                  control={variationForm.control}
                  name="markup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Markup Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.30"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Price calculation preview */}
              <div className="bg-slate-50 p-3 rounded-md space-y-2">
                <h4 className="text-sm font-medium">
                  Price Calculation Preview
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total Cost:</div>
                  <div className="font-medium">${totalCost.toFixed(2)}</div>

                  <div>Profit:</div>
                  <div className="font-medium">${profit.toFixed(2)}</div>

                  <div>Selling Price:</div>
                  <div className="font-medium">${sellingPrice.toFixed(2)}</div>
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
                  control={variationForm.control}
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value || '0'))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={variationForm.control}
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value || '0'))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={variationForm.control}
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value || '0'))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={variationForm.control}
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value || '0'))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h5 className="font-medium text-sm">Stock Levels</h5>
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="grid grid-cols-3 gap-4 items-center"
                >
                  <p className="text-sm">{location.name}</p>
                  <FormField
                    control={variationForm.control}
                    name={`stockLevels.${location.id}.stock` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Stock amount"
                            {...field}
                            value={field.value || 0}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <CircleDashed className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isEditing ? 'Save Changes' : 'Add Variation'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
