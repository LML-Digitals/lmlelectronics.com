'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/top-dialog/TopDialog';
import { Button } from '@/components/ui/button';
import { deleteAnnouncement } from '@/components/dashboard/announcement/services/announcementCrud';
import { useRouter } from 'next/navigation';
import { useToast } from '../../ui/use-toast';
import { Trash } from 'lucide-react';

const DeleteAnnouncement = ({ announcementId }: { announcementId: number }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit() {
    try {
      setLoading(true);
      await deleteAnnouncement(announcementId);

      setLoading(false);
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: 'Try again.',
      });
      setLoading(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="min-h-[44px] min-w-[44px]">
          <Trash className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Are you sure you want to delete this announcement?
          </DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={loading} variant="destructive" className="min-h-[44px] text-sm sm:text-base">
            {loading ? 'Loading' : 'Delete'}
          </Button>
          <Button onClick={() => setDialogOpen(false)} variant="secondary" className="min-h-[44px] text-sm sm:text-base">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAnnouncement;
