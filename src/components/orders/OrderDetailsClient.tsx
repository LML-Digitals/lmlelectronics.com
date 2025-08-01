"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  CreditCard,
  Package,
  Mail,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import type { OrderDetails } from "@/types/api";
import { buildApiUrl, handleApiResponse } from "@/lib/config/api";
import { getOrderDetails } from "@/app/actions/orders";

interface OrderDetailsClientProps {
  orderId: string;
}

export default function OrderDetailsClient({
  orderId,
}: OrderDetailsClientProps) {
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const result = await getOrderDetails(orderId);

      // Extract the actual order data from the API response
      const orderData = result.data as unknown as OrderDetails;

      setOrder(orderData);
      setVerified(true);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to verify order. Please check your email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-300px)]">
        <div className="text-center space-y-20">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-secondary animate-pulse">
              Loading Order Details...
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Please wait while we fetch your order information
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if order is null after loading
  if (!loading && !order) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-300px)]">
        <div className="text-center space-y-20">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-secondary">
              Order Not Found
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We couldn't find the order details. Please check the order ID and
              try again.
            </p>
            <Link href="/orders">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // This should now only render when order exists
  if (!order) {
    return null;
  }

  const totalRefunded =
    order.refunds?.reduce((sum, refund) => sum + refund.amount, 0) || 0;

  // Helper function to safely format dates
  const formatDate = (
    dateString: string | null | undefined,
    formatString: string
  ) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return format(date, formatString);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "N/A";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-300px)]">
      <div className="text-center space-y-20">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-secondary animate-pulse">
            Order Details
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Order #{order.id} - {formatDate(order.createdAt, "MMMM d, yyyy")}
          </p>
        </div>

        <div className="max-w-6xl mx-auto text-left">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Main Order Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order Status</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Order Date</p>
                        <p className="text-gray-500">
                          {formatDate(
                            order.createdAt,
                            "MMMM d, yyyy 'at' h:mm a"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Store Location</p>
                        <p className="text-gray-500">
                          {order.storeLocation?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items?.length > 0 ? (
                      order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          {item.inventoryVariation?.inventoryItem?.image && (
                            <div className="w-16 h-16 relative">
                              <img
                                src={
                                  item.inventoryVariation.inventoryItem.image
                                }
                                alt={item.description}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium">{item.description}</h4>
                            <div className="text-sm text-gray-500">
                              Quantity: {item.quantity} × $
                              {item.price.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No items found in this order
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Name</p>
                        <p className="text-gray-500">
                          {order.customer?.firstName || ""}{" "}
                          {order.customer?.lastName || ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-500">
                          {order.customer?.email || ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-gray-500">
                          {order.customer?.phone || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.customer?.shippingAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Delivery Address</p>
                          <div className="text-gray-500 text-sm leading-relaxed">
                            {order.customer?.shippingAddress.fullName}
                            <br />
                            {order.customer?.shippingAddress.addressLine1}
                            {order.customer?.shippingAddress.addressLine2 && (
                              <>
                                <br />
                                {order.customer?.shippingAddress.addressLine2}
                              </>
                            )}
                            <br />
                            {order.customer?.shippingAddress.city},{" "}
                            {order.customer?.shippingAddress.state}{" "}
                            {order.customer?.shippingAddress.zipCode}
                          </div>
                        </div>
                      </div>
                      {order.customer?.shippingAddress.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">Contact Phone</p>
                            <p className="text-gray-500 text-sm">
                              {order.customer?.shippingAddress.phone}
                            </p>
                          </div>
                        </div>
                      )}
                      {order.customer?.shippingAddress.shippingMethod && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">Shipping Method</p>
                            <p className="text-gray-500 text-sm">
                              {order.customer?.shippingAddress.shippingMethod}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${(order.taxAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${(order.customer?.shippingAddress.shippingRate || 0).toFixed(2)}</span>
                    </div>
                    {(order.discountAmount || 0) > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-${(order.discountAmount || 0).toFixed(2)}</span>
                      </div>
                    )}
                    {totalRefunded > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Refunded</span>
                        <span>-${totalRefunded.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${(order.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Back to Orders */}
              {/* <div className="text-center">
                <Link href="/orders">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Orders
                  </Button>
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
