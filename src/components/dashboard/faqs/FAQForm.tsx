"use client";

import { useState } from "react";
import { FAQ } from "@prisma/client";
import { createFAQ, updateFAQ } from "./Services/faqCrud";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FAQFormProps {
  faq?: FAQ | null;
  initialQuestion?: string;
  categories: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function FAQForm({
  faq,
  initialQuestion = "",
  categories,
  onClose,
  onSuccess,
}: FAQFormProps) {
  const [formData, setFormData] = useState({
    question: faq?.question || initialQuestion,
    answer: faq?.answer || "",
    category: faq?.category || "",
    isPublished: faq?.isPublished || false,
  });

  const [categoryType, setCategoryType] = useState<"existing" | "new">(
    categories.includes(faq?.category || "") ? "existing" : "new"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (faq) {
        await updateFAQ(faq.id, formData);
      } else {
        await createFAQ(formData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving FAQ:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full mx-2 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">{faq ? "Edit FAQ" : "Create FAQ"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm sm:text-base">Question</Label>
            <Input
              id="question"
              placeholder="Enter your question"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              required
              className="text-sm sm:text-base min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer" className="text-sm sm:text-base">Answer</Label>
            <Textarea
              id="answer"
              placeholder="Enter the answer"
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              required
              className="text-sm sm:text-base min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-sm sm:text-base">Category</Label>
            <RadioGroup
              value={categoryType}
              onValueChange={(value: "existing" | "new") => {
                setCategoryType(value);
                setFormData({ ...formData, category: "" });
              }}
              className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing" className="text-sm sm:text-base">Use Existing Category</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="text-sm sm:text-base">Create New Category</Label>
              </div>
            </RadioGroup>

            {categoryType === "existing" ? (
              <Select
                value={formData.category || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled className="text-sm sm:text-base">
                      No categories available
                    </SelectItem>
                  ) : (
                    categories
                      .filter((category) => category && category.trim() !== "")
                      .map((category) => (
                        <SelectItem key={category} value={category} className="text-sm sm:text-base">
                          {category}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Enter new category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                className="text-sm sm:text-base min-h-[44px]"
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="published"
              checked={formData.isPublished}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPublished: checked as boolean })
              }
            />
            <Label htmlFor="published" className="text-sm sm:text-base">Published</Label>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px] text-sm sm:text-base">
              Cancel
            </Button>
            <Button type="submit" className="min-h-[44px] text-sm sm:text-base">{faq ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
