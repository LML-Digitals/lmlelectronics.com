'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/common/top-dialog/TopDialog';
import { Button } from '@/components/ui/button';
import { Input } from '../../ui/input';
import { updateAnnouncement } from '@/components/dashboard/announcement/services/announcementCrud';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { Pencil, Edit } from 'lucide-react';
import { useToast } from '../../ui/use-toast';

interface EditAnnouncementProps {
  announcementId: number;
  content: string;
  buttonText: string | null;
  buttonLink: string | null;
  isActive: boolean;
  onUpdate: (announcement: any) => void;
}

const schema = z.object({
  content: z.string().min(1, 'Content is required'),
  buttonText: z.string().nullable(),
  buttonLink: z.string().nullable(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

function EditAnnouncement ({
  announcementId,
  content,
  buttonText,
  buttonLink,
  isActive,
  onUpdate,
}: EditAnnouncementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: content,
      buttonText: buttonText || '',
      buttonLink: buttonLink || '',
      isActive: isActive,
    },
  });

  useEffect(() => {
    methods.reset({
      content: content,
      buttonText: buttonText || '',
      buttonLink: buttonLink || '',
      isActive: isActive,
    });
  }, [content, buttonText, buttonLink, isActive, methods]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  async function onSubmit (formData: FormData) {
    try {
      setLoading(true);
      const updatedAnnouncements = await updateAnnouncement(announcementId, {
        content: formData.content,
        buttonText: formData.buttonText || null,
        buttonLink: formData.buttonLink || null,
        isActive: formData.isActive ?? false,
        createdAt: new Date(),
      });

      onUpdate(updatedAnnouncements);

      setLoading(false);
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Please try again.',
      });
      setLoading(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Edit Announcement</DialogTitle>
        </DialogHeader>

        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:gap-4 py-4">
            <FormField
              control={control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Content</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-sm sm:text-base" />
                  </FormControl>
                  {errors.content && <p className="text-xs sm:text-sm text-red-500">{errors.content.message}</p>}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="buttonText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Button Text (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} className="text-sm sm:text-base" />
                  </FormControl>
                  {errors.buttonText && <p className="text-xs sm:text-sm text-red-500">{errors.buttonText.message}</p>}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="buttonLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Button Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="e.g., /services"
                      className="text-sm sm:text-base"
                    />
                  </FormControl>
                  {errors.buttonLink && <p className="text-xs sm:text-sm text-red-500">{errors.buttonLink.message}</p>}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <FormLabel className="text-sm sm:text-base">Active</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading} className="min-h-[44px] text-sm sm:text-base">
                {loading ? 'Loading' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditAnnouncement;
