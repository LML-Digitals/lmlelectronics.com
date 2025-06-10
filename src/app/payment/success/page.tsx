"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  Mail,
  ArrowRight,
  Home,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "../../../types/product";
import { SquareOrder } from "@/types/square";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<SquareOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/orders?orderId=${orderId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch order");
        }

        if (result.success && result.order) {
          setOrder(result.order);
        } else {
          throw new Error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load order details";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const calculateOrderTotal = (order: SquareOrder): number => {
    if (order.totalMoney?.amount) {
      return Number(order.totalMoney.amount);
    }

    // Fallback: calculate from line items
    return (
      order.lineItems?.reduce((total, item) => {
        const itemTotal = item.totalMoney?.amount
          ? Number(item.totalMoney.amount)
          : 0;
        return total + itemTotal;
      }, 0) || 0
    );
  };

  const getCustomerInfo = (order: SquareOrder) => {
    // Extract customer info from metadata
    const metadata = order.metadata || {};
    return {
      name: metadata.customerName || "Customer",
      email: metadata.customerEmail || "customer@example.com",
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">
              {error === "Order not found"
                ? "Order Not Found"
                : "Error Loading Order"}
            </h2>
            <p className="text-gray-600 mb-4">
              {error || "We encountered an issue loading your order details."}
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
              <Button onClick={() => router.push("/")} className="w-full">
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderTotal = calculateOrderTotal(order);
  const customerInfo = getCustomerInfo(order);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We'll send you a confirmation email
            shortly.
          </p>
        </div>

        <div className="space-y-6">
          {/* Order Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-mono text-sm font-medium">
                    {order.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span>{customerInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{customerInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span>{order.lineItems?.length || 0} item(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {order.state === "COMPLETED"
                      ? "Confirmed"
                      : order.state || "Processing"}
                  </span>
                </div>

                {/* Line Items */}
                {order.lineItems && order.lineItems.length > 0 && (
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Order Items:
                    </h4>
                    <div className="space-y-2">
                      {order.lineItems.map((item, index) => (
                        <div
                          key={item.uid || index}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>
                            {item.totalMoney
                              ? formatPrice(
                                  Number(item.totalMoney.amount),
                                  item.totalMoney.currency
                                )
                              : "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Paid:</span>
                    <span className="text-green-600">
                      {formatPrice(orderTotal, order.totalMoney?.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Order Confirmation Email
                    </h4>
                    <p className="text-sm text-gray-600">
                      We'll send you an email confirmation with your order
                      details and tracking information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Processing</h4>
                    <p className="text-sm text-gray-600">
                      Your order will be processed within 1-2 business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Shipping</h4>
                    <p className="text-sm text-gray-600">
                      Once shipped, you'll receive a tracking number to monitor
                      your package's progress.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Support */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you have any questions about your order, our customer
                  support team is here to help.
                </p>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    <a
                      href="mailto:support@lmlelectronics.com"
                      className="text-blue-600 hover:text-blue-500"
                    >
                      support@lmlelectronics.com
                    </a>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span>{" "}
                    <a
                      href="tel:+1-555-123-4567"
                      className="text-blue-600 hover:text-blue-500"
                    >
                      +1 (555) 123-4567
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/products" className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
