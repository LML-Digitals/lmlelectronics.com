import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrdersSearchAndFilters } from "@/components/dashboard/pos/orders/OrdersSearchAndFilters";
import { OrdersList } from "@/components/dashboard/pos/orders/OrdersList";
import { OrdersStats } from "@/components/dashboard/pos/orders/OrdersStats";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    locationId?: string;
  }>;
}

export default async function POSOrdersPage({ searchParams }: PageProps) {
  const { page, search, status, paymentMethod, dateFrom, dateTo, locationId } =
    await searchParams;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage all completed transactions from the POS register
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Suspense fallback={<OrdersStatsSkeleton />}>
        <OrdersStats />
      </Suspense>

      {/* Main Orders Section */}
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">All Orders</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Search and filter orders by customer, status, payment method, and
            date range
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Search and Filters */}
          <OrdersSearchAndFilters />

          {/* Orders List */}
          <Suspense fallback={<OrdersListSkeleton />}>
            <OrdersList
              searchParams={{
                page,
                search,
                status,
                paymentMethod,
                dateFrom,
                dateTo,
                locationId,
              }}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersStatsSkeleton() {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 sm:h-8 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OrdersListSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 sm:h-5 w-32" />
            <Skeleton className="h-4 sm:h-5 w-20" />
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <Skeleton className="h-3 sm:h-4 w-24" />
            <Skeleton className="h-3 sm:h-4 w-16" />
            <Skeleton className="h-3 sm:h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
