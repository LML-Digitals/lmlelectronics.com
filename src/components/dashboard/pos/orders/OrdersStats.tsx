import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderStats } from "@/components/dashboard/pos/orders/services/pos-orders";
import { DollarSign, ShoppingCart, TrendingUp, CreditCard } from "lucide-react";

export async function OrdersStats() {
  const result = await getOrderStats();

  if (!result.success || !result.data) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Failed to load statistics
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    statusBreakdown,
    paymentMethodBreakdown,
  } = result.data;

  const paidOrders = statusBreakdown["PAID"] || 0;
  const refundedOrders = statusBreakdown["REFUNDED"] || 0;

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            $
            {totalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            From {totalOrders} total orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            {totalOrders.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {paidOrders} paid, {refundedOrders} refunded
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Order Value
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            $
            {averageOrderValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-muted-foreground">Per completed order</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            {Object.keys(paymentMethodBreakdown).length}
          </div>
          <p className="text-xs text-muted-foreground">
            {paymentMethodBreakdown["Credit Card"] || 0} card,{" "}
            {paymentMethodBreakdown["Cash"] || 0} cash
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
