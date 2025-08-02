"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTag, updateTag, TagFormData, Tag } from "./services/tagCrud";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

type Props = {
  tag?: Tag;
  onSuccess?: () => void;
};

export default function TagForm({ tag, onSuccess }: Props) {
  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    description: "",
    color: "#3b82f6", // Default blue color
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!tag;

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        description: tag.description || "",
        color: tag.color || "#3b82f6",
      });
    }
  }, [tag]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && tag) {
        const result = await updateTag(tag.id, formData);
        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
          if (onSuccess) onSuccess();
        } else {
          setError(result.message);
        }
      } else {
        const result = await createTag(formData);
        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
          setFormData({ name: "", description: "", color: "#3b82f6" });
          if (onSuccess) onSuccess();
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError("Cannot create/update tag");
      toast({
        title: "Error",
        description: "Cannot create/update tag",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Tag Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter tag name"
          required
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter tag description (optional)"
          rows={3}
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            id="color"
            name="color"
            type="color"
            value={formData.color}
            onChange={handleChange}
            className="w-12 h-10 p-1 sm:w-16"
          />
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex-shrink-0"
            style={{ backgroundColor: formData.color || "#3b82f6" }}
          />
          <span className="text-sm font-medium break-all">
            {formData.color || "#3b82f6"}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto mt-4 min-h-[44px]"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>{isEditing ? "Update Tag" : "Create Tag"}</>
        )}
      </Button>
    </form>
  );
}
