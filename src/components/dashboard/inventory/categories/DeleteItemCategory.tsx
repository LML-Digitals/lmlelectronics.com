'use client';
import { useState, useTransition } from 'react';
import { deleteItemCategory } from '@/components/dashboard/inventory/categories/services/itemCategoryCrud';
import { CircleDashedIcon, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../common/top-dialog/TopDialog';
import { Button } from '../../../ui/button';
import { useToast } from '../../../ui/use-toast';

type DeleteCategoryProps = {
  itemCategoryId: string;
};

const DeleteItemCategory = ({ itemCategoryId }: DeleteCategoryProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const deleteCategory = async () => {
    startTransition(async () => {
      try {
        const res = await deleteItemCategory(itemCategoryId);

        if (res.status === 'success') {
          toast({
            title: 'Category',
            description: res.message,
          });
          router.refresh();
        }
      } catch (error) {
        toast({
          title: 'Category',
          description: 'Failed to Delete category',
        });
      }
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Trash2 size={18} className="text-red-500 cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This action cannot be undone. This will permanently delete the
          <strong> Category</strong> and remove all it's{' '}
          <strong> Subcategories</strong> data from <strong>LML</strong>{' '}
          servers.
        </DialogDescription>
        <DialogFooter>
          <Button onClick={() => deleteCategory()} variant="destructive">
            {isPending ? (
              <CircleDashedIcon size={18} className="animate-spin" />
            ) : (
              'Continuee'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteItemCategory;
