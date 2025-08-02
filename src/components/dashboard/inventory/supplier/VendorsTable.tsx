"use client";

import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AddSupplierDialog } from "./AddSupplierDialog";
import { EditSupplierDialog } from "./EditSupplierDialog";
import { SupplierDetailDialog } from "./SupplierDetailDialog";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { useToast } from "../../../ui/use-toast";
import { deleteSupplier } from "./services/supplierCrud";
import { SupplierProps } from "./services/types";

function SuppliersTable({ suppliers }: { suppliers: SupplierProps[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierProps | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearch(inputValue);
  };

  const filteredItems = suppliers.filter((supplier) => {
    return (
      search.toLowerCase() === "" ||
      supplier.name.toLowerCase().includes(search.toLocaleLowerCase())
    );
  });

  const deleteLocation = async (id: number) => {
    startTransition(async () => {
      try {
        const res = await deleteSupplier(id);
        if (res.success) {
          toast({
            title: "Supplier",
            description: "Supplier Deleted Successfully",
          });
          router.refresh();
        }
      } catch (error) {
        toast({
          title: "Supplier",
          description: "Failed to Delete Supplier",
        });
      }
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.min(Math.max(Math.round(rating), 1), 5);

    // Add filled stars
    for (let i = 0; i < roundedRating; i++) {
      stars.push(
        <Star
          key={`filled-${i}`}
          size={16}
          fill="#EAB308"
          color="#EAB308"
          className="inline-block"
        />
      );
    }

    // Add empty stars
    for (let i = roundedRating; i < 5; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          size={16}
          fill="transparent"
          color="#EAB308"
          className="inline-block"
        />
      );
    }

    return stars;
  };

  const handleRowClick = (supplier: SupplierProps) => {
    setSelectedSupplier(supplier);
  };

  const handleCloseDetailDialog = () => {
    setSelectedSupplier(null);
  };

  return (
    <div>
      {/* Detail Dialog */}
      {selectedSupplier && (
        <SupplierDetailDialog
          supplier={selectedSupplier}
          isOpen={!!selectedSupplier}
          onClose={handleCloseDetailDialog}
        />
      )}

      {/* Rest of the component */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-medium">Suppliers</h1>
            <p className="text-xs sm:text-sm">Manage your Suppliers</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <AddSupplierDialog />
          </div>
        </div>

        <Input
          placeholder="Search Suppliers. . . . ."
          className="w-full sm:max-w-96"
          onChange={handleInputChange}
        />
      </div>
      <div>
        <Card className="my-8 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="lg:w-[180px] text-xs sm:text-sm">Supplier</TableHead>
                <TableHead className="lg:w-[180px] text-xs sm:text-sm">Email</TableHead>
                <TableHead className="lg:w-[140px] text-xs sm:text-sm">Website</TableHead>
                <TableHead className="lg:w-[100px] text-xs sm:text-sm">Rating</TableHead>
                <TableHead className="lg:w-[100px] text-xs sm:text-sm">Lead Time</TableHead>
                <TableHead className="lg:w-[100px] text-xs sm:text-sm">Items</TableHead>
                <TableHead className="w-[100px] text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems &&
                filteredItems.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    onClick={() => handleRowClick(supplier)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {supplier.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {supplier.contactEmail ? (
                        <span>{supplier.contactEmail}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs sm:text-sm italic">
                          No email
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {supplier.website ? (
                        <a
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline"
                        >
                          {supplier.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs sm:text-sm italic">
                          No website
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {supplier.rating !== null &&
                      supplier.rating !== undefined ? (
                        <div className="flex items-center gap-0.5">
                          {renderStars(supplier.rating)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs sm:text-sm italic">
                          No rating
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {supplier.leadTime !== null &&
                      supplier.leadTime !== undefined ? (
                        <span>{supplier.leadTime} days</span>
                      ) : (
                        <span className="text-muted-foreground text-xs sm:text-sm italic">
                          N/A
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs sm:text-sm">
                      <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                        {supplier.inventoryItems?.length || 0} items
                      </span>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <div
                        className="flex items-center gap-3"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <EditSupplierDialog supplier={supplier} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Trash2
                              size={18}
                              className={`text-red-500 cursor-pointer ${
                                isPending ? "animate-pulse" : ""
                              }`}
                            />
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            onClick={(e) => e.stopPropagation()}
                          >
                            {" "}
                            {/* Prevent row click */}
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the supplier &quot;
                                {supplier.name}&quot;.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteLocation(supplier.id)}
                                disabled={isPending}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                {isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

export default SuppliersTable;
