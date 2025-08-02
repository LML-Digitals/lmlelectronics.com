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
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { InventoryItemWithRelations } from "./types/ItemType";
import { deleteInventoryItem } from "./services/itemsCrud";

type BulkDeleteDialogProps = {
  items: InventoryItemWithRelations[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

export function BulkDeleteDialog({
  items,
  open,
  onOpenChange,
  onDeleted,
}: BulkDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Create an array of promises for each item's delete operation
      const deletePromises = items.map(
        async (item) => await deleteInventoryItem(item.id)
      );

      // Wait for all delete operations to complete
      await Promise.all(deletePromises);

      toast({
        title: "Items deleted",
        description: `Successfully deleted ${items.length} items`,
      });

      onDeleted();
    } catch (error) {
      console.error("Error deleting items:", error);
      toast({
        title: "Failed to delete items",
        description: "There was an error deleting the items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete {items.length} Items
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {items.length} items? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will permanently delete these items and all associated
            variations, stock levels, and other data.
          </AlertDescription>
        </Alert>

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
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>Delete Items</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
