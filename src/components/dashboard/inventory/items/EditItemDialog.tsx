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
import {
  ImagePlus,
  Pencil,
  CircleDashed,
  Plus,
  Edit,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateInventoryItem, getWarrantyTypes } from "./services/itemsCrud";
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
import {
  CategoryWithChildren,
  Location,
  Supplier,
  VariationImage,
  findCategoryById,
  VariationFormData,
  Variation,
} from "./types/types";
import { CategorySelectionDialog } from "./CategoryComponents";
import { VariationDialog } from "./VariationDialog";
import { VariationTable } from "./VariationTable";
import { InventoryItemWithRelations } from "./types/ItemType";
import { VariationInput } from "./services/itemsCrud";
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
import type { UploadResponse } from "@/lib/types/upload";

interface EditItemDialogProps {
  item: InventoryItemWithRelations;
  onEdited: () => void;
  categories: CategoryWithChildren[];
  suppliers: Supplier[];
  locations: Location[];
  isLoading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditItemDialog({
  item,
  onEdited,
  categories,
  suppliers,
  locations,
  isLoading,
  open: controlledOpen,
  onOpenChange,
}: EditItemDialogProps) {
  const { toast } = useToast();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null | string>(item.image);
  const [preview, setPreview] = useState<string | null>(item.image);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [variationDialogOpen, setVariationDialogOpen] = useState(false);
  const [editingVariation, setEditingVariation] = useState<Variation | null>(
    null
  );
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagSearchOpen, setTagSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Convert existing variation images to VariationImage format
  const [variationImages, setVariationImages] = useState<VariationImage[]>(
    item.variations.map((v, index) => ({
      file: null,
      preview: v.image,
      index,
    }))
  );

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

  // Filter tags based on search
  const filteredTags = searchValue
    ? allTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          (tag.description &&
            tag.description.toLowerCase().includes(searchValue.toLowerCase()))
      )
    : allTags;

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

  // Initialize form with existing item data
  const form = useForm<z.infer<typeof createItemSchema>>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: item.name,
      description: item.description || "",
      image: item.image,
      categoryIds: item.categories.map((c) => c.id),
      supplierId: item.supplierId,
      warrantyTypeId: item.warrantyTypeId,
      variations: item.variations.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        image: v.image,
        raw: v.raw ?? 0,
        tax: v.tax ?? 0,
        shipping: v.shipping ?? 0,
        markup: v.markup ?? 0.3,
        visible: v.visible !== false,
        useDefaultRates: v.useDefaultRates !== false,
        weight: v.weight ?? 0,
        length: v.length ?? 0,
        width: v.width ?? 0,
        height: v.height ?? 0,
        stockLevels: Object.fromEntries(
          v.stockLevels.map((sl) => [
            sl.locationId,
            {
              stock: sl.stock,
              purchaseCost: sl.purchaseCost ?? undefined,
            },
          ])
        ),
      })),
      tagIds: item.tags.map((t) => t.id), // Change to use tag IDs
    },
  });

  // Inside the component, add a state variable for warranty types
  const [warrantyTypes, setWarrantyTypes] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      duration: number;
    }>
  >([]);

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

  // Handle dialog state
  const handleOpen = (value: boolean) => {
    setOpen(value);
    if (!value) {
      // Reset state when dialog closes
      setImage(item.image);
      setPreview(item.image);
      setCategoryDialogOpen(false);
      setVariationDialogOpen(false);
      setEditingVariation(null);
      setEditingIndex(-1);
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

  // Handle adding a new variation
  const handleAddVariation = (variation: VariationFormData) => {
    const currentVariations = form.watch("variations") || [];
    const newIndex = currentVariations.length;

    // Add the variation to the form
    form.setValue("variations", [
      ...currentVariations,
      {
        id: variation.id,
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
          preview: variation.imagePreview || null,
          index: newIndex,
        };
        return newImages;
      });
    }
  };

  // Handle editing an existing variation - Refactored to use .map for immutability
  const handleEditVariation = (
    variationData: VariationFormData,
    index: number
  ) => {
    const currentVariations = [...(form.getValues("variations") || [])];
    if (index >= 0 && index < currentVariations.length) {
      // Update the variation at the specified index
      currentVariations[index] = {
        id: variationData.id,
        name: variationData.name,
        sku: variationData.sku,
        image: variationData.image,
        raw: variationData.raw || 0,
        tax: variationData.tax || 0,
        shipping: variationData.shipping || 0,
        markup: variationData.markup || 0.3,
        visible: variationData.visible !== false,
        useDefaultRates: variationData.useDefaultRates !== false,
        weight: variationData.weight || 0,
        length: variationData.length || 0,
        width: variationData.width || 0,
        height: variationData.height || 0,
        stockLevels: variationData.stockLevels || {},
      };
      form.setValue("variations", currentVariations);

      // Update variation images if changed
      if (variationData.imageChanged) {
        setVariationImages((prevImages) => {
          const newImages = [...prevImages];
          const existingImageIndex = newImages.findIndex(
            (img) => img.index === index
          );

          if (existingImageIndex >= 0) {
            // Update existing image
            newImages[existingImageIndex] = {
              file: variationData.imageFile || null,
              preview:
                variationData.imagePreview || variationData.image || null,
              index,
            };
          } else if (variationData.imageFile) {
            // Add new image
            newImages.push({
              file: variationData.imageFile || null,
              preview:
                variationData.imagePreview || variationData.image || null,
              index,
            });
          }

          return newImages;
        });
      }
    }
  };

  // Handle opening the edit dialog
  const handleOpenEditDialog = (index: number) => {
    const variations = form.getValues("variations") || [];
    const variationToEdit = variations[index];
    if (!variationToEdit) return;

    const variationImage = variationImages.find((img) => img.index === index);
    setEditingVariation({
      ...variationToEdit,
      image: variationImage?.preview || null,
      stockLevels: variationToEdit.stockLevels || {},
    });
    setEditingIndex(index);
    setVariationDialogOpen(true);
  };

  // Handle deleting a variation
  const handleDeleteVariation = (index: number) => {
    const currentVariations = form.getValues("variations") || [];
    const updatedVariations = currentVariations.filter((_, i) => i !== index);
    form.setValue("variations", updatedVariations);

    // Also remove the corresponding image from variationImages state
    setVariationImages((prev) =>
      prev
        .filter((img) => img.index !== index)
        // Re-index the remaining images
        .map((img, newIndex) => ({ ...img, index: newIndex }))
    );

    // Adjust editing index if a variation before the currently edited one is deleted
    if (editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    } else if (editingIndex === index) {
      // If the currently edited variation is deleted, reset editing state
      setEditingIndex(-1);
      setEditingVariation(null);
      setVariationDialogOpen(false); // Close dialog if the edited one is deleted
    }

    toast({
      title: "Variation Removed",
      description: "The variation has been marked for deletion.",
    });
  };

  const onSubmit = async (values: z.infer<typeof createItemSchema>) => {
    try {
      setIsSubmitting(true);

      // Handle main image upload if changed
      let imageUrl = values.image;
      if (image instanceof File) {
        const response = await fetch(`/api/upload?filename=${image.name}`, {
          method: "POST",
          body: image,
        });
        if (!response.ok) throw new Error("Failed to upload main image");
        const newBlob = (await response.json()) as UploadResponse;
        imageUrl = newBlob.url;
      } else if (image === null && item.image) {
        imageUrl = null;
      }

      // Prepare variation data, including IDs for existing ones
      const finalVariations = await Promise.all(
        (values.variations || []).map(async (variation, index) => {
          const varImageState = variationImages.find(
            (img) => img.index === index
          );
          let varImageUrl = variation.image;

          if (varImageState?.file) {
            const response = await fetch(
              `/api/upload?filename=${varImageState.file.name}`,
              {
                method: "POST",
                body: varImageState.file,
              }
            );
            if (!response.ok)
              throw new Error(`Failed to upload variation image ${index}`);
            const newBlob = (await response.json()) as UploadResponse;
            varImageUrl = newBlob.url;
          } else if (varImageState?.preview === null && variation.image) {
            varImageUrl = null;
          }

          return {
            id: variation.id,
            name: variation.name,
            sku: variation.sku,
            image: varImageUrl,
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
            stockLevels: Object.entries(variation.stockLevels || {}).map(
              ([locationId, stockInfo]) => ({
                locationId: parseInt(locationId),
                stock: Number(stockInfo.stock || 0),
                purchaseCost: stockInfo.purchaseCost
                  ? Number(stockInfo.purchaseCost)
                  : undefined,
              })
            ),
          };
        })
      );

      // Submit update
      await updateInventoryItem(item.id, {
        ...values,
        image: imageUrl,
        variations: finalVariations,
        categoryIds: values.categoryIds || [],
        tagIds: values.tagIds || [],
      });

      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      setOpen(false);
      onEdited();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update item",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled>
        <CircleDashed className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Dialog
      key={`edit-item-dialog-${item.id}`}
      open={open}
      onOpenChange={handleOpen}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item: {item.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              {/* Name with image preview */}
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Item name"
                            {...field}
                            className="w-full"
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
                        <FormLabel>Description</FormLabel>
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

                <div className="w-24 mt-8">
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
                      <FormLabel>Categories</FormLabel>
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
                              className="flex items-center gap-1"
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
                          onClick={() => setCategoryDialogOpen(true)}
                          className="w-full"
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
                      <FormLabel>Supplier</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((Supplier) => (
                            <SelectItem
                              key={Supplier.id}
                              value={Supplier.id.toString()}
                            >
                              {Supplier.name}
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
                      <FormLabel>Warranty Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                      {(field.value || []).map((tagId) => {
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
                                      {(field.value || []).includes(tag.id) && (
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
                Save Changes
              </Button>
            </div>
          </form>
        </Form>

        <CategorySelectionDialog
          key={`category-dialog-${open}`}
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
          categories={categories}
          selectedIds={form.watch("categoryIds")}
          onSelect={handleCategorySelect}
        />

        <VariationDialog
          key={`variation-dialog-${open}-${editingIndex}`}
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
