"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  createBlogCategory,
  updateBlogCategory,
  CategoryData,
} from "@/components/blog/services/blogCategoryCrud";
import { BlogCategory } from "@prisma/client";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (category: BlogCategory) => void; // Callback on successful creation/update
  initialData?: BlogCategory | null; // Provide initial data for editing
}

const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

export function CategoryFormDialog({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CategoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!initialData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
      });
    }
  }, [isOpen, initialData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      let result: BlogCategory;
      if (isEditMode && initialData?.id) {
        result = await updateBlogCategory(initialData.id, values);
        toast({ title: "Success", description: "Category updated successfully." });
      } else {
        result = await createBlogCategory(values);
        toast({ title: "Success", description: "Category created successfully." });
      }
      onSuccess(result); // Notify parent component
      onClose(); // Close the dialog
    } catch (error) {
      console.error("Failed to save category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save category.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEditMode ? "Edit Category" : "Create New Category"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Web Development" {...field} className="text-sm sm:text-base min-h-[44px]" />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe the category"
                      {...field}
                      value={field.value ?? ''} // Handle potential null value
                      className="text-sm sm:text-base min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] w-full sm:w-auto">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="min-h-[44px] w-full sm:w-auto">
                {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 