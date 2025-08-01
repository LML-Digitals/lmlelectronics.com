"use client";
import React, { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Search, Edit, Trash2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getAllWarrantyTypes,
  deleteWarrantyType,
} from "./services/warrantyTypeService";
import { WarrantyTypeProps } from "./types/types";
import { format } from "date-fns";
import { WarrantyTypeForm } from "./WarrantyTypeForm";
import { toast } from "@/components/ui/use-toast";
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

export default function WarrantyTypeTable() {
  const [warrantyTypes, setWarrantyTypes] = useState<WarrantyTypeProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWarrantyType, setSelectedWarrantyType] =
    useState<WarrantyTypeProps | null>(null);

  useEffect(() => {
    fetchWarrantyTypes();
  }, []);

  const fetchWarrantyTypes = async () => {
    setIsLoading(true);
    try {
      const data = await getAllWarrantyTypes();
      setWarrantyTypes(data);
    } catch (error) {
      console.error("Failed to fetch warranty types:", error);
      toast({
        title: "Error",
        description: "Failed to load warranty types. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWarrantyType(id);
      setWarrantyTypes(
        warrantyTypes.filter((warrantyType) => warrantyType.id !== id)
      );
      toast({
        title: "Success",
        description: "Warranty type deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete warranty type:", error);

      // Extract error message if available
      let errorMessage = "Failed to delete warranty type. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const filteredWarrantyTypes = warrantyTypes.filter(
    (warrantyType) =>
      warrantyType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warrantyType.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (duration: number) => {
    if (duration === 0) {
      return "Lifetime (No expiration)";
    }
    if (duration < 12) {
      return `${duration} month${duration !== 1 ? "s" : ""}`;
    }
    const years = Math.floor(duration / 12);
    const months = duration % 12;
    let result = `${years} year${years !== 1 ? "s" : ""}`;
    if (months > 0) {
      result += ` ${months} month${months !== 1 ? "s" : ""}`;
    }
    return result;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Warranty Types</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search warranty types..."
              className="w-64 pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Warranty Type
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Warranty Type</DialogTitle>
                <DialogDescription>
                  Define the details for a new warranty type that can be applied
                  to products.
                </DialogDescription>
              </DialogHeader>
              <WarrantyTypeForm
                onSuccess={() => {
                  fetchWarrantyTypes();
                  setIsCreateDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarrantyTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {searchTerm
                        ? "No warranty types match your search."
                        : "No warranty types found. Create one to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWarrantyTypes.map((warrantyType) => (
                    <TableRow key={warrantyType.id}>
                      <TableCell className="font-medium">
                        {warrantyType.name}
                      </TableCell>
                      <TableCell>{warrantyType.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          {formatDuration(warrantyType.duration)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(warrantyType.createdAt),
                          "MMM d, yyyy"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={
                              isEditDialogOpen &&
                              selectedWarrantyType?.id === warrantyType.id
                            }
                            onOpenChange={(open) => {
                              setIsEditDialogOpen(open);
                              if (!open) setSelectedWarrantyType(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedWarrantyType(warrantyType);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Warranty Type</DialogTitle>
                                <DialogDescription>
                                  Update the details for this warranty type.
                                </DialogDescription>
                              </DialogHeader>
                              {selectedWarrantyType && (
                                <WarrantyTypeForm
                                  warrantyType={selectedWarrantyType}
                                  onSuccess={() => {
                                    fetchWarrantyTypes();
                                    setIsEditDialogOpen(false);
                                    setSelectedWarrantyType(null);
                                  }}
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <AlertDialog
                            open={
                              isDeleteDialogOpen &&
                              selectedWarrantyType?.id === warrantyType.id
                            }
                            onOpenChange={(open) => {
                              setIsDeleteDialogOpen(open);
                              if (!open) setSelectedWarrantyType(null);
                            }}
                          >
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                setSelectedWarrantyType(warrantyType);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Warranty Type
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this warranty
                                  type? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() =>
                                    selectedWarrantyType &&
                                    handleDelete(selectedWarrantyType.id)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
