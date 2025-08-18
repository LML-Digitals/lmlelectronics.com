'use client';

import { Search, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { useState, useTransition } from 'react';
import CreateReturnItemDialog from './CreateReturnItemForm';
import EditReturnItemDialog from './EditReturnItemForm';
import { ViewReturnItemDialog } from './ViewReturnItemDialog';
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
import { useRouter } from 'next/navigation';
import { Button } from '../../../ui/button';
import { deleteReturn } from '@/components/dashboard/inventory/returns/services/returnItemCrud';
import { useToast } from '../../../ui/use-toast';
import { Badge } from '../../../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../ui/alert-dialog';
import { ItemReturnExtended } from '@/types/type';

function ItemReturnTable ({
  returnedItems,
}: {
  returnedItems: ItemReturnExtended[] | null;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const [isPending, startTranisition] = useTransition();
  const [selectedItem, setSelectedItem] = useState<ItemReturnExtended | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    setSearch(inputValue);
  };

  const filteredReturnedItems = returnedItems
    ? returnedItems.filter((returned: ItemReturnExtended) => {
      return (
        search.toLowerCase() === ''
          || returned.inventoryItem.name
            .toLowerCase()
            .includes(search.toLocaleLowerCase())
      );
    })
    : [];

  const handleDeleteReturn = (stockReturnId: string) => {
    startTranisition(async () => {
      try {
        const res = await deleteReturn(stockReturnId);

        if (res.status === 'success') {
          router.refresh();
          toast({
            title: 'Deleted',
            description: 'Deleted returned item successfully',
          });
        }
      } catch (error) {
        toast({
          title: 'Failed',
          description: 'Deleting returned item failed',
        });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'Approved':
      return (
        <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      );
    case 'Rejected':
      return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>;
    case 'Pending':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Return Items</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage all returned inventory items
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <CreateReturnItemDialog />
        </div>
      </div>

      <div className="relative my-2">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="Search by item name..."
          className="pl-10 w-full sm:max-w-md"
          onChange={handleInputChange}
          value={search}
        />
      </div>

      <Card className="overflow-hidden border rounded-lg shadow-sm">
        {filteredReturnedItems.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium text-xs sm:text-sm">Returned Item</TableHead>
                  <TableHead className="font-medium text-xs sm:text-sm">Returned By</TableHead>
                  <TableHead className="font-medium text-xs sm:text-sm">Reason</TableHead>
                  <TableHead className="font-medium text-xs sm:text-sm">Quantity</TableHead>
                  <TableHead className="font-medium text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="font-medium text-xs sm:text-sm">Paid Status</TableHead>
                  <TableHead className="font-medium text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturnedItems.map((item: ItemReturnExtended) => (
                  <TableRow
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setDialogOpen(true);
                    }}
                    className="hover:bg-muted/50 cursor-pointer"
                  >
                    <TableCell className="text-xs sm:text-sm">{item.inventoryItem.name}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {item.returningParty.toLowerCase() === 'customer'
                        ? `${item.customer?.firstName || ''} ${
                          item.customer?.lastName || ''
                        }`.trim() || 'Customer'
                        : item.returningParty.toLowerCase() === 'shop'
                          ? item.supplier || 'Shop'
                          : item.returningParty.charAt(0).toUpperCase()
                          + item.returningParty.slice(1)}
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate text-xs sm:text-sm"
                      title={item.reason}
                    >
                      {item.reason}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{item.quantity}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {getStatusBadge(item.status.charAt(0).toUpperCase()
                          + item.status.slice(1))}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {item.isPaid ? (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">Paid</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Not Paid</Badge>
                      )}
                    </TableCell>
                    <TableCell
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="text-xs sm:text-sm"
                    >
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {item.status !== 'approved' ? (
                                <EditReturnItemDialog
                                  returnedItem={item}
                                  trigger={
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      <Edit size={16} className="text-blue-500" />
                                    </Button>
                                  }
                                />
                              ) : (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  disabled
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <Edit size={16} className="text-gray-400" />
                                </Button>
                              )}
                            </TooltipTrigger>
                            <TooltipContent>Edit item</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                                disabled={isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemToDeleteId(item.id);
                                }}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete item</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Search size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-medium">No returned items found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-4">
              {search
                ? 'Try adjusting your search term'
                : 'Start by adding a returned item'}
            </p>
            <div className="w-full sm:w-auto">
              <CreateReturnItemDialog />
            </div>
          </div>
        )}
      </Card>

      {selectedItem && (
        <ViewReturnItemDialog
          item={selectedItem}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}

      <AlertDialog
        open={itemToDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setItemToDeleteId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              returned item record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDeleteId) {
                  handleDeleteReturn(itemToDeleteId);
                }
                setItemToDeleteId(null);
              }}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ItemReturnTable;
