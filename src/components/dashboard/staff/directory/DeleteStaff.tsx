'use client';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/top-dialog/TopDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { deleteStaff } from '@/components/dashboard/staff/services/staffCrud';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const DeleteStaff = ({ id }: { id: string }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit () {
    try {
      setLoading(true);

      await deleteStaff(id);

      setLoading(false);
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: 'Try again',
      });
      setLoading(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-10 sm:w-10 min-h-[44px] min-w-[44px] hover:bg-red-50"
        >
          <Trash2 size={18} className="text-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Are you sure you want to delete this staff member?
          </DialogTitle>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            This action cannot be undone. The staff member will be permanently removed from the system.
          </p>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outline"
            className="min-h-[44px] w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading}
            variant="destructive"
            className="min-h-[44px] w-full sm:w-auto"
          >
            {loading ? (
              <>
                <div className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Deleting...
              </>
            ) : (
              'Delete Staff'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStaff;
