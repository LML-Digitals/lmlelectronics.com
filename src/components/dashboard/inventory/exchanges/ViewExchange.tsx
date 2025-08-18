'use client';

import { format } from 'date-fns';
import { Check, X as XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ExchangeWithRelations } from './services/types';

interface ViewExchangeProps {
  exchange: ExchangeWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}

export function ViewExchange ({
  exchange,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isPending,
}: ViewExchangeProps) {
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

  // Find the selected variations
  const returnedVariation
    = exchange.returnedVariationId && exchange.returnedItem.variations
      ? exchange.returnedItem.variations.find((v) => v.id === exchange.returnedVariationId)
      : null;

  const newVariation
    = exchange.newVariationId && exchange.newItem.variations
      ? exchange.newItem.variations.find((v) => v.id === exchange.newVariationId)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exchange Details</DialogTitle>
          <DialogDescription>
            View complete information about this exchange
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Exchange Overview */}
          <Card className="p-4 space-y-3">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-lg">Exchange Information</h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ID:</span>
                <span className="font-medium">{exchange.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {format(new Date(exchange.exchangedAt), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span>{getStatusBadge(exchange.status)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Processed by:
                </span>
                <span className="font-medium">{`${exchange.staff.firstName} ${exchange.staff.lastName}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Location:</span>
                <span className="font-medium">{exchange.location.name}</span>
              </div>
            </div>

            <div className="border-b border-t py-2 mt-2">
              <h4 className="font-medium">Exchange Reason</h4>
            </div>

            <p className="text-sm">{exchange.reason}</p>
          </Card>

          {/* Customer Information */}
          <Card className="p-4 space-y-3">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-lg">Customer Information</h3>
            </div>

            <div className="flex items-center gap-3 pb-2">
              <Avatar>
                <AvatarFallback>
                  {exchange.customer.firstName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{`${exchange.customer.firstName} ${exchange.customer.lastName}`}</h4>
                <p className="text-sm text-muted-foreground">
                  {exchange.customer.email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Phone:</span>
                <span className="font-medium">{exchange.customer.phone}</span>
              </div>
            </div>
          </Card>

          {/* Items Comparison */}
          <Card className="p-4 space-y-3 md:col-span-2">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-lg">Exchanged Items</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Returned Item */}
              <div className="space-y-3 border rounded-md p-3">
                <div className="border-b pb-2">
                  <h4 className="font-medium text-red-600">Returned Item</h4>
                </div>

                <div className="flex items-center gap-3">
                  {exchange.returnedItem.image ? (
                    <img
                      src={exchange.returnedItem.image}
                      alt={exchange.returnedItem.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center">
                      <span className="text-xs text-slate-500">No image</span>
                    </div>
                  )}

                  <div>
                    <h5 className="font-medium">
                      {exchange.returnedItem.name}
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      Item ID: {exchange.returnedItemId}
                    </p>
                  </div>
                </div>

                {/* Selected Variation Detail */}
                {returnedVariation ? (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-md">
                    <p className="text-sm font-medium mb-2">
                      Selected Variation
                    </p>

                    <div className="flex items-center gap-3">
                      {returnedVariation.image ? (
                        <img
                          src={returnedVariation.image}
                          alt={returnedVariation.name || returnedVariation.sku}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center">
                          <span className="text-xs text-slate-500">
                            No image
                          </span>
                        </div>
                      )}

                      <div>
                        <p className="font-medium">
                          {returnedVariation.name || 'Unnamed Variation'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {returnedVariation.sku}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  exchange.returnedItem.variations
                  && exchange.returnedItem.variations.length > 0 && (
                    <div className="mt-3 pt-2 border-t">
                      <p className="text-sm font-medium mb-2 text-amber-700">
                        No specific variation selected
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* New Item */}
              <div className="space-y-3 border rounded-md p-3">
                <div className="border-b pb-2">
                  <h4 className="font-medium text-green-600">New Item</h4>
                </div>

                <div className="flex items-center gap-3">
                  {exchange.newItem.image ? (
                    <img
                      src={exchange.newItem.image}
                      alt={exchange.newItem.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center">
                      <span className="text-xs text-slate-500">No image</span>
                    </div>
                  )}

                  <div>
                    <h5 className="font-medium">{exchange.newItem.name}</h5>
                    <p className="text-xs text-muted-foreground">
                      Item ID: {exchange.newItemId}
                    </p>
                  </div>
                </div>

                {/* Selected Variation Detail */}
                {newVariation ? (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded-md">
                    <p className="text-sm font-medium  mb-2">
                      Selected Variation
                    </p>

                    <div className="flex items-center gap-3">
                      {newVariation.image ? (
                        <img
                          src={newVariation.image}
                          alt={newVariation.name || newVariation.sku}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center">
                          <span className="text-xs text-slate-500">
                            No image
                          </span>
                        </div>
                      )}

                      <div>
                        <p className="font-medium">
                          {newVariation.name || 'Unnamed Variation'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {newVariation.sku}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  exchange.newItem.variations
                  && exchange.newItem.variations.length > 0 && (
                    <div className="mt-3 pt-2 border-t">
                      <p className="text-sm font-medium mb-2 text-amber-700">
                        No specific variation selected
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter className="flex justify-between items-center mt-4">
          {exchange.status === 'Pending' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onApprove}
                disabled={isPending}
                className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
              >
                <Check size={16} className="mr-2" />
                Approve Exchange
              </Button>
              <Button
                variant="outline"
                onClick={onReject}
                disabled={isPending}
                className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
              >
                <XIcon size={16} className="mr-2" />
                Reject Exchange
              </Button>
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
