"use client";

import type React from "react";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X, CircleDashedIcon, Upload, ImageIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateBlog } from "@/components/blog/services/blogCrud";
import { Tag, BlogCategory, Blog } from "@prisma/client";
import { DataToBlog } from "@/components/blog/types/blogTypes";
import { BlogWithDetailsType } from "@/components/blog/types/blogTypes";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

import "easymde/dist/easymde.min.css";

const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  link: z.string().url().optional().or(z.literal("")),
  tagIds: z.array(z.string()).optional(),
  image: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

type BlogFormData = z.infer<typeof blogFormSchema>;

interface EditBlogFormProps {
  initialData: BlogWithDetailsType;
  allTags: Tag[];
  allCategories: BlogCategory[];
  onSuccess: () => void;
}

export default function EditBlogForm({
  initialData,
  allTags,
  allCategories,
  onSuccess,
}: EditBlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(
    initialData?.image || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    initialData?.tags || []
  );
  const [tagQuery, setTagQuery] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      description: initialData?.description || "",
      link: initialData?.link || "",
      image: initialData?.image || "",
      categoryId: initialData?.categoryId || "",
      tagIds: initialData?.tags?.map((t) => t.id) || [],
      metaTitle: initialData?.metaTitle || "",
      metaDesc: initialData?.metaDesc || "",
      isPublished: initialData?.isPublished || false,
      isFeatured: initialData?.isFeatured || false,
    },
    // mode: "onSubmit",
  });

  // Add form state debugging
  // useEffect(() => {
  //   const subscription = form.watch((value) => {
  //     console.log("Form values changed:", value);
  //   });
  //   return () => subscription.unsubscribe();
  // }, [form]);

  // // Add form error debugging
  // useEffect(() => {
  //   console.log("Form errors:", form.formState.errors);
  // }, [form.formState.errors]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        content: initialData.content || "",
        description: initialData.description || "",
        link: initialData.link || "",
        image: initialData.image || "",
        categoryId: initialData.categoryId || "",
        tagIds: initialData.tags?.map((t) => t.id) || [],
        metaTitle: initialData.metaTitle || "",
        metaDesc: initialData.metaDesc || "",
        isPublished: initialData.isPublished || false,
        isFeatured: initialData.isFeatured || false,
      });
      setSelectedTags(initialData.tags || []);
      if (initialData.image) setPreview(initialData.image);
    }
  }, [initialData, form.reset]);

  const filteredTags = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagQuery.toLowerCase()) &&
      !selectedTags.find((selectedTag) => selectedTag.id === tag.id)
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      form.setValue("image", "temp-upload-placeholder");
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const response = await fetch(`/api/upload?filename=${file.name}`, {
      method: "POST",
      body: file,
    });

    if (!response.ok) throw new Error("Failed to upload file.");
    const newBlob = await response.json();
    return newBlob.url;
  };

  const handleImageUpload = (editor: any) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

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
          console.error("Error inserting image:", error);
        }
      }
    };

    fileInput.click();
  };

  const mdeOptions: any = {
    toolbar: [
      "bold",
      "italic",
      "heading",
      "|",
      "code",
      "quote",
      "unordered-list",
      "ordered-list",
      "|",
      "link",
      "image",
      {
        name: "upload-image",
        action: (editor: any) => handleImageUpload(editor),
        className: "fa fa-upload",
        title: "Upload Image",
      },
      "|",
      "preview",
      "side-by-side",
      "fullscreen",
      "|",
      "guide",
    ],
    spellChecker: false,
    autosave: {
      enabled: true,
      uniqueId: `blog-edit-${initialData?.id}`,
      delay: 1000,
    },
  };

  const handleSelectTag = (tagName: string) => {
    const tagToAdd = allTags.find((tag) => tag.name === tagName);
    if (tagToAdd && !selectedTags.find((st) => st.id === tagToAdd.id)) {
      const newSelectedTags = [...selectedTags, tagToAdd];
      setSelectedTags(newSelectedTags);
      form.setValue(
        "tagIds",
        newSelectedTags.map((t) => t.id)
      );
    }
    setTagQuery("");
  };

  const handleRemoveTag = (tagIdToRemove: string) => {
    const newSelectedTags = selectedTags.filter(
      (tag) => tag.id !== tagIdToRemove
    );
    setSelectedTags(newSelectedTags);
    form.setValue(
      "tagIds",
      newSelectedTags.map((t) => t.id)
    );
  };

  const onSubmit: SubmitHandler<BlogFormData> = async (data) => {
    // Get the intended publish status from the form
    const shouldBePublished = data.isPublished;

    startTransition(async () => {
      try {
        // For debugging
        // console.log("Form data being submitted:", {
        //   ...data,
        //   contentLength: data.content?.length || 0,
        //   contentPreview: data.content?.substring(0, 50),
        // });

        let imageUrl = initialData?.image || "";

        // 1. Handle Image Upload
        if (imageFile) {
          try {
            setImageLoading(true);
            imageUrl = await uploadImage(imageFile);
            // console.log("Uploaded new image:", imageUrl);
          } catch (error) {
            // console.error("Error uploading image:", error);
            toast({
              variant: "destructive",
              title: "Image Upload Failed",
              description:
                "Failed to upload the new cover image. Please try again.",
            });
            setImageLoading(false);
            return;
          } finally {
            setImageLoading(false);
          }
        }

        // 2. Prepare Blog Data Payload
        const blogPayload: DataToBlog = {
          title: data.title,
          content: data.content || "",
          description: data.description,
          categoryId: data.categoryId,
          link: data.link || null,
          tagIds: data.tagIds || [],
          image: imageUrl,
          metaTitle: data.metaTitle || "",
          metaDesc: data.metaDesc || "",
          isFeatured: data.isFeatured,
        };

        // 3. Update Blog Post
        const updatePayload = {
          ...blogPayload,
          isPublished: shouldBePublished,
        };

        // console.log("Updating blog with payload:", updatePayload);
        const result = await updateBlog(initialData.id, updatePayload);
        // console.log("Update result:", result);

        // Ensure blogId is a number
        // const blogId = Number(initialData.id);
        // if (isNaN(blogId)) {
        //   throw new Error("Invalid blog ID");
        // }

        // const result = await updateBlog(blogId, updatePayload);

        // if (!result) {
        //   throw new Error("Failed to update blog - no result returned");
        // }

        // 4. Show appropriate toast based on publish status
        if (shouldBePublished) {
          toast({
            title: "Blog Updated and Published",
            description: "Your blog post has been updated and is live.",
          });
        } else {
          toast({
            title: "Blog Updated as Draft",
            description: "Your blog post has been saved as a draft.",
          });
        }

        // 5. Redirect
        onSuccess();
        router.refresh(); // Ensure dashboard list is updated
      } catch (error) {
        // console.error("Submission error:", error);
        toast({
          variant: "destructive",
          title: "Error Updating Blog",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while updating the blog post. Please try again.",
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
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    // For debugging
                    // console.log("Content changed:", value?.substring(0, 50));
                  }}
                  options={mdeOptions}
                  placeholder="Write your blog post here..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Cover Image</FormLabel>
          {preview ? (
            <div className="mt-2 relative w-full h-64 rounded-md overflow-hidden border">
              <Image
                src={preview}
                alt="Cover image preview"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                style={{ objectFit: "cover" }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 flex justify-between items-center">
                <span className="text-sm truncate max-w-[80%]">
                  {imageFile ? imageFile.name : "Current cover image"}
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setPreview(null);
                    setImageFile(null);
                    form.setValue("image", "");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-dashed rounded-md p-8 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm justify-center">
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Cover Image
                  <input
                    id="image-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={imageLoading}
                  />
                </label>
              </div>
              <p className="text-xs mt-2 text-gray-500">
                PNG, JPG, or GIF up to 5MB
              </p>
            </div>
          )}

          {preview && (
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={() => {
                  document.getElementById("change-image-upload")?.click();
                }}
                disabled={imageLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {imageLoading ? "Uploading..." : "Change Image"}
                <input
                  id="change-image-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={imageLoading}
                />
              </Button>
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
                          ? "No tags found."
                          : "Type to search..."}
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

        <Button
          type="submit"
          disabled={isPending}
          onClick={(e) => {
            // console.log("Button clicked");
            // Prevent default to handle manually
            e.preventDefault();
            // Manually trigger form submission
            form.handleSubmit((data) => {
              // console.log("Form data on manual submit:", data);
              onSubmit(data);
            })();
          }}
        >
          {isPending ? (
            <CircleDashedIcon className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {form.getValues("isPublished") ? "Update & Publish" : "Update Draft"}
        </Button>
      </form>
    </Form>
  );
}
