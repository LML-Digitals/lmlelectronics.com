"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Trash2,
  Search,
  Tag as TagIcon,
  Info,
  Plus,
  Loader2,
} from "lucide-react";
import { getTags, deleteTag, getTagUsageStats, Tag } from "./services/tagCrud";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import TagForm from "./TagForm";
import { useRouter } from "next/navigation";

export default function TagTable() {
  const router = useRouter();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [tagUsage, setTagUsage] = useState({
    blogsCount: 0,
    inventoryItemsCount: 0,
    repairGuidesCount: 0,
    // uploadedImagesCount: 0,
    totalUsages: 0,
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const limit = 20;

  const loadTags = async () => {
    setLoading(true);
    try {
      // Fetch all tags at once without pagination or search filters
      const result = await getTags({
        limit: 1000, // A high number to get all tags
      });
      setAllTags(result.tags);
      setHasMore(result.tags.length >= limit);
    } catch (error) {
      console.error("Error loading tags:", error);
      toast({
        title: "Error",
        description: "Failed to load tags",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter tags locally
  useEffect(() => {
    // Apply search filter
    const filtered =
      search.trim() === ""
        ? allTags
        : allTags.filter(
            (tag) =>
              tag.name.toLowerCase().includes(search.toLowerCase()) ||
              (tag.description &&
                tag.description.toLowerCase().includes(search.toLowerCase()))
          );

    setFilteredTags(filtered);
  }, [allTags, search]);

  useEffect(() => {
    loadTags();
  }, []);

  // Handle create tag button click from parent component
  useEffect(() => {
    const handleCreateTagClick = () => {
      setIsCreateFormOpen(true);
    };

    const createTagButton = document.querySelector(".create-tag-button");
    if (createTagButton) {
      createTagButton.addEventListener("click", handleCreateTagClick);
    }

    return () => {
      if (createTagButton) {
        createTagButton.removeEventListener("click", handleCreateTagClick);
      }
    };
  }, []);

  // Infinite scroll callback
  const lastTagElementRef = useCallback((node: HTMLTableRowElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        // Load more tags when the last element is visible
        loadMoreTags();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadMoreTags = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      // For now, since we're loading all tags at once, we don't need to fetch more
      // This is a placeholder for when you implement server-side pagination
      setHasMore(false);
    } catch (error) {
      console.error("Error loading more tags:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleEditClick = (tag: Tag) => {
    setEditingTag(tag);
    setIsEditFormOpen(true);
  };

  const handleViewDetails = async (tag: Tag) => {
    setSelectedTag(tag);
    try {
      const usage = await getTagUsageStats(tag.id);
      setTagUsage(usage);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("Error getting tag usage:", error);
      toast({
        title: "Error",
        description: "Failed to load tag details",
      });
    }
  };

  const handleDeleteClick = (tag: Tag) => {
    setTagToDelete(tag);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!tagToDelete) return;

    try {
      const result = await deleteTag(tagToDelete.id);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        loadTags();
      } else {
        toast({
          title: "Error",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast({
        title: "Error",
        description: "Failed to delete tag",
      });
    } finally {
      setIsDeleteConfirmOpen(false);
      setTagToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-auto sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-full text-base"
          />
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Tag</TableHead>
              <TableHead className="hidden sm:table-cell">Color</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[200px]">
                Description
              </TableHead>
              <TableHead className="hidden md:table-cell min-w-[100px]">Created</TableHead>
              <TableHead className="text-right min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 sm:py-10">
                  <div className="text-sm sm:text-base">Loading tags...</div>
                </TableCell>
              </TableRow>
            ) : filteredTags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 sm:py-10">
                  <div className="text-sm sm:text-base">
                    No tags found. {search && "Try a different search term."}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTags.map((tag, index) => (
                <TableRow 
                  key={tag.id}
                  ref={index === filteredTags.length - 1 ? lastTagElementRef : null}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color || "#3b82f6" }}
                      ></div>
                      <span className="break-words max-w-[100px] sm:max-w-none">{tag.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{tag.color || "-"}</TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-sm">
                    {tag.description || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {format(new Date(tag.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 sm:gap-4 flex-wrap">
                      <button
                        className="p-2 sm:p-1 rounded hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        onClick={() => handleViewDetails(tag)}
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 sm:p-1 rounded hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        onClick={() => handleEditClick(tag)}
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </button>
                      <button
                        className="p-2 sm:p-1 rounded hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        onClick={() => handleDeleteClick(tag)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading more tags...
          </div>
        </div>
      )}

      {/* Total count display */}
      {!loading && filteredTags.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredTags.length} tags
        </div>
      )}

      {/* Create Tag Dialog */}
      <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Tag
            </DialogTitle>
            <DialogDescription>
              Add a new tag to help categorize and organize content.
            </DialogDescription>
          </DialogHeader>
          <TagForm
            onSuccess={() => {
              setIsCreateFormOpen(false);
              loadTags();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Make changes to the tag properties below.
            </DialogDescription>
          </DialogHeader>
          {editingTag && (
            <TagForm
              tag={editingTag}
              onSuccess={() => {
                setIsEditFormOpen(false);
                loadTags();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tag &quot;{tagToDelete?.name}
              &quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tag Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              Tag Details
            </DialogTitle>
            <DialogDescription>
              Information about the tag and where it&apos;s being used.
            </DialogDescription>
          </DialogHeader>
          {selectedTag && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: selectedTag.color || "#3b82f6" }}
                ></div>
                <h3 className="text-lg font-semibold">{selectedTag.name}</h3>
              </div>

              {selectedTag.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTag.description}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-2">Usage Statistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">
                      Blog Posts
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      {tagUsage.blogsCount}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">
                      Inventory Items
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      {tagUsage.inventoryItemsCount}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">
                      Repair Guides
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      {tagUsage.repairGuidesCount}
                    </div>
                  </div>
                  {/* <div className="bg-muted rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Images</div>
                    <div className="text-lg sm:text-xl font-bold">
                      {tagUsage.uploadedImagesCount}
                    </div>
                  </div> */}
                </div>
                <div className="mt-4">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Total Uses: {tagUsage.totalUsages}
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2">
                <p>Created: {format(new Date(selectedTag.createdAt), "PPP")}</p>
                <p>Updated: {format(new Date(selectedTag.updatedAt), "PPP")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
