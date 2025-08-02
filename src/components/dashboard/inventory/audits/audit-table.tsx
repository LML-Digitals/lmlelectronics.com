'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  Edit,
  Trash,
  Search,
} from 'lucide-react';
import {
  resolveInventoryAudit,
  deleteInventoryAudit,
} from './services/inventory-audit';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import { AuditProps } from './types';
import { Card } from '@/components/ui/card';
import { getInventoryItems } from '@/components/dashboard/inventory/items/services/itemsCrud';
import { getItemStoreLocations } from '@/components/dashboard/inventory/location/services/itemLocationCrud';
import { InventoryItemWithRelations } from '../items/types/ItemType';
import { StoreLocation } from '@prisma/client';
import { useState, useEffect } from 'react';
import { AuditForm } from './audit-form';
import { AuditDetailDialog } from './audit-detail-dialog';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AuditTableProps {
  audits: AuditProps[];
}

export const AuditTable = ({ audits }: AuditTableProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState<
    InventoryItemWithRelations[]
  >([]);
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const { data: session } = useSession();
  const currentUser = session?.user;

  // State for dialogs
  const [selectedAudit, setSelectedAudit] = useState<AuditProps | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Apply filters to audits
  const filteredAudits = audits.filter((audit) => {
    // Search filter for item name
    const matchesSearch =
      searchQuery === '' ||
      audit.inventoryItem.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Location filter
    const matchesLocation =
      locationFilter === 'all' ||
      audit.location.id === parseInt(locationFilter);

    // Status filter
    const matchesStatus =
      statusFilter === 'all' || audit.status === statusFilter;

    return matchesSearch && matchesLocation && matchesStatus;
  });

  const handleResolve = async (id: string) => {
    if (!currentUser?.id) {
      toast({
        title: 'Authentication error',
        description: 'You need to be logged in to perform this action',
        variant: 'destructive',
      });
      return;
    }

    const result = await resolveInventoryAudit(id, currentUser.id);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Inventory audit resolved successfully',
      });
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to resolve inventory audit',
        variant: 'destructive',
      });
    }
  };

  // Function to open detail dialog with selected audit
  const openAuditDetailDialog = (audit: AuditProps) => {
    setSelectedAudit(audit);
    setDetailDialogOpen(true);
  };

  // Function to open edit dialog with selected audit
  const openEditDialog = (audit: AuditProps, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAudit(audit);
    setEditDialogOpen(true);
  };

  // Function to open delete confirmation dialog
  const openDeleteDialog = (audit: AuditProps, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAudit(audit);
    setDeleteDialogOpen(true);
  };

  // Function to handle delete
  const handleDelete = async () => {
    if (!selectedAudit) return;

    const result = await deleteInventoryAudit(selectedAudit.id);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Inventory audit deleted successfully',
      });
      setDeleteDialogOpen(false);
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete inventory audit',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Inventory Audits</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage inventory audits
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
          <AuditForm inventoryItems={inventoryItems} locations={locations} />
        </div>
      </div>
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by item name..."
                className="pl-10 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full lg:w-48">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger id="location" className="w-full h-10">
                <SelectValue placeholder="Select location" />
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
          <div className="w-full lg:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status" className="w-full h-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Item</TableHead>
                <TableHead className="min-w-[100px]">Variation</TableHead>
                <TableHead className="min-w-[100px]">Location</TableHead>
                <TableHead className="min-w-[100px]">System Stock</TableHead>
                <TableHead className="min-w-[100px]">Actual Stock</TableHead>
                <TableHead className="min-w-[100px]">Discrepancy</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Date</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    No audits found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAudits.map((audit) => (
                  <TableRow
                    key={audit.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openAuditDetailDialog(audit)}
                  >
                    <TableCell className="font-medium">{audit.inventoryItem.name}</TableCell>
                    <TableCell>
                      {audit.inventoryVariation.name ||
                        audit.inventoryVariation.sku}
                    </TableCell>
                    <TableCell>{audit.location.name}</TableCell>
                    <TableCell>{audit.recordedStock}</TableCell>
                    <TableCell>{audit.actualStock}</TableCell>
                    <TableCell
                      className={
                        audit.discrepancy >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {audit.discrepancy >= 0 ? '+' : ''}
                      {audit.discrepancy}
                    </TableCell>
                    <TableCell>
                      {audit.status === 'Resolved' ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 text-xs">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(audit.createdAt.toString())}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openAuditDetailDialog(audit)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {audit.status !== 'Resolved' && (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => openEditDialog(audit, e)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Audit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResolve(audit.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Resolve Discrepancy
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => openDeleteDialog(audit, e)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
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
        </div>
      </div>

      {/* Audit Detail Dialog */}
      <AuditDetailDialog
        audit={selectedAudit}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* Edit Audit Form Dialog */}
      <AuditForm
        inventoryItems={inventoryItems}
        locations={locations}
        audit={selectedAudit}
        isEditMode={true}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              audit record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
