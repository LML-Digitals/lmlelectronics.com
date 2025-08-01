import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getOrderById } from "@/components/dashboard/pos/orders/services/pos-orders";
import { OrderActions } from "@/components/dashboard/pos/orders/OrderActions";
import { OrderRefunds } from "@/components/dashboard/pos/orders/OrderRefunds";
import { ArrowLeft, MapPin, User, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getOrderById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;
  const totalRefunded = order.refunds.reduce(
    (sum, refund) => sum + refund.amount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pos/orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order {order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground">
            {format(
              new Date(order.createdAt),
              "EEEE, MMMM d, yyyy 'at' h:mm a"
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b last:border-b-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{item.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {item.itemType}
                        </Badge>
                        {item.inventoryVariation && (
                          <span>SKU: {item.inventoryVariation.sku}</span>
                        )}
                        {item.ticketId && (
                          <span>Ticket: {item.ticketId.slice(-6)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        $
                        {item.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Refunds */}
          {order.refunds.length > 0 && <OrderRefunds refunds={order.refunds} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Actions */}
          <OrderActions order={order} />

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <StatusBadge status={order.status} />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    $
                    {order.subtotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {order.taxAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>
                      $
                      {order.taxAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}

                {order.discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">
                      -$
                      {order.discountAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}

                {order.tipAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tip</span>
                    <span>
                      $
                      {order.tipAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}

                {order.serviceChargeTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Service Charges
                    </span>
                    <span>
                      $
                      {order.serviceChargeTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}

                {order.paymentMethod === "Square Card" && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      $
                      {order.customer?.shippingAddress?.shippingRate.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>
                  $
                  {order.total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {totalRefunded > 0 && (
                <>
                  <div className="flex items-center justify-between text-destructive">
                    <span>Total Refunded</span>
                    <span>
                      -$
                      {totalRefunded.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span>Net Amount</span>
                    <span>
                      $
                      {(order.total - totalRefunded).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.email}
                </p>
                {order.customer.phone && (
                  <p className="text-sm text-muted-foreground">
                    {order.customer.phone}
                  </p>
                )}
              </div>
              {order.paymentMethod === "Square Card" && (
                <div className="flex flex-col gap-1">
                  <h1 className="text-lg font-medium mb-2">Shipping Address</h1>
                  <p className="text-sm text-muted-foreground">
                    {order.customer?.shippingAddress?.addressLine1}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer?.shippingAddress?.addressLine2}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer?.shippingAddress?.city}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer?.shippingAddress?.state}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer?.shippingAddress?.zipCode}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {order.paymentMethod || "Unknown"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.storeLocation.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>

              {order.squareTxnId && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Square Transaction ID
                  </p>
                  <p className="text-sm font-mono">{order.squareTxnId}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground">Staff Member</p>
                <p className="text-sm">
                  {order.staff ? `${order.staff.firstName} ${order.staff.lastName}` : "From Online Store"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PAID":
        return { variant: "default" as const, label: "Paid" };
      case "INVOICED":
        return { variant: "secondary" as const, label: "Invoiced" };
      case "REFUNDED":
        return { variant: "destructive" as const, label: "Refunded" };
      case "PARTIALLY_REFUNDED":
        return { variant: "outline" as const, label: "Partially Refunded" };
      default:
        return { variant: "outline" as const, label: status };
    }
  };

  const config = getStatusConfig(status);

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
