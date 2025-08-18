import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getOrders } from '@/components/dashboard/pos/orders/services/pos-orders';
import { Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { OrdersPagination } from './OrdersPagination';

interface OrdersListProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    locationId?: string;
  };
}

export async function OrdersList ({ searchParams }: OrdersListProps) {
  const result = await getOrders({
    page: parseInt(searchParams.page || '1'),
    search: searchParams.search,
    status: searchParams.status,
    paymentMethod: searchParams.paymentMethod,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    locationId: searchParams.locationId,
  });

  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {result.error || 'Failed to load orders'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { orders, pagination } = result.data;

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-muted-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search criteria
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Order ID</TableHead>
                  <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Items</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Payment</TableHead>
                  <TableHead className="text-xs sm:text-sm">Total</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Location</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {order.id.slice(-8).toUpperCase()}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-xs sm:text-sm">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                          {order.customer.email}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm">{order._count.items} items</span>
                        {order._count.refunds > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {order._count.refunds} refund
                            {order._count.refunds > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      {order.paymentMethod && (
                        <Badge variant="outline" className="text-xs">
                          {order.paymentMethod}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="font-medium text-xs sm:text-sm">
                      $
                      {order.total.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm">
                          {format(new Date(order.createdAt), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="hidden xl:table-cell">
                      <span className="text-xs sm:text-sm">{order.storeLocation.name}</span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/dashboard/pos/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3">
                          <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <OrdersPagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
      />
    </div>
  );
}

function StatusBadge ({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
    case 'PAID':
      return { variant: 'default' as const, label: 'Paid' };
    case 'INVOICED':
      return { variant: 'secondary' as const, label: 'Invoiced' };
    case 'REFUNDED':
      return { variant: 'destructive' as const, label: 'Refunded' };
    case 'PARTIALLY_REFUNDED':
      return { variant: 'outline' as const, label: 'Partially Refunded' };
    default:
      return { variant: 'outline' as const, label: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}
