'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { resolveInventoryAudit } from './services/inventory-audit';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuditProps } from './types';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  ClipboardList,
  User,
  MapPin,
  PackageSearch,
  AlertTriangle,
  Warehouse,
  Tag,
  Diff,
  CircleDashed,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AuditDetailDialogProps {
  audit: AuditProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuditDetailDialog = ({
  audit,
  open,
  onOpenChange,
}: AuditDetailDialogProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const currentUser = session?.user;

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleResolve = async () => {
    setLoading(true);
    if (!audit) { return; }

    if (!currentUser?.id) {
      toast({
        title: 'Authentication error',
        description: 'You need to be logged in to perform this action',
        variant: 'destructive',
      });
      setLoading(false);

      return;
    }

    const result = await resolveInventoryAudit(audit.id, currentUser.id);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Inventory audit resolved successfully',
      });
      setLoading(false);
      onOpenChange(false);
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to resolve inventory audit',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (!audit) { return null; }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <DialogTitle className="text-lg sm:text-xl font-semibold">
              Inventory Audit Details
            </DialogTitle>
            <Badge
              variant={audit.status === 'Resolved' ? 'default' : 'outline'}
              className={cn(
                'px-3 py-1 text-xs sm:text-sm',
                audit.status === 'Resolved'
                  ? 'bg-green-100 text-green-800'
                  : 'border-amber-500 text-amber-600',
              )}
            >
              {audit.status === 'Resolved' ? (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 mr-1 inline" />
              )}
              {audit.status}
            </Badge>
          </div>
          <div className="flex items-center mt-1 text-xs sm:text-sm text-muted-foreground">
            <PackageSearch className="w-4 h-4 mr-1" />
            {audit.inventoryItem.name} <span className="mx-1">-</span>
            {audit.inventoryVariation.name || audit.inventoryVariation.sku}
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Item Information */}
          <div className="bg-muted/50 rounded-md p-3 sm:p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <ClipboardList className="w-4 h-4 mr-2" /> Item Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h4 className="text-xs font-medium">Item</h4>
                <p className="font-medium text-sm">{audit.inventoryItem.name}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium">Variation</h4>
                <p className="font-medium text-sm">
                  {audit.inventoryVariation.name
                    || audit.inventoryVariation.sku}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-medium flex items-center">
                  <Tag className="w-3.5 h-3.5 mr-1" /> SKU
                </h4>
                <p className="font-medium text-sm">{audit.inventoryVariation.sku}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1" /> Location
                </h4>
                <p className="font-medium text-sm">{audit.location.name}</p>
              </div>
            </div>

            {audit.inventoryItem.description && (
              <div className="mt-3">
                <h4 className="text-xs font-medium">Description</h4>
                <p className="text-xs sm:text-sm">{audit.inventoryItem.description}</p>
              </div>
            )}
          </div>

          {/* Stock Discrepancy */}
          <div className="bg-muted/50 rounded-md p-3 sm:p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <Diff className="w-4 h-4 mr-2" /> Stock Discrepancy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-muted/50 p-3 rounded-md border border-slate-200">
                <h4 className="text-xs font-medium">Recorded Stock</h4>
                <p className="font-semibold text-base sm:text-lg">
                  <Warehouse className="w-4 h-4 inline mr-1" />
                  {formatNumber(audit.recordedStock)}
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-md border border-slate-200">
                <h4 className="text-xs font-medium">Actual Stock</h4>
                <p className="font-semibold text-base sm:text-lg">
                  <PackageSearch className="w-4 h-4 inline mr-1" />
                  {formatNumber(audit.actualStock)}
                </p>
              </div>
              <div
                className={cn(
                  'p-3 rounded-md border',
                  audit.discrepancy >= 0
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200',
                )}
              >
                <h4 className="text-xs font-medium text-gray-500">
                  Discrepancy
                </h4>
                <p
                  className={cn(
                    'font-semibold text-base sm:text-lg flex items-center',
                    audit.discrepancy >= 0 ? 'text-green-600' : 'text-red-600',
                  )}
                >
                  {audit.discrepancy >= 0 ? (
                    <ArrowUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                  )}
                  {audit.discrepancy >= 0 ? '+' : ''}
                  {formatNumber(audit.discrepancy)}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Information */}
          <div className="bg-muted/50 rounded-md p-3 sm:p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <ClipboardList className="w-4 h-4 mr-2" /> Audit Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h4 className="text-xs font-medium flex items-center">
                  <User className="w-3.5 h-3.5 mr-1" /> Audited By
                </h4>
                <p className="font-medium text-sm">{audit.staff.firstName}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" /> Date Created
                </h4>
                <p className="font-medium text-sm">
                  {formatDate(audit.createdAt.toString())}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          {audit.status !== 'Resolved' && (
            <Button
              onClick={handleResolve}
              className="flex items-center w-full sm:w-auto"
            >
              {loading ? (
                <CircleDashed className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Resolve Discrepancy
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
