"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { InventoryItemWithRelations } from "./types/ItemType";
import { createInventoryItem } from "./services/itemsCrud";

type BulkDuplicateDialogProps = {
  items: InventoryItemWithRelations[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicated: () => void;
};

export function BulkDuplicateDialog({
  items,
  open,
  onOpenChange,
  onDuplicated,
}: BulkDuplicateDialogProps) {
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      // Create an array of promises for each item's duplicate operation
      const duplicatePromises = items.map(async (item) => {
        const newItemData = {
          name: `${item.name} (Copy)`,
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
      });

      // Wait for all duplicate operations to complete
      await Promise.all(duplicatePromises);

      toast({
        title: "Items duplicated",
        description: `Successfully duplicated ${items.length} items`,
      });
      onDuplicated();
    } catch (error) {
      console.error("Error duplicating items:", error);
      toast({
        title: "Failed to duplicate items",
        description:
          "There was an error duplicating the items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicate {items.length} Items
          </DialogTitle>
          <DialogDescription>
            This will create copies of {items.length} items with "(Copy)" added
            to their names.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id} className="text-sm">
                • {item.name}
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDuplicating}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleDuplicate}
            disabled={isDuplicating}
          >
            {isDuplicating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Duplicating...
              </>
            ) : (
              <>Duplicate Items</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
