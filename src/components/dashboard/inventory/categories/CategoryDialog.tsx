'use client';

import React, { useState } from 'react';
import CategoryTable from '@/components/dashboard/inventory/categories/CategoryTable';
import { fetchCategories } from '@/components/dashboard/inventory/categories/utils/fetchCategories';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CategoryWithChildren } from './CategoryTable';

interface CategoryDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function CategoryDialog ({ trigger, open, onOpenChange }: CategoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryWithChildren[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Use controlled or uncontrolled state for dialog
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const loadCategories = async () => {
    if (!dialogOpen) { return; }

    setLoading(true);
    try {
      const result = await fetchCategories();

      setCategories(result.categories);
      setError(result.error);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Load categories when dialog opens
  React.useEffect(() => {
    if (dialogOpen) {
      loadCategories();
    }
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">View Categories</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Item Categories</DialogTitle>
        </DialogHeader>
        <div>
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="text-center py-10">Loading categories...</div>
            ) : error ? (
              <p className="text-red-500 text-center py-10">{error}</p>
            ) : categories ? (
              <CategoryTable categories={categories} />
            ) : (
              <p className="text-center py-10">No item categories found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryDialog;
