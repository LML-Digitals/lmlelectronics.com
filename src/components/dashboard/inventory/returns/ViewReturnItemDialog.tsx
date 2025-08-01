"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ItemReturnExtended } from "@/types/type";
import { useToast } from "@/components/ui/use-toast";
import {
  updateReturnStatus,
  markReturnAsPaid,
} from "./services/returnItemCrud";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  CreditCard,
} from "lucide-react";

interface ViewReturnItemDialogProps {
  item: ItemReturnExtended;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewReturnItemDialog({
  item,
  open,
  onOpenChange,
}: ViewReturnItemDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoadingStatusUpdate, setIsLoadingStatusUpdate] = useState(false);
  const [isLoadingMarkAsPaid, setIsLoadingMarkAsPaid] = useState(false);

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    setIsLoadingStatusUpdate(true);
    try {
      await updateReturnStatus(item.id, status);
      toast({
        title: "Status Updated",
        description: `Return has been ${status} successfully.`,
      });
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update status.`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingStatusUpdate(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setIsLoadingMarkAsPaid(true);
    try {
      await markReturnAsPaid(item.id);
      toast({
        title: "Success",
        description: "Return marked as paid successfully.",
      });
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark return as paid.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMarkAsPaid(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          badge: (
            <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
          ),
        };
      case "rejected":
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          badge: (
            <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>
          ),
        };
      case "pending":
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          badge: (
            <Badge className="bg-yellow-500 hover:bg-yellow-600">
              {status}
            </Badge>
          ),
        };
      default:
        return {
          icon: <Info className="h-5 w-5 text-gray-500" />,
          badge: (
            <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
          ),
        };
    }
  };

  const statusDetails = getStatusDetails(item.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {statusDetails.icon}
            Return Item Details
          </DialogTitle>
          <DialogDescription>
            View complete information about this return request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/40 rounded-lg p-4">
            <h3 className="text-md font-medium mb-2">Item Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{item.inventoryItem.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{item.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">
                  {item.inventoryItem.categories
                    ?.map((category) => category.name)
                    .join(", ") || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <div className="mt-1">{statusDetails.badge}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium mb-2">Return Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Return ID</p>
                <p className="font-medium text-xs">{item.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Return Date</p>
                <p className="font-medium">{formatDate(item.returnedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Returning Party</p>
                <p className="font-medium capitalize">{item.returningParty}</p>
              </div>

              {/* Conditional Fields based on Returning Party */}
              {item.returningParty.toLowerCase() === "customer" ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">
                      {`${item.customer?.firstName || ""} ${
                        item.customer?.lastName || ""
                      }`.trim() || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Request Type
                    </p>
                    <p className="font-medium capitalize">
                      {item.request || "N/A"}
                    </p>
                  </div>
                </>
              ) : item.returningParty.toLowerCase() === "shop" ? (
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  {/* Using item.supplier based on user's previous edit */}
                  <p className="font-medium">{item.supplier || "N/A"}</p>
                </div>
              ) : null}

              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{item.location.name}</p>
              </div>

              {/* Amount and Paid Status */}
              <div>
                <p className="text-sm text-muted-foreground">Return Amount</p>
                <p className="font-medium">
                  {item.amount != null ? `$${item.amount.toFixed(2)}` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Status</p>
                <div className="font-medium">
                  {item.isPaid ? (
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      Paid
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not Paid</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-md font-medium mb-2">Reason for Return</h3>
            <div className="bg-muted/30 rounded-md p-3">
              <p>{item.reason}</p>
            </div>
          </div>

          {item.Comment && (
            <div>
              <h3 className="text-md font-medium mb-2">Additional Notes</h3>
              <div className="bg-muted/30 rounded-md p-3">
                {item.Comment.map(
                  (comment: { text: string }, index: number) => (
                    <p key={index}>{comment.text}</p>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {item.status === "pending" && (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate("rejected")}
                disabled={isLoadingStatusUpdate}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Return
              </Button>
              <Button
                onClick={() => handleStatusUpdate("approved")}
                disabled={isLoadingStatusUpdate}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Return
              </Button>
            </div>
          )}
          {item.status === "approved" && !item.isPaid && (
            <Button
              onClick={handleMarkAsPaid}
              disabled={isLoadingMarkAsPaid}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
