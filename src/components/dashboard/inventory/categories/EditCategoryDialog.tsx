'use client';

import EditCategoryForm from './EditCategoryForm';
import { getCategories, getCategory } from './services/itemCategoryCrud';
import { Edit, Pencil } from 'lucide-react';
import { useTransition, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function EditCategoryDialog({ categoryId }: { categoryId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const handleOpen = async () => {
    if (!formData) {
      startTransition(async () => {
        try {
          const [category, allCategories] = await Promise.all([
            getCategory(categoryId),
            getCategories(),
          ]);

          if (!category) throw new Error('Category not found');
          setFormData({ category, allCategories });
          setOpen(true);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load category data',
          });
        }
      });
    } else {
      setOpen(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="hover:opacity-80">
          <Edit
            size={18}
            className={`text-blue-500 cursor-pointer ${
              isPending ? 'animate-pulse' : ''
            }`}
            onClick={handleOpen}
          />
        </button>
      </DialogTrigger>
      {formData && (
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <EditCategoryForm
            category={formData.category}
            allCategories={formData.allCategories}
            setDialogOpen={setOpen}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}
