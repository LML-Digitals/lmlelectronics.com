"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Search,
  Download,
  Trash2,
  ArrowDownAZ,
  Calendar,
  Copy,
  Edit,
  Link,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

// Import server actions and components
import { getImages, deleteImage, renameImage } from "./actions";
import UploadButton from "@/components/dashboard/image-library/UploadButton";

type ImageItem = {
  id: string;
  name: string;
  url: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  size?: number | null;
  metadata?: Record<string, any>;
};

export default function ImageLibrary() {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "updated_at">(
    "created_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isImageViewOpen, setIsImageViewOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getImages(searchQuery, {
        sortBy,
        sortOrder,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setImages(result.images || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load images",
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, sortOrder, toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleImageClick = (image: ImageItem) => {
    setSelectedImage(image);
    setIsImageViewOpen(true);
  };

  const handleDownload = async (image: ImageItem) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = image.name;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download image",
      });
    }
  };

  const handleDelete = async (image: ImageItem) => {
    try {
      setDeleteLoading(true);
      const result = await deleteImage(image.name);

      if (result.error) {
        throw new Error(result.error);
      }

      setImages(images.filter((img) => img.id !== image.id));

      if (selectedImage?.id === image.id) {
        setIsImageViewOpen(false);
        setSelectedImage(null);
      }

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete image",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const copyLink = async (image: ImageItem) => {
    try {
      await navigator.clipboard.writeText(image.url);
      toast({
        title: "Success",
        description: "Image link copied to clipboard",
      });
    } catch (error) {
      console.error("Error copying link:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link to clipboard",
      });
    }
  };

  const openRenameDialog = (image: ImageItem) => {
    setSelectedImage(image);
    setNewFileName(image.name);
    setIsRenameDialogOpen(true);
  };

  const handleRename = async () => {
    if (!selectedImage || !newFileName.trim()) return;

    try {
      setRenameLoading(true);
      const result = await renameImage(selectedImage.name, newFileName.trim());

      if (result.error) {
        throw new Error(result.error);
      }

      // Update the images list with the new name
      setImages(
        images.map((img) =>
          img.id === selectedImage.id
            ? { ...img, name: newFileName.trim() }
            : img
        )
      );

      // Update selected image if it's still open
      if (isImageViewOpen && selectedImage) {
        setSelectedImage({ ...selectedImage, name: newFileName.trim() });
      }

      setIsRenameDialogOpen(false);
      setNewFileName("");

      toast({
        title: "Success",
        description: "Image renamed successfully",
      });

      // Refresh the images list to get updated data
      fetchImages();
    } catch (error) {
      console.error("Error renaming image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to rename image",
      });
    } finally {
      setRenameLoading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="container mx-auto p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Image Library</h1>
          {!loading && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {images.length} {images.length === 1 ? "image" : "images"} total
              {searchQuery && ` (filtered from search)`}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative flex-grow">
            <Search
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full text-sm sm:text-base"
              onKeyDown={(e) => e.key === "Enter" && fetchImages()}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: "name" | "created_at" | "updated_at") =>
                setSortBy(value)
              }
            >
              <SelectTrigger className="w-full sm:w-[140px] min-h-[44px] text-sm sm:text-base">
                <SelectValue>
                  {sortBy === "name" ? (
                    <div className="flex items-center gap-1">
                      <ArrowDownAZ size={16} />
                      <span>Name</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>Date</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name" className="text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <ArrowDownAZ size={16} />
                    <span>Sort by Name</span>
                  </div>
                </SelectItem>
                <SelectItem value="created_at" className="text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Sort by Date</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
            >
              <SelectTrigger className="w-full sm:w-[140px] min-h-[44px] text-sm sm:text-base">
                <SelectValue>
                  {sortOrder === "asc" ? "A to Z / Oldest" : "Z to A / Newest"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc" className="text-sm sm:text-base">
                  {sortBy === "name" ? "A to Z" : "Oldest first"}
                </SelectItem>
                <SelectItem value="desc" className="text-sm sm:text-base">
                  {sortBy === "name" ? "Z to A" : "Newest first"}
                </SelectItem>
              </SelectContent>
            </Select>

            <UploadButton onUploadComplete={fetchImages} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm sm:text-base">Loading images...</span>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-muted rounded-lg">
          <p className="text-base sm:text-lg text-muted-foreground">No images found</p>
          {searchQuery && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
          {images.map((image) => (
            <Card
              key={image.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleImageClick(image)}
            >
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  className="object-cover"
                />
              </div>
              <CardContent className="p-2 sm:p-3">
                <p className="text-xs sm:text-sm font-medium truncate" title={image.name}>
                  {image.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(image.created_at), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedImage && (
        <Dialog open={isImageViewOpen} onOpenChange={setIsImageViewOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-3xl w-full mx-2 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">{selectedImage.name}</DialogTitle>
            </DialogHeader>

            <div className="relative w-full h-[40vh] sm:h-[60vh] mt-4">
              <Image
                src={selectedImage.url}
                alt={selectedImage.name}
                fill
                className="object-contain"
              />
            </div>

            <div className="mt-4 space-y-2 text-xs sm:text-sm">
              <p>
                <strong>Created:</strong>{" "}
                {format(new Date(selectedImage.created_at), "PPpp")}
              </p>
              {selectedImage.metadata?.size && (
                <p>
                  <strong>Size:</strong>{" "}
                  {formatFileSize(selectedImage.metadata.size)}
                </p>
              )}
              {selectedImage.updated_at !== selectedImage.created_at && (
                <p>
                  <strong>Last Modified:</strong>{" "}
                  {format(new Date(selectedImage.updated_at), "PPpp")}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyLink(selectedImage)}
                className="min-h-[44px] text-xs sm:text-sm"
              >
                <Link size={16} className="mr-2" />
                Copy Link
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => openRenameDialog(selectedImage)}
              >
                <Edit size={16} className="mr-2" />
                Rename
              </Button> */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(selectedImage)}
                className="min-h-[44px] text-xs sm:text-sm"
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedImage)}
                disabled={deleteLoading}
                className="min-h-[44px] text-xs sm:text-sm"
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 size={16} className="mr-2" />
                )}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md w-full mx-2 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Rename Image</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="newFileName" className="text-sm font-medium">
                New file name:
              </label>
              <Input
                id="newFileName"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name"
                className="mt-1 text-sm sm:text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !renameLoading) {
                    handleRename();
                  }
                }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
              disabled={renameLoading}
              className="min-h-[44px] text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={renameLoading || !newFileName.trim()}
              className="min-h-[44px] text-xs sm:text-sm"
            >
              {renameLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Rename
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
