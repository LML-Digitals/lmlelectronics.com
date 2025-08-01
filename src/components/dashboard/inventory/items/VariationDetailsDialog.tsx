"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Eye, Pencil, Package, Tag } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { BarcodeGenerator } from "./BarcodeGenerator";
import { updateVariationBarcode } from "./services/barcodeService";
import { cn } from "@/lib/utils";
import { EditVariationDialog } from "./EditVariationDialog";

interface VariationDetailsDialogProps {
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
    profit?: number;
    totalCost?: number;
    sellingPrice?: number;
    visible?: boolean;
    useDefaultRates?: boolean;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    stockLevels: {
      id?: string;
      locationId?: number;
      stock: number;
      purchaseCost?: number;
      location?: {
        id: number;
        name: string;
      };
    }[];
  };
  parentItemName?: string;
  onUpdate?: () => void;
  trigger?: React.ReactNode;
  locations: {
    id: number;
    name: string;
  }[];
}

export function VariationDetailsDialog({
  variation,
  parentItemName,
  onUpdate,
  trigger,
  locations = [],
}: VariationDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  const totalStock = variation.stockLevels.reduce(
    (sum: number, level: { stock: number }) => sum + level.stock,
    0
  );

  const handleGenerateBarcode = async (newBarcode: string) => {
    try {
      toast({
        title: "Barcode Generated",
        description: "The barcode has been generated successfully.",
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate barcode.",
      });
    }
  };

  const handleUpdateBarcode = async (variationId: string, barcode: string) => {
    try {
      const updatedBarcode = await updateVariationBarcode(variationId, barcode);

      toast({
        title: "Barcode Updated",
        description: "The barcode has been saved to the database.",
      });

      return updatedBarcode;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update barcode.",
      });
      return barcode;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-semibold text-xl">Variation Details</span>
            {parentItemName && (
              <Badge variant="outline" className="ml-2">
                {parentItemName}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-6 py-4">
          <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border">
            {variation.image ? (
              <Image
                src={variation.image}
                className="object-cover"
                alt={variation.name}
                fill
                sizes="128px"
              />
            ) : (
              <Package className="h-12 w-12 text-slate-300" />
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">{variation.name}</h2>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <Label className="text-xs text-muted-foreground">SKU</Label>
                <p className="font-mono text-sm">{variation.sku}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Stock</Label>
                <p className="font-medium">{totalStock} units</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Price</Label>
                <p className="font-medium">
                  ${variation.sellingPrice?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Badge
                  variant={variation.visible ? "default" : "secondary"}
                  className="mt-1"
                >
                  {variation.visible ? "Visible" : "Hidden"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="barcode">Barcode</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium">Pricing Information</h3>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Raw Cost
                    </Label>
                    <p className="font-medium">
                      ${variation.raw?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Tax Rate
                    </Label>
                    <p className="font-medium">
                      {variation.tax?.toFixed(2) || "0.00"}%
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Shipping Cost
                    </Label>
                    <p className="font-medium">
                      ${variation.shipping?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Markup %
                    </Label>
                    <p className="font-medium">
                      {(variation.markup || 0) * 100}%
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Profit
                    </Label>
                    <p className="font-medium text-green-600">
                      ${variation.profit?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Total Cost
                    </Label>
                    <p className="font-medium">
                      ${variation.totalCost?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Selling Price
                    </Label>
                    <p className="font-medium">
                      ${variation.sellingPrice?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Use Default Rates
                    </Label>
                    <p className="font-medium">
                      {variation.useDefaultRates ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {/* Shipping Dimensions and Weight Section */}
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Shipping Dimensions and Weight
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Weight
                      </Label>
                      <p className="font-medium">
                        {variation.weight?.toFixed(2) || "0.00"} lbs
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Dimensions (L×W×H)
                      </Label>
                      <p className="font-medium">
                        {variation.length?.toFixed(2) || "0.00"} ×{" "}
                        {variation.width?.toFixed(2) || "0.00"} ×{" "}
                        {variation.height?.toFixed(2) || "0.00"} in
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => setActiveTab("barcode")}
              >
                Manage Barcode
              </Button>
              <EditVariationDialog
                variation={{
                  id: variation.id,
                  name: variation.name,
                  sku: variation.sku,
                  barcode: variation.barcode,
                  image: variation.image,
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
                  stockLevels: variation.stockLevels.map((level) => ({
                    locationId: level.locationId || level.location?.id || 0,
                    stock: level.stock,
                    purchaseCost: level.purchaseCost,
                    location: level.location,
                  })),
                }}
                parentItemName={parentItemName}
                onUpdate={onUpdate}
                locations={locations}
              />
            </div>
          </TabsContent>

          <TabsContent value="barcode" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <BarcodeGenerator
                  barcode={variation.barcode}
                  variationId={variation.id}
                  variationName={variation.name}
                  price={variation.sellingPrice}
                  onGenerateBarcode={handleGenerateBarcode}
                  onUpdateBarcode={handleUpdateBarcode}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {variation.stockLevels.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No stock information available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variation.stockLevels.map((level: any) => (
                      <div
                        key={level.locationId || level.location?.id}
                        className="flex justify-between items-center p-3 border rounded-md"
                      >
                        <span className="font-medium">
                          {level.location?.name || "Unknown Location"}
                        </span>
                        <div className="flex items-center gap-6">
                          <span
                            className={cn(
                              "text-sm font-medium flex items-center",
                              level.stock <= 0
                                ? "text-destructive"
                                : level.stock < 5
                                ? "text-amber-500"
                                : "text-emerald-600"
                            )}
                          >
                            {level.stock} units
                          </span>
                          {level.purchaseCost && (
                            <span className="text-sm text-slate-500">
                              ${level.purchaseCost.toFixed(2)} per unit
                            </span>
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
  );
}
