"use client";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ImagePlus, CircleDashed, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createInventoryItem, getWarrantyTypes } from "./services/itemsCrud";
import Image from "next/image";
import { createItemSchema } from "./schema/itemSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { UploadResponse } from "@/lib/types/upload";
import {
  CategoryWithChildren,
  Location,
  Supplier,
  VariationImage,
  findCategoryById,
  Variation,
  VariationFormData,
} from "./types/types";
import { CategorySelectionDialog } from "./CategoryComponents";
import { VariationDialog } from "./VariationDialog";
import { VariationTable } from "./VariationTable";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getTags } from "@/components/dashboard/Tags/services/tagCrud";
import { Tag } from "@prisma/client";

interface CreateItemDialogProps {
  onRefresh: () => void;
  categories: CategoryWithChildren[];
  suppliers: Supplier[];
  locations: Location[];
  initialSku?: string | null;
  initialBarcode?: string | null;
  isLoading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddItemDialog({
  onRefresh,
  categories,
  suppliers,
  locations,
  initialSku = null,
  initialBarcode = null,
  isLoading = false,
  open,
  onOpenChange,
}: CreateItemDialogProps) {
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null | string>(null);
  const [preview, setPreview] = useState<any>(null);
  const [variationImages, setVariationImages] = useState<VariationImage[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [variationDialogOpen, setVariationDialogOpen] = useState(false);
  const [editingVariation, setEditingVariation] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [warrantyTypes, setWarrantyTypes] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      duration: number;
    }>
  >([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagSearchOpen, setTagSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Add effect to fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getTags();
        setAllTags(tags.tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load tags",
        });
      }
    };

    fetchTags();
  }, []);

  // Create the default variation with proper stock levels
  const createDefaultVariation = (sku: string | null) => {
    if (!sku) return [];

    return [
      {
        name: "Default",
        sku: sku,
        image: null,
        raw: 0,
        tax: 0,
        shipping: 0,
        markup: 0,
        visible: true,
        useDefaultRates: true,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        stockLevels: locations.reduce(
          (acc, location) => ({
            ...acc,
            [location.id]: {
              stock: 0,
              purchaseCost: undefined,
            },
          }),
          {}
        ),
      },
    ];
  };

  // Form initialization
  const form = useForm<z.infer<typeof createItemSchema>>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      categoryIds: [],
      supplierId: null,
      warrantyTypeId: null,
      variations: initialSku ? createDefaultVariation(initialSku) : [],
      tagIds: [], // Changed from tags to tagIds
    },
  });

  // Reset form properly
  const handleOpen = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      form.reset({
        name: "",
        description: "",
        image: "",
        categoryIds: [],
        supplierId: null,
        warrantyTypeId: null,
        variations: initialSku ? createDefaultVariation(initialSku) : [],
        tagIds: [], // Changed from tags to tagIds
      });
      setImage(null);
      setPreview(null);
      setVariationImages([]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      const previewURL = URL.createObjectURL(e.target.files[0]);
      setPreview(previewURL);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    const currentIds = form.getValues("categoryIds");
    if (currentIds.includes(categoryId)) {
      form.setValue(
        "categoryIds",
        currentIds.filter((id) => id !== categoryId)
      );
    } else {
      form.setValue("categoryIds", [...currentIds, categoryId]);
    }
  };

  // Modified to handle variation image from dialog
  const handleAddVariation = (variation: VariationFormData) => {
    const currentVariations = form.getValues("variations") || [];
    const newIndex = currentVariations.length;

    // Add the variation to the form
    form.setValue("variations", [
      ...currentVariations,
      {
        name: variation.name,
        sku: variation.sku,
        image: variation.image,
        raw: variation.raw || 0,
        tax: variation.tax || 0,
        shipping: variation.shipping || 0,
        markup: variation.markup || 0.3,
        visible: variation.visible !== false,
        useDefaultRates: variation.useDefaultRates !== false,
        weight: variation.weight || 0,
        length: variation.length || 0,
        width: variation.width || 0,
        height: variation.height || 0,
        stockLevels: variation.stockLevels || {},
      },
    ]);

    // If there's an image, add it to variationImages
    if (variation.imageFile) {
      setVariationImages((prev) => {
        const newImages = [...prev];
        newImages[newIndex] = {
          file: variation.imageFile || null,
          preview: variation.imagePreview || variation.image || null,
          index: newIndex,
        };
        return newImages;
      });
    }
  };

  const handleEditVariation = (variation: VariationFormData, index: number) => {
    const currentVariations = form.getValues("variations");

    // Create a new array with the updated variation
    const updatedVariations = currentVariations?.map((existingVar, i) => {
      if (i === index) {
        // Return the updated variation data for the matching index
        return {
          name: variation.name,
          sku: variation.sku,
          image: variation.imageChanged ? variation.image : existingVar.image,
          raw: variation.raw || 0,
          tax: variation.tax || 0,
          shipping: variation.shipping || 0,
          markup: variation.markup || 0.3,
          visible: variation.visible !== false,
          useDefaultRates: variation.useDefaultRates !== false,
          weight: variation.weight || 0,
          length: variation.length || 0,
          width: variation.width || 0,
          height: variation.height || 0,
          stockLevels: variation.stockLevels || {},
        };
      }
      // Return the existing variation for other indices
      return existingVar;
    });

    // Set the new array in the form state
    form.setValue("variations", updatedVariations);

    // Update image state if changed
    if (variation.imageChanged) {
      setVariationImages((prevImages) => {
        const newImages = [...prevImages];
        if (variation.imageFile) {
          // Image added or changed
          newImages[index] = {
            file: variation.imageFile,
            preview: variation.imagePreview || variation.image || null,
            index,
          };
        } else {
          // Image removed
          const existingImage = newImages.find((img) => img?.index === index);
          if (existingImage) {
            existingImage.file = null;
            existingImage.preview = null;
          }
        }
        return newImages;
      });
    }
  };

  // Handle opening the edit dialog
  const handleOpenEditDialog = (index: number) => {
    const variations = form.getValues("variations");
    setEditingVariation(variations?.[index] as Variation);
    setEditingIndex(index);
    setVariationDialogOpen(true);
  };

  // Handle deleting a variation
  const handleDeleteVariation = (index: number) => {
    const variations = form.getValues("variations");
    variations?.splice(index, 1);
    form.setValue("variations", [...variations || []]);

    // Also remove the image if any
    setVariationImages((prev) => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages.map((img, i) => ({
        ...img,
        index: i,
      }));
    });
  };

  // Handle tag selection
  const handleSelectTag = (tagId: string) => {
    const currentTagIds = form.getValues("tagIds") || [];
    if (currentTagIds.includes(tagId)) {
      form.setValue(
        "tagIds",
        currentTagIds.filter((id) => id !== tagId)
      );
    } else {
      form.setValue("tagIds", [...currentTagIds, tagId]);
    }
  };

  // Filter tags based on search
  const filteredTags = searchValue
    ? allTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          (tag.description &&
            tag.description.toLowerCase().includes(searchValue.toLowerCase()))
      )
    : allTags;

  // Set initial SKU and barcode if provided
  useEffect(() => {
    if (initialSku) {
      form.setValue("variations.0.sku" as any, initialSku);
    }
    if (initialBarcode) {
      // Add a field for barcode in your variations if not already present
      form.setValue("variations.0.barcode" as any, initialBarcode);
    }
  }, [initialSku, initialBarcode, form]);

  // Submit handler
  const onSubmit = async (values: z.infer<typeof createItemSchema>) => {
    let imageUrl: string | null = null;
    try {
      setIsSubmitting(true);

      // Upload the main image if it exists
      if (image && image instanceof File) {
        const response = await fetch(`/api/upload?filename=${image.name}`, {
          method: "POST",
          body: image,
        });
        if (!response.ok) {
          throw new Error("Failed to upload file.");
        }
        const newBlob = (await response.json()) as UploadResponse;
        imageUrl = newBlob.url;
      }

      // Upload variation images
      const variationUploads = await Promise.all(
        variationImages.map(async (varImage) => {
          if (varImage?.file) {
            const response = await fetch(
              `/api/upload?filename=${varImage.file.name}`,
              {
                method: "POST",
                body: varImage.file,
              }
            );
            if (!response.ok)
              throw new Error(
                `Failed to upload variation image ${varImage.index}`
              );
            const blob = (await response.json()) as UploadResponse;
            return { index: varImage.index, url: blob.url };
          }
          return null;
        })
      );

      // Format the stock levels properly and include price fields
      const formattedData = {
        ...values,
        image: imageUrl,
        variations: values.variations?.map((variation, index) => {
          // Get the image URL for this variation if available
          const varImageUrl =
            variationUploads.find((upload) => upload?.index === index)?.url ||
            variation.image ||
            null;

          // Format stockLevels as an array of objects expected by the API
          const stockLevelsArray = Object.entries(variation.stockLevels).map(
            ([locationId, stockInfo]) => ({
              locationId: parseInt(locationId),
              stock: Number(stockInfo.stock || 0),
              purchaseCost: stockInfo.purchaseCost
                ? Number(stockInfo.purchaseCost)
                : undefined,
            })
          );

          return {
            // Keep existing variation fields (name, sku)
            name: variation.name,
            sku: variation.sku,
            // Add price and visibility fields
            raw: variation.raw,
            tax: variation.tax,
            shipping: variation.shipping,
            markup: variation.markup,
            visible: variation.visible,
            useDefaultRates: variation.useDefaultRates,
            weight: variation.weight,
            length: variation.length,
            width: variation.width,
            height: variation.height,
            image: varImageUrl,
            stockLevels: stockLevelsArray,
          };
        }),
      };

      const result = await createInventoryItem(formattedData);

      toast({
        title: "Success",
        description: "Item created successfully",
      });
      onRefresh();
      handleOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create item",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add useEffect to fetch warranty types
  useEffect(() => {
    const fetchWarrantyTypes = async () => {
      try {
        const types = await getWarrantyTypes();
        setWarrantyTypes(types);
      } catch (error) {
        console.error("Error fetching warranty types:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load warranty types",
        });
      }
    };

    fetchWarrantyTypes();
  }, []);

  if (isLoading) {
    return (
      <Button disabled>
        <CircleDashed className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Create Inventory Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              {/* Name with image preview */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Item name"
                            {...field}
                            className="w-full h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Item description"
                            className="resize-none min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="w-24 mt-8 self-start">
                  {preview ? (
                    <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                      <Image
                        src={preview}
                        alt="Preview"
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

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Categories</FormLabel>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {field.value.map((categoryId) => {
                          const category = findCategoryById(
                            categories,
                            categoryId
                          );
                          return category ? (
                            <Badge
                              key={category.id}
                              variant="secondary"
                              className="flex items-center gap-1 text-xs"
                            >
                              {category.name}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() =>
                                  handleCategorySelect(category.id)
                                }
                              />
                            </Badge>
                          ) : null;
                        })}
                      </div>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size={"sm"}
                          onClick={() => setCategoryDialogOpen(true)}
                          className="w-full text-sm h-10"
                        >
                          Select Categories
                        </Button>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Supplier</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select Supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem
                              key={supplier.id}
                              value={supplier.id.toString()}
                            >
                              {supplier.name}
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
                  name="warrantyTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Warranty Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select Warranty Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* <SelectItem value="none">None</SelectItem> */}
                          {warrantyTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tagIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {field.value?.map((tagId) => {
                        const tag = allTags.find((t) => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="flex items-center gap-1"
                            style={{
                              backgroundColor: tag.color || undefined,
                              color: tag.color ? "white" : undefined,
                            }}
                          >
                            {tag.name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleSelectTag(tag.id)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                    <FormControl>
                      <Popover
                        open={tagSearchOpen}
                        onOpenChange={setTagSearchOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            Select tags
                            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search tags..."
                              value={searchValue}
                              onValueChange={setSearchValue}
                            />
                            <CommandList>
                              <CommandEmpty>
                                No tags found. Try a different search.
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredTags.map((tag) => (
                                  <CommandItem
                                    key={tag.id}
                                    value={tag.name}
                                    onSelect={() => {
                                      handleSelectTag(tag.id);
                                      setSearchValue("");
                                      setTagSearchOpen(false);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor:
                                            tag.color || "#cccccc",
                                        }}
                                      />
                                      <span>{tag.name}</span>
                                    </div>
                                    <div className="ml-auto">
                                      {field.value?.includes(tag.id) && (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Variations Section */}
            <Separator />
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Variations & Stock</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingVariation(null);
                    setEditingIndex(-1);
                    setVariationDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variation
                </Button>
              </div>

              <VariationTable
                variations={form.watch("variations") || []}
                variationImages={variationImages}
                onEdit={handleOpenEditDialog}
                onDelete={handleDeleteVariation}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <CircleDashed className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Item
              </Button>
            </div>
          </form>
        </Form>

        <CategorySelectionDialog
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
          categories={categories}
          selectedIds={form.watch("categoryIds")}
          onSelect={handleCategorySelect}
        />

        <VariationDialog
          open={variationDialogOpen}
          onOpenChange={(open) => {
            setVariationDialogOpen(open);
            if (!open) {
              // Reset editing state when dialog closes
              setEditingVariation(null);
              setEditingIndex(-1);
            }
          }}
          onAdd={handleAddVariation}
          onEdit={handleEditVariation}
          locations={locations}
          editingVariation={editingVariation}
          editIndex={editingIndex}
          variationImage={
            editingIndex >= 0
              ? variationImages.find((img) => img.index === editingIndex) ||
                null
              : null
          }
        />
      </DialogContent>
    </Dialog>
  );
}
