"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Globe, Mail, Phone, MapPin, Clock, Box } from "lucide-react";
import { SupplierProps } from "./services/types";
import { EditSupplierDialog } from "./EditSupplierDialog";

interface SupplierDetailDialogProps {
  supplier: SupplierProps;
  isOpen: boolean;
  onClose: () => void;
}

export function SupplierDetailDialog({
  supplier,
  isOpen,
  onClose,
}: SupplierDetailDialogProps) {
  // Render rating stars function
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {supplier.name}
          </DialogTitle>
          <DialogDescription>
            Supplier details and information
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium text-lg mb-3">Contact Information</h3>
              <div className="space-y-3">
                {supplier.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-gray-500" />
                    <span>{supplier.contactEmail}</span>
                  </div>
                )}

                {supplier.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-500" />
                    <span>{supplier.contactPhone}</span>
                  </div>
                )}

                {supplier.website && (
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-gray-500" />
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {supplier.website}
                    </a>
                  </div>
                )}

                {supplier.address && (
                  <div className="flex items-start gap-2">
                    <MapPin size={18} className="text-gray-500 mt-1" />
                    <span>{supplier.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium text-lg mb-3">Supplier Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <div className="flex items-center gap-0.5">
                    {supplier.rating !== null &&
                    supplier.rating !== undefined ? (
                      renderStars(supplier.rating)
                    ) : (
                      <span className="text-muted-foreground italic">
                        No rating
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Lead Time</p>
                  {supplier.leadTime !== null &&
                  supplier.leadTime !== undefined ? (
                    <div className="flex items-center gap-1">
                      <Clock size={16} className="text-gray-500" />
                      <span>{supplier.leadTime} days</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Not specified
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Inventory Items</p>
                  <div className="flex items-center gap-1">
                    <Box size={16} className="text-gray-500" />
                    <span>{supplier.inventoryItems?.length || 0} items</span>
                  </div>
                </div>

                {supplier.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm">{supplier.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {/* <EditSupplierDialog supplier={supplier} /> */}
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
