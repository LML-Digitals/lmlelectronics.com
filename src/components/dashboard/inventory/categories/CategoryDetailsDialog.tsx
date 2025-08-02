'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInventoryItems } from '@/components/dashboard/inventory/items/services/itemsCrud';
import { CategoryWithChildren } from './CategoryTable';
import { InventoryItemWithRelations } from '@/components/dashboard/inventory/items/types/ItemType';
import { InventoryItem } from '@prisma/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Box } from 'lucide-react';
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  addItemToCategory,
  removeItemFromCategory,
} from '@/components/dashboard/inventory/categories/services/itemCategoryCrud';
import { useRouter } from 'next/navigation';

interface CategoryDetailsDialogProps {
  category: CategoryWithChildren;
  onItemAdded: () => void;
  children: React.ReactNode;
  categories?: CategoryWithChildren[]; // All categories for finding parent name
}

export function CategoryDetailsDialog({
  category,
  onItemAdded,
  children,
  categories = [],
}: CategoryDetailsDialogProps) {
  const [items, setItems] = useState<InventoryItemWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [addingItem, setAddingItem] = useState(false);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Fetch items when dialog opens
  useEffect(() => {
    if (open) {
      fetchItems();
    }
  }, [open]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const allItems = await getInventoryItems();
      setItems(allItems);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load inventory items',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Updated function to add an item to a category using server action
  const handleAddItem = async () => {
    if (!selectedItemId) return;

    setAddingItem(true);
    try {
      // Use server action instead of API call
      const result = await addItemToCategory(selectedItemId, category.id);

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });

        // Refresh the data
        router.refresh();
        // setOpen(false);
        onItemAdded();
        setSelectedItemId('');

        // Refetch items to update the available items list
        fetchItems();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to add item to category',
        variant: 'destructive',
      });
    } finally {
      setAddingItem(false);
    }
  };

  // Function to remove an item from a category using server action
  const handleRemoveItem = async (itemId: string) => {
    try {
      // Use server action instead of API call
      const result = await removeItemFromCategory(itemId, category.id);

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });

        // Refresh the data
        router.refresh();
        // setOpen(false);
        onItemAdded();

        // Refetch items to update the available items list
        fetchItems();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to remove item from category',
        variant: 'destructive',
      });
    }
  };

  // Get items that are not in this category yet
  const availableItems = items.filter(
    (item) => !category.items.some((catItem) => catItem.id === item.id)
  );

  // Find parent category name if exists
  const getParentCategoryName = () => {
    if (!category.parentId) return null;

    const parentCategory = categories.find(
      (cat) => cat.id === category.parentId
    );
    return parentCategory?.name || `Unknown (ID: ${category.parentId})`;
  };

  const parentName = getParentCategoryName();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Category Details: {category.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="items" className="mt-4">
          <TabsList>
            <TabsTrigger value="items">
              Items ({category.items.length})
            </TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <Select
                  value={selectedItemId}
                  onValueChange={setSelectedItemId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading items...</span>
                      </div>
                    ) : availableItems.length > 0 ? (
                      availableItems.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No available items
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddItem}
                disabled={!selectedItemId || addingItem}
              >
                {addingItem ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Item'
                )}
              </Button>
            </div>

            {category.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {category.items.map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Box className="h-5 w-5 text-slate-500" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-slate-500">
                            ID: {item.id}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-slate-500">
                This category has no items
              </div>
            )}
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Overview of this category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Category ID
                        </h3>
                        <p className="mt-1 text-base">{category.id}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Name
                        </h3>
                        <p className="mt-1 text-base font-medium">
                          {category.name}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Type
                        </h3>
                        <div className="mt-1">
                          {category.parentId === null ? (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 hover:bg-amber-50"
                            >
                              Root Category
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                            >
                              Sub Category
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Parent Category
                        </h3>
                        {category.parentId ? (
                          <div className="mt-1">
                            <p className="text-base font-medium">
                              {parentName}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {category.parentId}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-1 text-sm italic">
                            None (This is a root category)
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Contents
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-50 text-green-700"
                          >
                            {category.children.length} Sub-categories
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700"
                          >
                            {category.items.length} Items
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {category.children.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sub-Categories</CardTitle>
                    <CardDescription>
                      Categories that belong to {category.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {category.children.map((child) => (
                        <Card key={child.id} className="bg-slate-50">
                          <CardContent className="p-4">
                            <div className="font-medium">{child.name}</div>
                            <div className="text-sm text-slate-500 mt-1">
                              {child.items.length} items •{' '}
                              {child.children.length} sub-categories
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
