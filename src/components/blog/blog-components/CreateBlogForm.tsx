'use client';

import type React from 'react';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X, CircleDashedIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { type SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createBlog } from '@/components/blog/services/blogCrud';
import { Tag, BlogCategory, Blog } from '@prisma/client';
import { DataToBlog } from '@/components/blog/types/blogTypes';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
});

import 'easymde/dist/easymde.min.css';

const blogFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  link: z.string().url().optional().or(z.literal('')),
  tagIds: z.array(z.string()).optional(),
  image: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

type BlogFormData = z.infer<typeof blogFormSchema>;

interface CreateBlogFormProps {
  allTags: Tag[];
  allCategories: BlogCategory[];
  onSuccess: () => void;
}

export default function CreateBlogForm ({
  allTags,
  allCategories,
  onSuccess,
}: CreateBlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagQuery, setTagQuery] = useState('');

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: '',
      content: '',
      description: '',
      link: '',
      image: '',
      categoryId: '',
      tagIds: [],
      metaTitle: '',
      metaDesc: '',
      isPublished: false,
      isFeatured: false,
    },
  });

  const filteredTags = allTags.filter((tag) => tag.name.toLowerCase().includes(tagQuery.toLowerCase())
      && !selectedTags.find((selectedTag) => selectedTag.id === tag.id));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      form.setValue('image', 'temp-upload-placeholder');
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const response = await fetch(`/api/upload?filename=${file.name}`, {
      method: 'POST',
      body: file,
    });

    if (!response.ok) { throw new Error('Failed to upload file.'); }
    const newBlob = await response.json();

    return newBlob.url;
  };

  const handleImageUpload = (editor: any) => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async (e: any) => {
      const file = e.target.files[0];

      if (file) {
        try {
          const imageUrl = await uploadImage(file);
          const markdownImage = `![alt text](${imageUrl})`;

          const cm = editor.codemirror;
          const doc = cm.getDoc();
          const cursor = doc.getCursor();

          doc.replaceRange(markdownImage, cursor);
        } catch (error) {
          console.error('Error inserting image:', error);
        }
      }
    };

    fileInput.click();
  };

  const mdeOptions: any = {
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'code',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      {
        name: 'upload-image',
        action: (editor: any) => handleImageUpload(editor),
        className: 'fa fa-upload',
        title: 'Upload Image',
      },
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      'guide',
    ],
  };

  const handleSelectTag = (tagName: string) => {
    const tagToAdd = allTags.find((tag) => tag.name === tagName);

    if (tagToAdd && !selectedTags.find((st) => st.id === tagToAdd.id)) {
      const newSelectedTags = [...selectedTags, tagToAdd];

      setSelectedTags(newSelectedTags);
      form.setValue(
        'tagIds',
        newSelectedTags.map((t) => t.id),
      );
    }
    setTagQuery('');
  };

  const handleRemoveTag = (tagIdToRemove: string) => {
    const newSelectedTags = selectedTags.filter((tag) => tag.id !== tagIdToRemove);

    setSelectedTags(newSelectedTags);
    form.setValue(
      'tagIds',
      newSelectedTags.map((t) => t.id),
    );
  };

  const onSubmit: SubmitHandler<BlogFormData> = async (data) => {
    // Get the intended publish status from the form
    const shouldBePublished = data.isPublished;

    startTransition(async () => {
      try {
        let imageUrl = '';

        // 1. Handle Image Upload
        if (imageFile) {
          imageUrl = await uploadImage(imageFile);
        } else {
          // Require image for new posts
          toast({
            variant: 'destructive',
            title: 'Image Required',
            description: 'Please upload a cover image.',
          });

          return;
        }

        // 2. Prepare Blog Data Payload
        const blogPayload: DataToBlog = {
          title: data.title,
          content: data.content || '',
          description: data.description,
          categoryId: data.categoryId,
          link: data.link,
          tagIds: data.tagIds,
          image: imageUrl,
          metaTitle: data.metaTitle,
          metaDesc: data.metaDesc,
          isFeatured: data.isFeatured,
        };

        // 3. Create Blog Post
        const createPayload = {
          ...blogPayload,
          isPublished: shouldBePublished,
        };

        await createBlog(createPayload);

        // 4. Show appropriate toast based on publish status
        if (shouldBePublished) {
          toast({
            title: 'Blog Created and Published',
            description: 'Your blog post has been created and is live.',
          });
        } else {
          toast({
            title: 'Blog Created as Draft',
            description: 'Your blog post has been saved as a draft.',
          });
        }

        // 5. Redirect
        onSuccess();
        router.push('/dashboard/blogs');
        router.refresh(); // Ensure dashboard list is updated
      } catch (error) {
        console.error('Submission error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to create blog post',
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blog Title</FormLabel>
              <FormControl>
                <Input placeholder="Your Awesome Blog Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description / Excerpt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief summary of your blog post..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {allCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (Markdown)</FormLabel>
              <FormControl>
                <SimpleMDE
                  {...field}
                  options={mdeOptions}
                  placeholder="Write your blog post here..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="image-upload">Cover Image</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {preview && (
            <div className="mt-4 relative w-full h-64">
              <Image
                src={preview}
                alt="Image preview"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="tagIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Command className="relative border rounded-md">
                  <div className="flex flex-wrap items-center gap-2 p-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag.id)}
                          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          aria-label={`Remove ${tag.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <CommandInput
                      placeholder="Type to add tags..."
                      value={tagQuery}
                      onValueChange={setTagQuery}
                      className="flex-1 h-full min-w-[100px] p-0 border-0 focus:ring-0"
                    />
                  </div>
                  {tagQuery && filteredTags.length > 0 && (
                    <CommandList className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                      <CommandEmpty>
                        {filteredTags.length === 0 && tagQuery
                          ? 'No tags found.'
                          : 'Type to search...'}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredTags.map((tag) => (
                          <CommandItem
                            key={tag.id}
                            value={tag.name}
                            onSelect={() => handleSelectTag(tag.name)}
                            className="cursor-pointer"
                          >
                            {tag.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  )}
                </Command>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metaTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="SEO Title for the blog post" {...field} />
              </FormControl>
              <FormDescription>
                Recommended length: 50-60 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metaDesc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="SEO Description for the blog post"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Recommended length: 150-160 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish</FormLabel>
                <FormDescription>
                  Make this blog post visible to the public immediately upon
                  saving.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Feature</FormLabel>
                <FormDescription>
                  Feature this blog post on the homepage.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <CircleDashedIcon className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {form.getValues('isPublished') ? 'Create & Publish' : 'Create Draft'}
        </Button>
      </form>
    </Form>
  );
}
