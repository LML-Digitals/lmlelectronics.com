'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  createSupplier,
  updateSupplier,
  // SupplierFormData,
} from './services/supplierCrud';
import { Vendor } from '@prisma/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  // contactName: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  leadTime: z.number().nonnegative().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  website: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  supplier?: Vendor;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SupplierForm ({
  supplier,
  onSuccess,
  onCancel,
}: SupplierFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!supplier;

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier
      ? {
        ...supplier,
        leadTime: supplier.leadTime ?? 0,
        rating: supplier.rating ?? 0,
      }
      : {
        name: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        website: '',
        notes: '',
        leadTime: 0,
        rating: 0,
      },
  });

  async function onSubmit (data: SupplierFormData) {
    setIsSubmitting(true);
    try {
      // const updatedData = {
      //   ...data,
      //   leadTime: parseInt(data.leadTime ?? "0"),
      //   rating: parseInt(data.rating ?? "0"),
      // };

      if (isEditing && supplier) {
        const result = await updateSupplier(supplier.id, data);

        if (result.success) {
          toast({
            title: 'Success',
            description: 'Supplier updated successfully',
            variant: 'default',
          });
          if (onSuccess) { onSuccess(); }
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to update supplier',
            variant: 'destructive',
          });
        }
      } else {
        const result = await createSupplier(data);

        if (result.success) {
          toast({
            title: 'Success',
            description: 'Supplier created successfully',
            variant: 'default',
          });
          form.reset();
          if (onSuccess) { onSuccess(); }
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to create supplier',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error submitting supplier form:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier Name*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter supplier name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="">
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="Enter contact email"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="Enter contact phone number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="https://example.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="leadTime"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Lead Time in Days</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || 0}
                    onChange={(e) => onChange(e.target.valueAsNumber || 0)}
                    placeholder="Enter Lead Time"
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Ratings</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || 0}
                    onChange={(e) => onChange(e.target.valueAsNumber || 0)}
                    placeholder="Rate the supplier 1-5"
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="Enter supplier address"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  placeholder="Additional notes about this supplier"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : isEditing
                ? 'Update Supplier'
                : 'Create Supplier'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
