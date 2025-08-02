"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  Edit,
  Trash2,
  Search,
  X,
} from "lucide-react";
import {
  approveInventoryAdjustment,
  deleteInventoryAdjustment,
} from "./services/inventory-adjustment";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { getInventoryItems } from "@/components/dashboard/inventory/items/services/itemsCrud";
import { getItemStoreLocations } from "@/components/dashboard/inventory/location/services/itemLocationCrud";
import { useEffect, useState } from "react";
import { StoreLocation } from "@prisma/client";
import { InventoryItemWithRelations } from "../items/types/ItemType";
import { AddAdjustmentDialog } from "./adjustment-dialog";
import { AdjustmentDetailDialog } from "./adjustment-detail-dialog";
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
import { AdjustmentsProps } from "./types/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdjustmentTableProps {
  adjustments: AdjustmentsProps[] | [];
}

export const AdjustmentTable = ({ adjustments }: AdjustmentTableProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState<
    InventoryItemWithRelations[]
  >([]);
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const { data: session } = useSession();
  const currentUser = session?.user;
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<AdjustmentsProps | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adjustmentToDelete, setAdjustmentToDelete] = useState<string | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    const fetchInventoryItems = async () => {
      const data = await getInventoryItems();
      setInventoryItems(data);
    };

    const fetchLocations = async () => {
      const data = await getItemStoreLocations();
      setLocations(data);
    };

    fetchInventoryItems();
    fetchLocations();
  }, []);

  // Filter the adjustments based on the filter criteria
  const filteredAdjustments = adjustments.filter((adjustment) => {
    // Search by item name
    const matchesSearch =
      searchQuery === "" ||
      adjustment.inventoryItem.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Filter by location
    const matchesLocation =
      selectedLocation === "all" ||
      adjustment.location.id === parseInt(selectedLocation);

    // Filter by status
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "approved"
        ? adjustment.approved
        : !adjustment.approved);

    return matchesSearch && matchesLocation && matchesStatus;
  });

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = async (id: string) => {
    if (!currentUser?.id && currentUser?.role !== "admin") {
      toast({
        title: "Authentication error",
        description: "You need to be an Admin to perform this action",
        variant: "destructive",
      });
      return;
    }

    const result = await approveInventoryAdjustment(id, currentUser.id);

    if (result.success) {
      toast({
        title: "Success",
        description: "Inventory adjustment approved successfully",
      });
      router.refresh(); // Use Next.js router refresh instead of custom callback
    } else {
      toast({
        title: "Error",
        description: "Failed to approve inventory adjustment",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteInventoryAdjustment(id);

    if (result.success) {
      toast({
        title: "Success",
        description: "Inventory adjustment deleted successfully",
      });
      router.refresh();
      setDeleteDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to delete inventory adjustment",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (adjustment: AdjustmentsProps) => {
    setSelectedAdjustment(adjustment);
    setDetailDialogOpen(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("all");
    setSelectedStatus("all");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Inventory Adjustments</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            View and manage inventory adjustments
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <AddAdjustmentDialog
            inventoryItems={inventoryItems}
            locations={locations}
          />
        </div>
      </div>
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0 rounded-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              defaultValue="all"
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              defaultValue="all"
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery ||
            selectedLocation !== "all" ||
            selectedStatus !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-10 w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">Item</TableHead>
              <TableHead className="text-xs sm:text-sm">Variation</TableHead>
              <TableHead className="text-xs sm:text-sm">Change</TableHead>
              <TableHead className="text-xs sm:text-sm">Location</TableHead>
              <TableHead className="text-xs sm:text-sm">Status</TableHead>
              <TableHead className="text-xs sm:text-sm">Created By</TableHead>
              <TableHead className="w-[80px] text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdjustments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-xs sm:text-sm">
                  No adjustments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAdjustments.map((adjustment) => (
                <TableRow
                  key={adjustment.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(adjustment)}
                >
                  <TableCell className="text-xs sm:text-sm">{adjustment.inventoryItem.name}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{adjustment.inventoryVariation.name}</TableCell>
                  <TableCell
                    className={`text-xs sm:text-sm ${
                      adjustment.changeAmount >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {adjustment.changeAmount >= 0 ? "+" : ""}
                    {adjustment.changeAmount}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs sm:text-sm">
                    {adjustment.location.name}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {adjustment.approved ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {adjustment.adjustedBy.firstName}{" "}
                    {adjustment.adjustedBy.lastName}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()} // Prevent row click event
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(adjustment);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {!adjustment.approved && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(adjustment.id);
                              }}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAdjustment(adjustment);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdjustmentToDelete(adjustment.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}

      <AdjustmentDetailDialog
        adjustment={selectedAdjustment}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        inventoryItems={inventoryItems}
        locations={locations}
      />

      {/* Edit Dialog - Direct from dropdown */}
      {editDialogOpen && (
        <AddAdjustmentDialog
          inventoryItems={inventoryItems}
          locations={locations}
          adjustment={selectedAdjustment}
          isEditMode={true}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            setEditDialogOpen(false);
            router.refresh();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              inventory adjustment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                adjustmentToDelete && handleDelete(adjustmentToDelete)
              }
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
