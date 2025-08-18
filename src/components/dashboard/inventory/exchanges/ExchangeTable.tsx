'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Filter, X, Check, X as XIcon, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { ExchangeWithRelations } from './services/types';
import { deleteExchange, updateExchangeStatus } from './services/exchangeCrud';
import AddExchangeForm from './AddExchangeForm';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useExchangeData } from './hooks/useExchangeData';
import { ViewExchange } from './ViewExchange';
import EditExchangeDialog from './EditExchangeDialog';

// Helper function to display item with variation if available
const ItemWithVariationDisplay = ({
  item,
  variationId,
  isReturned = false,
}: {
  item: any;
  variationId?: string | null;
  isReturned: boolean;
}) => {
  // Find the selected variation if specified
  const selectedVariation
    = variationId && item.variations
      ? item.variations.find((v: any) => v.id === variationId)
      : null;

  return (
    <div className="flex flex-col">
      <span className="font-medium text-xs sm:text-sm">{item.name}</span>
      {selectedVariation ? (
        <span className="text-xs text-gray-600">
          Variation: {selectedVariation.name || selectedVariation.sku}
        </span>
      ) : (
        item.variations
        && item.variations.length > 0 && (
          <span className="text-xs text-muted-foreground">
            No specific variation selected
          </span>
        )
      )}
    </div>
  );
};

export default function ExchangeTable ({
  exchanges,
}: {
  exchanges: ExchangeWithRelations[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Use our custom hook to fetch exchange-related data
  const { customers, staff, inventoryItems, isLoading, error }
    = useExchangeData();

  // Show error if data fetching fails
  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading data',
        description: error,
      });
    }
  }, [error, toast]);

  // States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedExchange, setSelectedExchange]
    = useState<ExchangeWithRelations | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    'delete' | 'approve' | 'reject' | null
  >(null);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  // Filter exchanges
  const filteredExchanges = exchanges.filter((exchange) => {
    const matchesSearch
      = search.toLowerCase() === ''
      || exchange.customer.firstName
        .toLowerCase()
        .includes(search.toLowerCase())
      || exchange.returnedItem.name.toLowerCase().includes(search.toLowerCase())
      || exchange.newItem.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus
      = statusFilter === 'all' || exchange.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Actions
  const handleDeleteExchange = () => {
    setActionType('delete');
    setConfirmDialogOpen(true);
  };

  const handleApproveExchange = () => {
    setActionType('approve');
    setConfirmDialogOpen(true);
  };

  const handleRejectExchange = () => {
    setActionType('reject');
    setConfirmDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedExchange || !actionType) { return; }

    startTransition(async () => {
      try {
        let response;

        if (actionType === 'delete') {
          response = await deleteExchange(selectedExchange.id);
          if (response.success) {
            toast({
              title: 'Success',
              description: 'Exchange deleted successfully',
            });
          }
        } else if (actionType === 'approve') {
          response = await updateExchangeStatus(
            selectedExchange.id,
            'Approved',
          );
          if (response.success) {
            toast({
              title: 'Success',
              description: 'Exchange approved',
            });
          }
        } else if (actionType === 'reject') {
          response = await updateExchangeStatus(
            selectedExchange.id,
            'Rejected',
          );
          if (response.success) {
            toast({
              title: 'Success',
              description: 'Exchange rejected',
            });
          }
        }

        if (!response?.success) {
          throw new Error(response?.error || 'Operation failed');
        }

        router.refresh();
        setConfirmDialogOpen(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message || 'An error occurred',
        });
      }
    });
  };

  const handleRowClick = (exchange: ExchangeWithRelations) => {
    setSelectedExchange(exchange);
    setDetailsDialogOpen(true);
  };

  // Handlers for exchange actions
  const handleApproveExchangeFromDetails = () => {
    if (!selectedExchange) { return; }
    setDetailsDialogOpen(false);
    handleApproveExchange();
  };

  const handleRejectExchangeFromDetails = () => {
    if (!selectedExchange) { return; }
    setDetailsDialogOpen(false);
    handleRejectExchange();
  };

  // Helper function for status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'Pending':
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
        </Badge>
      );
    case 'Approved':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
            Approved
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium">Inventory Exchanges</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage customer exchanges for inventory items
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          {/* Pass the fetched data to AddExchangeForm */}
          <AddExchangeForm
            customers={customers}
            staff={staff}
            inventoryItems={inventoryItems}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="my-4 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium">Filter by:</span>
          </div>

          {/* Search */}
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <Input
              placeholder="Search by customer or item name..."
              className="w-full sm:w-[320px]"
              onChange={handleSearch}
              value={search}
            />
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="w-full sm:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {(statusFilter !== 'all' || search !== '') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-10 w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Exchanges Table */}
      <Card className="my-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">Customer</TableHead>
              <TableHead className="text-xs sm:text-sm">Returned Item</TableHead>
              <TableHead className="text-xs sm:text-sm">New Item</TableHead>
              <TableHead className="text-xs sm:text-sm">Location</TableHead>
              <TableHead className="text-xs sm:text-sm">Date</TableHead>
              <TableHead className="text-xs sm:text-sm">Status</TableHead>
              <TableHead className="text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExchanges.length > 0 ? (
              filteredExchanges.map((exchange) => (
                <TableRow
                  key={exchange.id}
                  className="group cursor-pointer"
                  onClick={() => handleRowClick(exchange)}
                >
                  <TableCell className="font-medium text-xs sm:text-sm">
                    {exchange.customer.firstName} {exchange.customer.lastName}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <ItemWithVariationDisplay
                      item={exchange.returnedItem}
                      variationId={exchange.returnedVariationId}
                      isReturned={true}
                    />
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <ItemWithVariationDisplay
                      item={exchange.newItem}
                      variationId={exchange.newVariationId}
                      isReturned={false}
                    />
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {exchange.location.name}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {format(new Date(exchange.exchangedAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">{getStatusBadge(exchange.status)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        {/* Edit Exchange Button */}
                        {exchange.status !== 'Approved' && (
                          <EditExchangeDialog
                            exchange={exchange}
                            customers={customers}
                            staff={staff}
                            inventoryItems={inventoryItems}
                            isLoading={isLoading}
                          />
                        )}

                        {/* Delete Button - existing code */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedExchange(exchange);
                                handleDeleteExchange();
                              }}
                              disabled={isPending}
                            >
                              <Trash2 size={18} className="text-red-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete exchange</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground text-xs sm:text-sm"
                >
                  No exchanges found matching your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Replace the original dialog with the ViewExchange component */}
      {selectedExchange && (
        <ViewExchange
          exchange={selectedExchange}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onApprove={handleApproveExchangeFromDetails}
          onReject={handleRejectExchangeFromDetails}
          isPending={isPending}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'delete' && 'Delete Exchange'}
              {actionType === 'approve' && 'Approve Exchange'}
              {actionType === 'reject' && 'Reject Exchange'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'delete'
                && 'Are you sure you want to delete this exchange? This action cannot be undone.'}
              {actionType === 'approve'
                && 'Are you sure you want to approve this exchange?'}
              {actionType === 'reject'
                && 'Are you sure you want to reject this exchange?'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={isPending}
              variant={actionType === 'delete' ? 'destructive' : 'default'}
            >
              {isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
