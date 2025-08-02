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
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  FileText,
  AlertCircle,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getAllWarranties,
  deleteWarranty,
  getWarrantiesByCustomerId,
} from "./services/warrantyCrud";
import { WarrantyProps } from "./types/types";
import { format } from "date-fns";
import { WarrantyForm } from "./WarrantyForm";
import Link from "next/link";
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
import { useRouter } from "next/navigation";
import {
  getCustomersForSelect,
  getInventoryItemsForSelect,
} from "./services/customerAndProductService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

function WarrantyTable({ customerId }: { customerId?: string }) {
  const [warranties, setWarranties] = useState<WarrantyProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Set isCustomerView immediately if customerId is provided
  const [isCustomer, setIsCustomer] = useState(!!customerId);
  const [selectedWarranty, setSelectedWarranty] =
    useState<WarrantyProps | null>(null);

  // Filter states - remove separate search terms for customer and item
  // Just use typeFilter and statusFilter
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const router = useRouter();

  // Status options for filtering
  const statusOptions = ["Active", "Expired", "Active with Claims"];

  useEffect(() => {
    // We no longer need to fetch customers and items data for dropdowns
    // since we're using search inputs instead
  }, [customerId]);

  useEffect(() => {
    const fetchWarrantiesEffect = async () => {
      // Clear warranties immediately to prevent flashing of all warranties
      setWarranties([]);
      setIsLoading(true);

      // Update isCustomer immediately based on customerId
      setIsCustomer(!!customerId);

      try {
        if (customerId) {
          const data = await getWarrantiesByCustomerId(customerId);
          setWarranties(data);
        } else {
          const data = await getAllWarranties();
          setWarranties(data);
        }
      } catch (error) {
        console.error("Failed to fetch warranties:", error);
        toast({
          title: "Error",
          description: "Failed to load warranties. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarrantiesEffect();
  }, [customerId]); // Add customerId as dependency

  const fetchWarranties = async () => {
    setWarranties([]); // Clear immediately
    setIsLoading(true);
    try {
      if (customerId) {
        const data = await getWarrantiesByCustomerId(customerId);
        setWarranties(data);
      } else {
        const data = await getAllWarranties();
        setWarranties(data);
      }
    } catch (error) {
      console.error("Failed to fetch warranties:", error);
      toast({
        title: "Error",
        description: "Failed to load warranties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWarranty(id);
      setWarranties(warranties.filter((warranty) => warranty.id !== id));
      toast({
        title: "Success",
        description: "Warranty deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete warranty:", error);
      toast({
        title: "Error",
        description: "Failed to delete warranty. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Apply all filters to warranties
  const filteredWarranties = warranties.filter((warranty) => {
    // Enhanced unified search term filter
    const matchesSearch =
      searchTerm === "" ||
      warranty.customer?.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      warranty.customer?.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      warranty.inventoryItem?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      warranty.inventoryVariation?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      warranty.warrantyType?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType =
      typeFilter === "all" || warranty.warrantyType?.name === typeFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      getWarrantyStatusString(warranty) === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getWarrantyStatusBadge = (warranty: WarrantyProps) => {
    const isActive = warranty.endDate
      ? new Date(warranty.endDate) > new Date()
      : true;

    if (!isActive) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    const hasClaims =
      warranty.warrantyClaims && warranty.warrantyClaims.length > 0;
    const hasOpenClaims =
      hasClaims &&
      warranty.warrantyClaims?.some(
        (claim) => claim.status === "Pending" || claim.status === "In Review"
      );

    if (hasOpenClaims) {
      return (
        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-800">
          Active with Claims
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-green-100 dark:bg-green-800">
        Active
      </Badge>
    );
  };

  // Helper function to get warranty status as string for filtering
  const getWarrantyStatusString = (warranty: WarrantyProps): string => {
    const isActive = warranty.endDate
      ? new Date(warranty.endDate) > new Date()
      : true;

    if (!isActive) {
      return "Expired";
    }

    const hasClaims =
      warranty.warrantyClaims && warranty.warrantyClaims.length > 0;
    const hasOpenClaims =
      hasClaims &&
      warranty.warrantyClaims?.some(
        (claim) => claim.status === "Pending" || claim.status === "In Review"
      );

    return hasOpenClaims ? "Active with Claims" : "Active";
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  // Get a list of unique warranty type names for filtering from the actual data
  const getUniqueWarrantyTypes = () => {
    const types = warranties
      .map((w) => w.warrantyType?.name)
      .filter((name): name is string => !!name);
    return [...new Set(types)];
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 gap-4">
        {!isCustomer ? (
          <div className="mb-6 sm:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Warranty Management
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Track and manage warranty information for products sold to
              customers
            </p>
          </div>
        ) : (
          <div className="mb-6 sm:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">My Warranty</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              View and track warranty details for all your purchased products
            </p>
          </div>
        )}
        {/* Only show action buttons for admin/staff */}
        {!isCustomer && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1 w-full sm:w-auto">
                  <PlusCircle className="h-4 w-4" /> Add Warranty
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Warranty</DialogTitle>
                  <DialogDescription>
                    Create a new warranty for a customer's product
                  </DialogDescription>
                </DialogHeader>
                <WarrantyForm
                  onSuccess={() => {
                    fetchWarranties();
                    setIsCreateDialogOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button onClick={() => router.push("warranty/types")} className="w-full sm:w-auto">
              Manage Warranty Types
            </Button>
            <Button onClick={() => router.push("warranty/claims")} className="w-full sm:w-auto">
              Manage Claims
            </Button>
          </div>
        )}
      </Card>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-base sm:text-lg font-medium flex items-center">
                <Filter className="h-5 w-5 mr-1" />
                Filters
              </h3>
              {(searchTerm ||
                typeFilter !== "all" ||
                statusFilter !== "all") && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search warranties by customer, product..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="w-full">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {getUniqueWarrantyTypes().map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-xs sm:text-sm">Loading warranties...</p>
            </div>
          ) : (
            <>
              {warranties.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-4" />
                  <p className="text-base sm:text-lg font-medium">No warranties found</p>
                  <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                    {isCustomer
                      ? "You don't have any warranties yet."
                      : "Start by adding a warranty for a customer."}
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {!isCustomer && <TableHead className="text-xs sm:text-sm">Customer</TableHead>}
                        <TableHead className="text-xs sm:text-sm">Product</TableHead>
                        <TableHead className="text-xs sm:text-sm">Type</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-xs sm:text-sm">Start Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">End Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">Claims</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWarranties.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-xs sm:text-sm">
                            No warranties found matching your search.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredWarranties.map((warranty) => (
                          <TableRow key={warranty.id}>
                            {!isCustomer && (
                              <TableCell className="text-xs sm:text-sm">
                                {warranty.customer ? (
                                  <div className="font-medium">
                                    {warranty.customer.firstName}{" "}
                                    {warranty.customer.lastName}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">
                                    Unknown
                                  </span>
                                )}
                              </TableCell>
                            )}
                            <TableCell className="text-xs sm:text-sm">
                              {warranty.inventoryItem?.name ||
                                warranty.inventoryVariation?.name ||
                                "Unknown Product"}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              <Badge variant="secondary" className="text-xs">
                                {warranty.warrantyType?.name || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {getWarrantyStatusBadge(warranty)}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {format(
                                new Date(warranty.startDate),
                                "MMM d, yyyy"
                              )}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {warranty.endDate ? (
                                format(
                                  new Date(warranty.endDate),
                                  "MMM d, yyyy"
                                )
                              ) : (
                                <Badge variant="outline" className="text-xs">Lifetime</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {warranty.warrantyClaims?.length || 0}
                            </TableCell>
                            <TableCell className="text-right text-xs sm:text-sm">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {isCustomer ? (
                                    <Link
                                      href={`/dashboard/customers/warranty/${warranty.id}`}
                                      passHref
                                    >
                                      <DropdownMenuItem>
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                    </Link>
                                  ) : (
                                    <Link
                                      href={`/dashboard/warranty/${warranty.id}`}
                                      passHref
                                    >
                                      <DropdownMenuItem>
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                    </Link>
                                  )}

                                  {/* Add coverage summary in dropdown */}
                                  <DropdownMenuItem asChild>
                                    <div className="flex items-center cursor-default">
                                      <AlertCircle className="mr-2 h-4 w-4" />
                                      <span className="text-xs">
                                        Coverage:{" "}
                                        {warranty.warrantyType?.coverage &&
                                        typeof warranty.warrantyType
                                          .coverage === "object" ? (
                                          <>
                                            {[
                                              "defects" in
                                                warranty.warrantyType
                                                  .coverage &&
                                                warranty.warrantyType.coverage
                                                  .defects &&
                                                "Defects",
                                              "accidental" in
                                                warranty.warrantyType
                                                  .coverage &&
                                                warranty.warrantyType.coverage
                                                  .accidental &&
                                                "Accidental",
                                              "water" in
                                                warranty.warrantyType
                                                  .coverage &&
                                                warranty.warrantyType.coverage
                                                  .water &&
                                                "Water Damage",
                                              "priority" in
                                                warranty.warrantyType
                                                  .coverage &&
                                                warranty.warrantyType.coverage
                                                  .priority &&
                                                "Priority Support",
                                              "labor" in
                                                warranty.warrantyType
                                                  .coverage &&
                                                warranty.warrantyType.coverage
                                                  .labor &&
                                                "Labor",
                                              "parts" in
                                                warranty.warrantyType
                                                  .coverage &&
                                                warranty.warrantyType.coverage
                                                  .parts &&
                                                "Parts",
                                              "replacements" in
                                                warranty.warrantyType
                                                  .coverage &&
                                                warranty.warrantyType.coverage
                                                  .replacements &&
                                                "Replacements",
                                            ]
                                              .filter(Boolean)
                                              .join(", ") || "Basic"}
                                          </>
                                        ) : (
                                          "Basic"
                                        )}
                                      </span>
                                    </div>
                                  </DropdownMenuItem>

                                  {/* Only show edit/delete for admin/staff */}
                                  {!isCustomer && (
                                    <>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                          >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Warranty
                                          </DropdownMenuItem>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
                                          <DialogHeader>
                                            <DialogTitle>
                                              Edit Warranty
                                            </DialogTitle>
                                          </DialogHeader>
                                          <WarrantyForm
                                            warranty={warranty}
                                            onSuccess={() => fetchWarranties()}
                                          />
                                        </DialogContent>
                                      </Dialog>
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onSelect={() => {
                                          setSelectedWarranty(warranty);
                                          setIsDeleteDialogOpen(true);
                                        }}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Warranty
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </>
          )}
        </CardContent>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this warranty and all associated
                claims. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() =>
                  selectedWarranty && handleDelete(selectedWarranty.id)
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}

export default WarrantyTable;
