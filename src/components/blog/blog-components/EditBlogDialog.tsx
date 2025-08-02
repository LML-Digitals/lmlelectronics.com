"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EditBlogForm from "./EditBlogForm";
import { Edit } from "lucide-react";
import { getTags } from "@/components/dashboard/Tags/services/tagCrud";
import { BlogCategory, Tag } from "@prisma/client";
import { getBlogCategories } from "../services/blogCategoryCrud";
import { BlogWithDetailsType } from "../types/blogTypes";
import { useRouter } from "next/navigation";

type EditBlogProps = {
  blog: BlogWithDetailsType;
};

export default function EditBlogDialog({ blog }: EditBlogProps) {
  const [open, setOpen] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allCategories, setAllCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const tags = await getTags();
        setAllTags(tags.tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categories = await getBlogCategories();
        setAllCategories(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchTags();
      fetchCategories();
    }
  }, [open]);

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full text-blue-500 flex cursor-pointer items-center min-h-[44px] text-sm sm:text-base">
          <Edit className="w-4 h-4 mr-2" />
          Edit Blog
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Edit {blog.title}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">Edit {blog.title} blog post</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8 text-sm sm:text-base">Loading...</div>
        ) : (
          <EditBlogForm
            allTags={allTags}
            allCategories={allCategories}
            initialData={blog}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
