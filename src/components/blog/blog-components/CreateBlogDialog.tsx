"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateBlogForm from "./CreateBlogForm";
import { PlusCircle } from "lucide-react";
import { getTags } from "@/components/dashboard/Tags/services/tagCrud";
import { BlogCategory, Tag } from "@prisma/client";
import { getBlogCategories } from "../services/blogCategoryCrud";

export default function CreateBlogDialog() {
  const [open, setOpen] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allCategories, setAllCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-[44px]">
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Blog
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Create Blog</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">Create a new blog post</DialogDescription>
        </DialogHeader>
        <CreateBlogForm
          allTags={allTags}
          allCategories={allCategories}
          // isLoading={isLoading}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
