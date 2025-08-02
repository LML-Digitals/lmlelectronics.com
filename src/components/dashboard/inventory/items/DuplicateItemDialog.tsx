"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { InventoryItemWithRelations } from "./types/ItemType";
import { CircleDashed } from "lucide-react";
import { createInventoryItem } from "./services/itemsCrud";

// Schema for the duplicate form - just focusing on the name for simplicity
const duplicateSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

interface DuplicateItemDialogProps {
  item: InventoryItemWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicated: () => void;
}

export function DuplicateItemDialog({
  item,
  open,
  onOpenChange,
  onDuplicated,
}: DuplicateItemDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with modified name to indicate it's a copy
  const form = useForm<z.infer<typeof duplicateSchema>>({
    resolver: zodResolver(duplicateSchema),
    defaultValues: {
      name: `${item.name} (Copy)`,
    },
  });

  const handleDuplicate = async (values: z.infer<typeof duplicateSchema>) => {
    setIsLoading(true);
    try {
      // Prepare the new item data based on the original item
      const newItemData = {
        name: values.name,
        description: item.description ? item.description : undefined,
        image: item.image || null,
        categoryIds: item.categories.map((c) => c.id),
        supplierId: item.supplierId,
        tagIds: item.tags.map((t) => t.id),

        // Duplicate all variations with their stock levels
        variations: item.variations.map((variation) => ({
          name: variation.name,
          sku: `${variation.sku || ""}-copy`, // Modify SKU to avoid duplicates
          image: variation.image,
          stockLevels: variation.stockLevels.map((level) => ({
            locationId: level.locationId,
            stock: level.stock || 0,
            purchaseCost: level.purchaseCost ?? undefined,
          })),
        })),
      };

      // Create the new item
      await createInventoryItem(newItemData);

      toast({
        title: "Success",
        description: `Duplicate item "${values.name}" created successfully`,
      });

      onOpenChange(false);
      onDuplicated();
    } catch (error) {
      console.error("Error duplicating item:", error);
      toast({
        variant: "destructive",
        title: "Duplication failed",
        description:
          "There was an error duplicating the item. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicate Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleDuplicate)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Create a copy of "{item.name}" with all its variations and
                details. You can customize the new item's name below.
              </p>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name for the duplicate item</FormLabel>
                    <FormControl>
                      <Input {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                <p>This will duplicate:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Item details and information</li>
                  <li>All {item.variations.length} variations</li>
                  <li>Stock levels across all locations</li>
                  <li>Category assignments and tags</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <CircleDashed className="h-4 w-4 mr-1 animate-spin" />
                )}
                Duplicate Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
