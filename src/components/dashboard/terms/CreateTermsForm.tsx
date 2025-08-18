'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createTerm } from '@/components/terms/services/termsCrud';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});

import 'easymde/dist/easymde.min.css';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  major: z.number().min(0, 'Major version must be 0 or greater'),
  minor: z.number().min(0, 'Minor version must be 0 or greater'),
  patch: z.number().min(0, 'Patch version must be 0 or greater'),
  effectiveAt: z.string().min(1, 'Effective date is required'),
});

export function CreateTermsForm () {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      major: 0,
      minor: 0,
      patch: 0,
      effectiveAt: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const version = `${values.major}.${values.minor}.${values.patch}`;

      await createTerm({
        title: values.title,
        content: values.content,
        version,
        effectiveAt: new Date(values.effectiveAt),
      });
      toast({
        title: 'Success',
        description: 'Term created successfully!',
      });
      router.push('/dashboard/terms');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create term.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Title</FormLabel>
              <FormControl>
                <Input {...field} className="text-sm sm:text-base min-h-[44px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Content</FormLabel>
              <FormControl>
                <Controller
                  name="content"
                  control={form.control}
                  render={({ field }) => (
                    <SimpleMDE
                      {...field}
                      onChange={field.onChange}
                      value={field.value}
                      className="text-sm sm:text-base"
                    />
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="major" // Use "major" as the name prop
          render={() => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Version</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    {...form.register('major', {
                      valueAsNumber: true,
                    })}
                    onChange={(e) => form.setValue('major', parseInt(e.target.value, 10))
                    }
                    className="w-16 sm:w-20 min-h-[44px] text-sm sm:text-base"
                  />
                  <span className="text-gray-500 text-sm sm:text-base">.</span>
                  <Input
                    type="number"
                    min={0}
                    {...form.register('minor', {
                      valueAsNumber: true,
                    })}
                    onChange={(e) => form.setValue('minor', parseInt(e.target.value, 10))
                    }
                    className="w-16 sm:w-20 min-h-[44px] text-sm sm:text-base"
                  />
                  <span className="text-gray-500 text-sm sm:text-base">.</span>
                  <Input
                    type="number"
                    min={0}
                    {...form.register('patch', {
                      valueAsNumber: true,
                    })}
                    onChange={(e) => form.setValue('patch', parseInt(e.target.value, 10))
                    }
                    className="w-16 sm:w-20 min-h-[44px] text-sm sm:text-base"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="effectiveAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Effective Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} className="text-sm sm:text-base min-h-[44px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="min-h-[44px] text-sm sm:text-base">Create Term</Button>
      </form>
    </Form>
  );
}
