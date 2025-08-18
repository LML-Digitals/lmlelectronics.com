'use client';

import { Trash2, Filter, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { AddTransferItem } from './AddTransferItem';
import { EditTransferItemDialog } from './EditTransferItemDialog';
import { TransferDetailsDialog } from './TransferDetailsDialog';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';
import { useToast } from '../../../ui/use-toast';
import { Badge } from '../../../ui/badge';
import {
  deleteInventoryTransfer,
  ExtendedInventoryTransfer,
} from '@/components/dashboard/inventory/transfers/services/internalTransfersCrud';
import { getItemStoreLocations } from '@/components/dashboard/inventory/location/services/itemLocationCrud';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StoreLocation } from '@prisma/client';

type Variation = {
  variationId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  sku: string;
};

type InventoryItem = {
  inventoryItemId: string;
  name: string;
  description: string;
  brand: string;
  image: string;
  itemsCategoryId: string;
  supplierId: string;
  locationId: number;
  variations: Variation[];
};

type InternalTransferProps = {
  internalTransferId: string;
  inventoryItemId: string;
  quantity: number;
  fromLocationId: number;
  toLocationId: number;
  fromLocation: StoreLocation;
  toLocation: StoreLocation;
  inventoryItem: InventoryItem;
};

type InternalTransfersTableProps = {
  transfers: InternalTransferProps[];
};

export type TransferProps = {
  transfers: ExtendedInventoryTransfer[];
};

function InternalTransfersTable ({ transfers }: TransferProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [isPending, startTranisition] = useTransition();
  const [selectedTransfer, setSelectedTransfer]
    = useState<ExtendedInventoryTransfer | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Location filtering
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [fromLocationFilter, setFromLocationFilter] = useState<string>('all');
  const [toLocationFilter, setToLocationFilter] = useState<string>('all');
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  // Fetch locations for filters
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const locationsData = await getItemStoreLocations();

        setLocations(locationsData);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load locations for filtering',
        });
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    setSearch(inputValue);
  };

  const filteredTransferedItems = transfers.filter((transfer) => {
    const matchesSearch
      = search.toLowerCase() === ''
      || transfer.inventoryItem.name.toLowerCase().includes(search.toLowerCase());

    const matchesFromLocation
      = fromLocationFilter === 'all'
      || String(transfer.fromLocationId) === fromLocationFilter;

    const matchesToLocation
      = toLocationFilter === 'all'
      || String(transfer.toLocationId) === toLocationFilter;

    return matchesSearch && matchesFromLocation && matchesToLocation;
  });

  const handleClearFilters = () => {
    setFromLocationFilter('all');
    setToLocationFilter('all');
    setSearch('');
  };

  const handleDeleteInternalTransfer = (transferId: string) => {
    startTranisition(async () => {
      try {
        const res = await deleteInventoryTransfer(transferId);

        if (res.status === 'success') {
          router.refresh();
          toast({
            title: 'Success',
            description: 'Deleted transfered item successfully',
          });
        }
      } catch (error) {
        toast({
          title: 'Failed',
          description: 'Deleting transfered item failed',
        });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'Pending':
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
        </Badge>
      );
    case 'In Transit':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
            In Transit
        </Badge>
      );
    case 'Completed':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleRowClick = (transfer: ExtendedInventoryTransfer) => {
    setSelectedTransfer(transfer);
    setDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium">Inventory Transfers</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            View and manage all internal inventory transfers
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <AddTransferItem />
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="my-4 p-4 sm:p-6 space-y-4">
        {/* Location Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium">Filter by:</span>
          </div>

          {/* Search */}
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <Input
              placeholder="Search by item name..."
              className="w-full sm:max-w-96"
              onChange={handleInputChange}
              value={search}
            />
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
            {/* From Location Filter */}
            <div className="w-full sm:w-[200px]">
              <Select
                value={fromLocationFilter}
                onValueChange={setFromLocationFilter}
                disabled={isLoadingLocations}
              >
                <SelectTrigger>
                  <SelectValue placeholder="From Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All From Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem
                      key={`from-${location.id}`}
                      value={String(location.id)}
                    >
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Location Filter */}
            <div className="w-full sm:w-[200px]">
              <Select
                value={toLocationFilter}
                onValueChange={setToLocationFilter}
                disabled={isLoadingLocations}
              >
                <SelectTrigger>
                  <SelectValue placeholder="To Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All To Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem
                      key={`to-${location.id}`}
                      value={String(location.id)}
                    >
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button - only show if filters are applied */}
            {(fromLocationFilter !== 'all'
              || toLocationFilter !== 'all'
              || search !== '') && (
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

      <div>
        <Card className="my-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="lg:w-80 text-xs sm:text-sm">Item Transferred</TableHead>
                <TableHead className="text-xs sm:text-sm">From Location</TableHead>
                <TableHead className="text-xs sm:text-sm">To Location</TableHead>
                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-xs sm:text-sm">Quantity</TableHead>
                <TableHead className="text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransferedItems.length > 0 ? (
                filteredTransferedItems.map((transfer) => (
                  <TableRow
                    key={transfer.id}
                    className="group cursor-pointer"
                    onClick={() => handleRowClick(transfer)}
                  >
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {transfer.inventoryItem.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{transfer.fromLocation.name}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{transfer.toLocation.name}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{getStatusBadge(transfer.status)}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{transfer.quantity}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()} className="text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <EditTransferItemDialog transfer={transfer} />
                        <Trash2
                          size={18}
                          className={
                            isPending
                              ? 'text-red-600 cursor-pointer animate-pulse'
                              : 'text-red-600 cursor-pointer'
                          }
                          onClick={() => handleDeleteInternalTransfer(transfer.id)
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground text-xs sm:text-sm"
                  >
                    No transfers found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {selectedTransfer && (
        <TransferDetailsDialog
          transfer={selectedTransfer}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </div>
  );
}

export default InternalTransfersTable;
