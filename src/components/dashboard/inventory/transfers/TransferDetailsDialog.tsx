"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  ExtendedInventoryTransfer,
  updateTransferWithStockAdjustment, // Import the new function
} from "@/components/dashboard/inventory/transfers/services/internalTransfersCrud";
import {
  CircleDashedIcon,
  ArrowRight,
  CheckCircle2,
  Timer,
  Clock,
  TruckIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface TransferDetailsDialogProps {
  transfer: ExtendedInventoryTransfer;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TransferDetailsDialog({
  transfer,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: TransferDetailsDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(transfer.status);

  // Handle both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? setControlledOpen : setInternalOpen;

  // Update status when transfer prop changes
  useEffect(() => {
    setStatus(transfer.status);
  }, [transfer]);

  const handleStatusUpdate = (newStatus: string) => {
    if (newStatus === status) return;

    startTransition(async () => {
      try {
        // Use the new function that handles stock adjustments
        const res = await updateTransferWithStockAdjustment(
          transfer.id,
          newStatus
        );

        if (res.status === "success") {
          setStatus(newStatus);
          toast({
            title: "Status Updated",
            description: res.message,
          });
          router.refresh();
        } else if (res.status === "error") {
          toast({
            variant: "destructive",
            title: "Error",
            description: res.message,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update transfer status",
        });
      }
    });
  };

  // Check if status is completed (to disable status selection)
  const isCompleted = status === "Completed";

  const getStatusIcon = () => {
    switch (status) {
      case "Pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "In Transit":
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case "Completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Timer className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "Pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            Pending
          </Badge>
        );
      case "In Transit":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            In Transit
          </Badge>
        );
      case "Completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Transfer Details
            <span className="ml-2">{getStatusBadge()}</span>
          </DialogTitle>
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center p-6">
            <CircleDashedIcon className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with basic info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">
                  {transfer.inventoryItem?.name || "Unknown Item"}
                </CardTitle>
                <CardDescription>
                  Created on{" "}
                  {format(new Date(transfer.transferDate), "MMM dd, yyyy")} •
                  Transfer #{transfer.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {/* Item and variation */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 rounded-md border">
                      <AvatarImage
                        src={
                          transfer.inventoryItem?.image || "/placeholder.png"
                        }
                        alt={transfer.inventoryItem?.name || "Item Image"}
                      />
                      <AvatarFallback className="rounded-md">
                        {transfer.inventoryItem?.name
                          ?.substring(0, 2)
                          .toUpperCase() || "IT"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-medium">
                        {transfer.inventoryItem?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Variation: {transfer.inventoryVariation?.name || "N/A"}{" "}
                        • SKU: {transfer.inventoryVariation?.sku || "N/A"}
                      </p>
                      <p className="text-sm font-semibold">
                        Quantity: {transfer.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Locations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Transfer Route</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">From Location</p>
                    <div className="bg-primary-50 p-3 flex justify-between rounded-md border">
                      <div>
                        <p className="font-medium">
                          {transfer.fromLocation?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transfer.fromLocation?.description ||
                            "No description available"}
                        </p>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {transfer.inventoryVariation?.stockLevels?.find(
                          (level) =>
                            level.locationId === transfer.fromLocationId
                        )?.stock || 0}
                      </Badge>
                    </div>
                  </div>

                  <ArrowRight className="h-6 w-6 text-muted-foreground mx-2" />

                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">To Location</p>
                    <div className="bg-primary-50 p-3 flex justify-between rounded-md border">
                      <div>
                        <p className="font-medium">
                          {transfer.toLocation?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transfer.toLocation?.description ||
                            "No description available"}
                        </p>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {transfer.inventoryVariation?.stockLevels?.find(
                          (level) =>
                            level.locationId === transfer.toLocationId
                        )?.stock || 0}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Control */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Manage Transfer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Update Status</p>
                  <Select
                    value={status}
                    onValueChange={handleStatusUpdate}
                    disabled={isPending || isCompleted}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  {isCompleted && (
                    <p className="text-xs text-amber-600 mt-1">
                      Completed transfers cannot be changed. Stock has already
                      been adjusted.
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">
                    {status === "Pending" &&
                      "Transfer is awaiting processing. Items are still at the source location."}
                    {status === "In Transit" &&
                      "Transfer is in progress. Items are being moved between locations."}
                    {status === "Completed" &&
                      "Transfer has been completed. Items have arrived at the destination."}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Last updated:{" "}
                  {format(
                    new Date(transfer.transferDate),
                    "MMM dd, yyyy hh:mm a"
                  )}
                </p>
              </CardFooter>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen && setIsOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
