"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  addStaffNote,
  updateStaffNote,
  deleteStaffNote,
} from "@/components/dashboard/staff/services/staffNotes";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Note } from "@prisma/client";
type StaffNote = {
  id: number;
  content: string;
  createdAt: Date;
  author: {
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
};

type StaffNotesProps = {
  staffId: string;
  notes: StaffNote[];
  isAdmin: boolean;
};

export default function StaffNotes({
  staffId,
  notes,
  isAdmin,
}: StaffNotesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<StaffNote | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!newNote.trim()) return;

    try {
      setIsSubmitting(true);
      await addStaffNote(staffId, newNote.trim());
      setNewNote("");
      setIsOpen(false);
      toast({
        title: "Note added successfully",
        description: "Your note has been added to the staff's notes.",
        variant: "default",
      });
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Failed to add note",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingNote || !editingNote.content.trim()) return;

    try {
      setIsSubmitting(true);
      await updateStaffNote(editingNote.id, editingNote.content.trim());
      setEditingNote(null);
      setIsEditOpen(false);
      toast({
        title: "Note updated successfully",
        description: "Your note has been updated.",
        variant: "default",
      });
      window.location.reload();
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Failed to update note",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingNote) return;

    try {
      setIsSubmitting(true);
      await deleteStaffNote(editingNote.id);
      setEditingNote(null);
      setIsDeleteOpen(false);
      toast({
        title: "Note deleted successfully",
        description: "The note has been removed.",
        variant: "default",
      });
      window.location.reload();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Failed to delete note",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // if (!isAdmin) return null;

  return (
    <Card className="p-6 shadow-md">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <h3 className="text-2xl font-bold mt-2">Internal Notes</h3>
          <p className="text-sm mt-1">
            Staff member's private notes and observations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                size="default"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm transition-all duration-200 hover:translate-y-[-1px]"
              >
                <Plus size={18} />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Add Internal Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="Enter your note here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[150px] resize-none focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !newNote.trim()}
                    className="min-w-[100px]"
                  >
                    {isSubmitting ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.length === 0 ? (
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-500 text-center mb-2">
                No notes available
              </p>
              <p className="text-sm text-gray-400">
                Add your first note to get started
              </p>
            </div>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="border rounded-lg p-5 space-y-3 hover:shadow-md transition-shadow duration-200 bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      {note.author.profileImage ? (
                        <img
                          src={note.author.profileImage}
                          alt={`${note.author.firstName} ${note.author.lastName}`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-gray-500">
                          {note.author.firstName[0]}
                          {note.author.lastName[0]}
                        </span>
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {note.author.firstName} {note.author.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <span className="sr-only">Open menu</span>
                        <Pencil size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingNote(note);
                          setIsEditOpen(true);
                        }}
                        className="hover:bg-gray-100"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Note
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setEditingNote(note);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed pt-2">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter your note here..."
              value={editingNote?.content || ""}
              onChange={(e) =>
                setEditingNote(
                  editingNote
                    ? { ...editingNote, content: e.target.value }
                    : null
                )
              }
              className="min-h-[150px] resize-none focus:ring-2 focus:ring-primary/20"
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingNote(null);
                }}
                disabled={isSubmitting}
                className="hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                disabled={isSubmitting || !editingNote?.content.trim()}
                className="min-w-[100px]"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-red-600">
              Delete Note
            </AlertDialogTitle>
            <AlertDialogDescription className="py-3">
              This action cannot be undone. This will permanently delete the
              note from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              disabled={isSubmitting}
              className="hover:bg-gray-100"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white min-w-[100px]"
            >
              {isSubmitting ? "Deleting..." : "Delete Note"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
