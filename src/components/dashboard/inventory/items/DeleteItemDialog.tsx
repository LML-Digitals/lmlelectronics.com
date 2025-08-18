'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { InventoryItemWithRelations } from './types/ItemType';
import { AlertTriangle, CircleDashed } from 'lucide-react';
import { deleteInventoryItem } from './services/itemsCrud';

interface DeleteItemDialogProps {
  item: InventoryItemWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteItemDialog ({
  item,
  open,
  onOpenChange,
  onDeleted,
}: DeleteItemDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteInventoryItem(item.id);

      toast({
        title: 'Item deleted',
        description: `${item.name} has been successfully deleted.`,
      });
      onDeleted();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'There was an error deleting the item. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Item
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-medium">You are about to delete:</p>
          <p className="text-lg font-semibold mt-1">{item.name}</p>

          <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
            <p>This will permanently delete:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Item details and information</li>
              <li>All {item.variations.length} variations of this item</li>
              <li>Stock levels across all locations</li>
              <li>Associated images and records</li>
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
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <CircleDashed className="animate-spin w-4 h-4 mr-1" />}
            Delete Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
