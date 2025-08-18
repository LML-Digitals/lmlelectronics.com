'use client';

import { FAQ } from '@prisma/client';
import { deleteFAQ, updateFAQ } from './Services/faqCrud';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface FAQListProps {
  faqs: FAQ[];
  onEdit: (faq: FAQ) => void;
  onUpdate: () => void;
}

export default function FAQList ({ faqs, onEdit, onUpdate }: FAQListProps) {
  const [deletingFaq, setDeletingFaq] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteFAQ(id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    } finally {
      setDeletingFaq(null);
    }
  };

  const handleTogglePublish = async (faq: FAQ) => {
    try {
      await updateFAQ(faq.id, { isPublished: !faq.isPublished });
      onUpdate();
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="space-y-2 flex-1">
                  <h3 className="font-medium text-sm sm:text-base">{faq.question}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{faq.answer}</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={faq.isPublished ? 'default' : 'secondary'} className="text-xs">
                      {faq.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{faq.category}</Badge>
                  </div>
                </div>
                <TooltipProvider>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(faq)}
                          className="min-h-[44px] min-w-[44px]"
                        >
                          {faq.isPublished ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {faq.isPublished ? 'Unpublish' : 'Publish'}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(faq)}
                          className="min-h-[44px] min-w-[44px]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingFaq(faq.id)}
                          className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!deletingFaq}
        onOpenChange={() => setDeletingFaq(null)}
      >
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md w-full mx-2 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete the FAQ
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="min-h-[44px] text-sm sm:text-base">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingFaq && handleDelete(deletingFaq)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px] text-sm sm:text-base"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
