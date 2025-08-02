'use client';

import CreateCategoryForm from './CreateCategoryForm';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CategoryWithChildren } from './CategoryTable';
import { useState } from 'react';

export function AddCategoryDialog({ categories }: { categories: CategoryWithChildren[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <CreateCategoryForm categories={categories} setDialogOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
