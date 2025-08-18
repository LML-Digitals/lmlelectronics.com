'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  approveInventoryAdjustment,
  deleteInventoryAdjustment,
} from './services/inventory-adjustment';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AddAdjustmentDialog } from './adjustment-dialog';
import { InventoryItemWithRelations } from '../items/types/ItemType';
import { StoreLocation } from '@prisma/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Edit,
  Trash2,
  Package,
  Tag,
  PenTool,
  Calendar,
  User,
  CheckCircle2,
  Info,
  ListOrdered,
  MapPin,
} from 'lucide-react';
import { AdjustmentsProps } from './types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CircleDashed } from 'lucide-react';

interface AdjustmentDetailDialogProps {
  adjustment: AdjustmentsProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItems: InventoryItemWithRelations[];
  locations: StoreLocation[];
}

export const AdjustmentDetailDialog = ({
  adjustment,
  open,
  onOpenChange,
  inventoryItems,
  locations,
}: AdjustmentDetailDialogProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  const currentUser = session?.user;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = async () => {
    setIsLoading(true);
    if (!adjustment) { return; }

    if (!currentUser?.id) {
      toast({
        title: 'Authentication error',
        description: 'You need to be logged in to perform this action',
        variant: 'destructive',
      });

      return;
    }

    const result = await approveInventoryAdjustment(
      adjustment.id,
      currentUser.id,
    );

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Inventory adjustment approved successfully',
      });
      setIsLoading(false);
      router.refresh();
      onOpenChange(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to approve inventory adjustment',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    if (!adjustment) { return; }

    const result = await deleteInventoryAdjustment(adjustment.id);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Inventory adjustment deleted successfully',
      });
      setIsLoading(false);
      router.refresh();
      onOpenChange(false);
      setDeleteDialogOpen(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete inventory adjustment',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  if (!adjustment) { return null; }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
                Inventory Adjustment Details
            </DialogTitle>
            <Badge
              variant={adjustment.approved ? 'default' : 'outline'}
              className={`px-3 py-1 text-sm font-medium ${
                adjustment.approved
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {adjustment.approved ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : null}
              {adjustment.approved ? 'Approved' : 'Pending'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
              Adjustment for{' '}
            <span className="font-medium">
              {adjustment.inventoryItem.name}
            </span>{' '}
              -
            <span className="font-medium">
              {' '}
              {adjustment.inventoryVariation.name
                  || adjustment.inventoryVariation.sku}
            </span>
          </p>
          <Separator />
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Item and Variation Details */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <Package className="h-4 w-4 mr-2 text-primary" />
                  Item Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Item Name</p>
                  <p className="font-medium">
                    {adjustment.inventoryItem.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Variation</p>
                  <p className="font-medium">
                    {adjustment.inventoryVariation.name
                        || adjustment.inventoryVariation.sku}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">SKU</p>
                  <div className="flex items-center">
                    <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                    <p>{adjustment.inventoryVariation.sku}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                    <p>{adjustment.location?.name || 'Default'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adjustment Details */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <ListOrdered className="h-4 w-4 mr-2 text-primary" />
                  Adjustment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                      Change Amount
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      adjustment.changeAmount >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {adjustment.changeAmount >= 0 ? '+' : ''}
                    {adjustment.changeAmount}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                      Stock Changes
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                        Before:{' '}
                      <span className="font-medium">
                        {adjustment.stockBefore}
                      </span>
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm">
                        After:{' '}
                      {adjustment.stockAfter ? (
                        <span className="font-medium text-green-600">
                          {adjustment.stockAfter}
                        </span>
                      ) : (
                        <span className="font-medium">
                          {adjustment.stockBefore + adjustment.changeAmount}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                      Date Created
                  </p>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                    <p>{formatDate(adjustment.createdAt.toISOString())}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Created By</p>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1 text-muted-foreground" />
                    <p>
                      {`${adjustment.adjustedBy.firstName
                      } ${
                        adjustment.adjustedBy.lastName}`}
                    </p>
                  </div>
                </div>
                {adjustment.approved && adjustment.approvedBy && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                        Approved By
                    </p>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-muted-foreground" />
                      <p>
                        {`${adjustment.approvedBy.firstName
                        } ${
                          adjustment.approvedBy.lastName}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reason for Adjustment */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center">
                <PenTool className="h-4 w-4 mr-2 text-primary" />
                  Reason for Adjustment
              </h3>
              <div className="p-3 bg-muted rounded-md">
                <p className="whitespace-pre-wrap text-sm">
                  {adjustment.reason}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Item Description if available */}
          {adjustment.inventoryItem.description && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-base font-semibold mb-3 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-primary" />
                    Item Description
                </h3>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    {adjustment.inventoryItem.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between justify-end pt-2">
          {!adjustment.approved && (
            <Button
              onClick={handleApprove}
              size="sm"
              className="gap-1 w-full sm:w-auto"
            >
              {isLoading ? (
                <CircleDashed className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
                Approve Adjustment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
