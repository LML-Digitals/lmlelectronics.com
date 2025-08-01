"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Package,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  ShoppingBag,
  Printer,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { InventoryItemWithRelations } from "./types/ItemType";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { deleteInventoryItem } from "./services/itemsCrud";
import { EditItemDialog } from "./EditItemDialog";
import Image from "next/image";
import { CategoryWithChildren } from "../categories/types/types";
import { cn } from "@/lib/utils";
import { DeleteItemDialog } from "./DeleteItemDialog";
import { VariationDetailsDialog } from "./VariationDetailsDialog";

interface ItemDetailsDialogProps {
  item: InventoryItemWithRelations;
  selectedVariation?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
  categories: CategoryWithChildren[];
  suppliers: { id: number; name: string }[];
  locations: { id: number; name: string }[];
}

export function ItemDetailsDialog({
  item,
  selectedVariation,
  open,
  onOpenChange,
  onRefresh,
  categories,
  suppliers,
  locations,
}: ItemDetailsDialogProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const totalStock = item.variations.reduce(
    (total, variation) =>
      total +
      variation.stockLevels.reduce((sum, level) => sum + level.stock, 0),
    0
  );

  const getStockLevelColor = (stock: number): string => {
    if (stock <= 0) return "text-destructive";
    if (stock < 5) return "text-amber-500";
    return "text-emerald-600";
  };

  // Use selectedVariation if provided
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(
    selectedVariation?.id || null
  );

  // Modify the existing state for the active tab
  const [activeTab, setActiveTab] = useState(
    selectedVariation ? "variations" : "details"
  );

  // Find the variation in the item's variations if we have a selectedVariationId
  const initialVariation = item.variations.find(
    (v) => v.id === selectedVariationId
  );

  // When selectedVariation changes, update the selectedVariationId
  useEffect(() => {
    if (selectedVariation?.id) {
      setSelectedVariationId(selectedVariation.id);
    }
  }, [selectedVariation]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] pt-14 overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="border-b pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                Item Details
              </DialogTitle>
              <div className="flex items-center gap-2">
                <EditItemDialog
                  item={item}
                  onEdited={() => {
                    onOpenChange(false);
                    onRefresh();
                  }}
                  categories={categories}
                  suppliers={suppliers}
                  locations={locations}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="transition-all hover:bg-destructive/90"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 py-4 sm:py-6">
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 min-w-[128px] sm:min-w-[160px] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border self-center md:self-start">
              {item.image ? (
                <Image
                  src={item.image}
                  className="object-cover"
                  alt={item.name}
                  fill
                  sizes="160px"
                />
              ) : (
                <Package className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300" />
              )}
            </div>
            <div className="flex-1 space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold leading-tight">
                {item.name}
              </h2>
              {item.description && (
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <Badge variant="outline" className="px-2 py-1 w-fit">
                  ID: {item.id}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 w-fit"
                >
                  {totalStock} in stock
                </Badge>
              </div>

              <Separator className="my-2" />

              {item.supplier && (
                <div className="flex items-center gap-2 text-sm">
                  <ShoppingBag className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-500">Supplier:</span>
                  <span className="font-medium">{item.supplier.name}</span>
                </div>
              )}

              {item.categories.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-500">Categories:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {item.tags.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-500">Tags:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="px-2 py-0.5 text-xs"
                        style={{
                          backgroundColor: tag.color || undefined,
                          color: tag.color ? "white" : undefined,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {item.warrantyType && (
                <div className="col-span-full">
                  <div className="">
                    <p className="text-xs mb-2">Warranty:</p>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-muted-foreground text-xs mr-2">
                          Type:
                        </span>
                        <span className="font-medium text-xs">
                          {item.warrantyType.name}
                        </span>
                      </div>
                      {item.warrantyType.description && (
                        <div>
                          <span className="text-muted-foreground text-xs mr-2">
                            Details:
                          </span>
                          <span className="text-xs">
                            {item.warrantyType.description}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground text-xs mr-2">
                          Duration:
                        </span>
                        <span className="text-xs">
                          {item.warrantyType.duration === 0
                            ? "Lifetime"
                            : `${item.warrantyType.duration} ${
                                item.warrantyType.duration === 1
                                  ? "month"
                                  : "months"
                              }`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="variations"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Variations ({item.variations.length})
              </TabsTrigger>
              <TabsTrigger
                value="stock"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Stock ({totalStock})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="variations" className="mt-4 space-y-4">
              {item.variations.length > 0 ? (
                <>
                  {/* If we have a selected variation, make sure it's visible */}
                  {selectedVariationId && (
                    <div className="mb-4 p-2 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-600">
                        Showing details for the scanned variation
                      </p>
                    </div>
                  )}

                  {/* Existing variations content */}
                  {item.variations.map((variation) => (
                    <VariationCard
                      key={variation.id}
                      variation={{
                        ...variation,
                        barcode: variation.barcode || undefined,
                      }}
                      locations={locations}
                      isSelected={variation.id === selectedVariationId}
                      onRefresh={onRefresh}
                    />
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                  <Package className="h-12 w-12 mb-2 text-slate-300" />
                  <p>No variations found for this item</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stock" className="pt-4">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  {item.variations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                      <AlertCircle className="h-12 w-12 mb-2 text-slate-300" />
                      <p>No stock information available</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {item.variations.map((variation) => (
                        <div
                          key={variation.id}
                          className="rounded-lg border p-4"
                        >
                          <h4 className="font-medium mb-3 flex items-center justify-between">
                            <span>{variation.name}</span>
                            <Badge variant="outline" className="font-normal">
                              {variation.stockLevels.reduce(
                                (sum: number, level: { stock: number }) =>
                                  sum + level.stock,
                                0
                              )}{" "}
                              total
                            </Badge>
                          </h4>
                          <div className="space-y-1">
                            {variation.stockLevels.length === 0 ? (
                              <p className="text-sm text-slate-500 text-center py-2">
                                No stock levels set
                              </p>
                            ) : (
                              variation.stockLevels.map((level) => (
                                <div
                                  key={level.locationId}
                                  className="flex justify-between items-center py-2.5 px-3 border-b last:border-0 rounded-md hover:bg-slate-50"
                                >
                                  <span className="text-sm font-medium">
                                    {level.location.name}
                                  </span>
                                  <div className="flex items-center gap-6">
                                    <span
                                      className={cn(
                                        "text-sm font-medium flex items-center",
                                        "text-sm font-medium flex items-center",
                                        getStockLevelColor(level.stock)
                                      )}
                                    >
                                      {level.stock} units
                                    </span>
                                    {level.purchaseCost && (
                                      <span className="text-sm text-slate-500">
                                        ${level.purchaseCost.toFixed(2)} per
                                        unit
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Item Dialog */}
      {deleteDialogOpen && (
        <DeleteItemDialog
          item={item}
          open={!!item}
          onOpenChange={(open: boolean) => !open && setDeleteDialogOpen(false)}
          onDeleted={() => {
            onRefresh();
          }}
        />
      )}
    </>
  );
}

// Create a helper component for variation cards with isSelected prop
interface VariationCardProps {
  variation: {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    image?: string | null;
    inventoryItem?: { name: string };
    sellingPrice?: number;
    stockLevels: {
      locationId?: number;
      stock: number;
      location?: {
        id: number;
        name: string;
      };
    }[];
  };
  locations: {
    id: number;
    name: string;
  }[];
  isSelected?: boolean;
  onRefresh: () => void;
}

function VariationCard({
  variation,
  locations,
  isSelected = false,
  onRefresh,
}: VariationCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${
        isSelected ? "border-blue-500 border-2" : ""
      }`}
    >
      <CardContent className="p-0">
        <div className="flex items-start gap-4 p-4">
          <div className="relative h-20 w-20 min-w-[80px] rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border">
            {variation.image ? (
              <Image
                src={variation.image}
                className="object-cover"
                alt={variation.name}
                fill
                sizes="80px"
              />
            ) : (
              <Package className="h-8 w-8 text-slate-300" />
            )}
          </div>
          <div className="flex-1 pt-1">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{variation.name}</h4>
              <Badge variant="outline" className="ml-2">
                {variation.stockLevels.reduce(
                  (sum: number, level: { stock: number }) => sum + level.stock,
                  0
                )}{" "}
                in stock
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              SKU: {variation.sku || "Not set"}
            </p>
            {variation.barcode && (
              <p className="text-sm text-slate-500 mt-1">
                Barcode: {variation.barcode}
              </p>
            )}
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm font-medium">
                ${variation.sellingPrice?.toFixed(2) || "0.00"}
              </div>
              <div className="flex space-x-2">
                <VariationDetailsDialog
                  variation={variation}
                  parentItemName={variation.inventoryItem?.name}
                  onUpdate={onRefresh}
                  locations={locations}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
