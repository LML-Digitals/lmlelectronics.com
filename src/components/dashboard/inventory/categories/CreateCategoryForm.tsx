"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createCategory } from "./services/itemCategoryCrud";
import { CircleDashedIcon, ImageIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import type { UploadResponse } from "@/lib/types/upload";

type Inputs = {
  name: string;
  parentId?: string | null;
  subCategories: { name: string }[];
  visible: boolean;
  description: string;
  image?: FileList;
};

type CategoryWithChildren = {
  id: string;
  name: string;
  parentId: string | null;
  children: CategoryWithChildren[];
};

function CreateCategoryForm({
  categories,
  setDialogOpen,
}: {
  categories: CategoryWithChildren[];
  setDialogOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Inputs>({
    defaultValues: {
      visible: true, // Default to visible
      description: "",
    },
  });

  const isVisible = watch("visible");

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue("image", undefined);
    setImagePreview(null);
    setImageFile(null);
  };

  //Todo: Add sub category
  const { fields, append } = useFieldArray({
    control,
    name: "subCategories",
  });

  //Todo: Add sub category
  const handleAddSubCategory = () => {
    append({ name: "" });
  };

  //Todo: Handle submitting the form
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    startTransition(async () => {
      try {
        // Handle image upload using API endpoint
        let imageUrl = "";
        if (imageFile) {
          const fileName = `category-${Date.now()}-${imageFile.name.replace(
            /\s+/g,
            "-"
          )}`;

          const uploadResponse = await fetch(
            `/api/upload?filename=${fileName}`,
            {
              method: "POST",
              body: imageFile,
            }
          );

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image");
          }

          const newBlob = (await uploadResponse.json()) as UploadResponse;
          imageUrl = newBlob.url;
        }

        const res = await createCategory({
          name: data.name,
          parentId: data.parentId ? data.parentId.toString() : null,
          visible: data.visible,
          description: data.description,
          image: imageUrl,
        });

        if (res.status === "success") {
          toast({
            title: "Created: Category",
            description: `${res.category.name} has been created.`,
          });
          router.refresh();
          setDialogOpen(false);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create category.",
        });
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Category</DialogTitle>
      </DialogHeader>
      <div className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                placeholder="e.g., Electronics"
                {...register("name", { required: true })}
                className="mt-1.5"
              />
              {errors.name && (
                <span className="text-sm text-red-500 mt-1">
                  Category name is required
                </span>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Enter a description for this category"
                {...register("description")}
                className="mt-1.5"
                rows={3}
              />
            </div>

            <div>
              <Label>Parent Category</Label>
              <Select
                onValueChange={(value) =>
                  setValue("parentId", value === "none" ? null : value)
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500 mt-1.5">
                Optional: Select a parent category to create a hierarchy
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
                          src={imagePreview || "/placeholder.svg"}
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
                          {...register("image")}
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
                    ? "Category will be visible to users"
                    : "Category will be hidden from users"}
                </p>
              </div>
              <Switch
                id="visible"
                checked={isVisible}
                onCheckedChange={(checked) => setValue("visible", checked)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <CircleDashedIcon size={16} className="animate-spin mr-2" />
              ) : null}
              Save Category
            </Button>
          </DialogFooter>
        </form>
      </div>
    </>
  );
}

export default CreateCategoryForm;
