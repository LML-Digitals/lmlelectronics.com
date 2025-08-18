'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateCategory } from './services/itemCategoryCrud';
import type { InventoryItemCategory } from '@prisma/client';
import { CircleDashedIcon, ImageIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '../../../ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

type EditCategoryProps = {
  category: InventoryItemCategory;
  allCategories: InventoryItemCategory[];
  setDialogOpen: (open: boolean) => void;
};

export default function EditCategoryForm ({
  category,
  allCategories,
  setDialogOpen,
}: EditCategoryProps) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(category.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{
    name: string;
    parentId?: string | null;
    visible: boolean;
    description: string;
    image?: FileList;
  }>({
    defaultValues: {
      name: category.name,
      parentId: category.parentId,
      visible: category.visible ?? true, // Default to true if not set
      description: category.description || '',
    },
  });

  const isVisible = watch('visible');

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];

      setImageFile(file);
      setImageChanged(true);
      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue('image', undefined);
    setImagePreview(null);
    setImageFile(null);
    setImageChanged(true); // Mark as changed to remove the existing image
  };

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Update the onSubmit function to use the API endpoint
  const onSubmit = async (data: {
    name: string;
    parentId?: string | null;
    visible: boolean;
    description: string;
    image?: FileList;
  }) => {
    startTransition(async () => {
      try {
        // Handle image upload if changed
        let imageUrl = category.image || '';

        if (imageChanged) {
          if (imageFile) {
            // Upload new image using API endpoint
            const fileName = `category-${Date.now()}-${imageFile.name.replace(
              /\s+/g,
              '-',
            )}`;

            const uploadResponse = await fetch(
              `/api/upload?filename=${fileName}`,
              {
                method: 'POST',
                body: imageFile,
              },
            );

            if (!uploadResponse.ok) {
              throw new Error('Failed to upload image');
            }

            const uploadResult = await uploadResponse.json();

            imageUrl = uploadResult.url;
          } else {
            // If image was removed (imageChanged but no imageFile)
            imageUrl = '';
          }
        }

        const res = await updateCategory(category.id, {
          name: data.name,
          parentId: data.parentId,
          visible: data.visible,
          description: data.description,
          image: imageUrl,
        });

        if (res.status === 'success') {
          toast({
            title: 'Success',
            description: 'Category updated successfully',
          });
          router.refresh();
          setDialogOpen(false);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update category',
        });
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Category</DialogTitle>
      </DialogHeader>
      <div className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                {...register('name', { required: true })}
                className="mt-1.5"
              />
              {errors?.name && (
                <span className="text-sm text-red-500 mt-1">
                  Category name is required
                </span>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                {...register('description')}
                className="mt-1.5"
                rows={3}
                placeholder="Enter a description for this category"
              />
            </div>

            <div>
              <Label>Parent Category</Label>
              <Select
                defaultValue={category.parentId?.toString() || 'none'}
                onValueChange={(value) => setValue('parentId', value === 'none' ? null : value)
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {allCategories
                    .filter((cat) => cat.id !== category.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500 mt-1.5">
                Select a new parent category or remove it to make it a top-level
                category
              </p>
            </div>

            <div>
              <Label>Category Image</Label>
              <div className="mt-1.5 space-y-2">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {imagePreview ? (
                      <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                        <Image
                          src={imagePreview || '/placeholder.svg'}
                          alt="Category preview"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-0 right-0 h-6 w-6 rounded-full"
                          onClick={removeImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed rounded-md border-slate-300 cursor-pointer hover:border-slate-400">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                        <span className="text-xs text-slate-500 mt-1">
                          Add Image
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          {...register('image')}
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </label>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    <p>Upload a category image (recommended size: 300x300px)</p>
                    <p>Supported formats: JPG, PNG, WebP</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="visible">Visibility</Label>
                <p className="text-sm text-slate-500">
                  {isVisible
                    ? 'Category will be visible to users'
                    : 'Category will be hidden from users'}
                </p>
              </div>
              <Switch
                id="visible"
                checked={isVisible}
                onCheckedChange={(checked) => setValue('visible', checked)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <CircleDashedIcon size={16} className="animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </div>
    </>
  );
}
