"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  CreditCard,
  Lock,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "../../../types/product";
import { toast } from "sonner";
import { SquareOrder } from "@/types/square";
import { getCustomerById } from "@/lib/square/customers";

// Add Square SDK type declaration
declare global {
  interface Window {
    Square: any;
  }
}

interface PaymentPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{
    orderId: string;
  } | null>(null);
  const [order, setOrder] = useState<SquareOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [cardForm, setCardForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    // Resolve params
    params.then((p) => {
      setResolvedParams(p);
    });
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;

    // Load Square Web Payments SDK
    const loadSquareSDK = () => {
      if (window.Square) {
        setSquareLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://web.squarecdn.com/v1/square.js";
      script.onload = () => setSquareLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Square SDK");
        toast.error("Payment system unavailable. Please try again later.");
      };
      document.head.appendChild(script);
    };

    loadSquareSDK();
    fetchOrder();
  }, [resolvedParams]);

  // Create Square payment form when SDK is loaded and order is available
  useEffect(() => {
    if (!squareLoaded || !order || cardForm) return;

    const initializeSquareForm = async () => {
      try {
        const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
        const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

        if (!applicationId || !locationId) {
          console.error("Square configuration missing");
          toast.error("Payment system configuration error");
          return;
        }

        const payments = window.Square.payments(applicationId, locationId);
        const card = await payments.card();
        await card.attach("#card-container");
        setCardForm(card);
      } catch (error) {
        console.error("Error initializing Square payment form:", error);
        toast.error("Failed to load payment form");
      }
    };

    initializeSquareForm();
  }, [squareLoaded, order, cardForm]);

  const fetchOrder = async () => {
    if (!resolvedParams) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/orders?orderId=${resolvedParams.orderId}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch order");
      }

      if (result.success && result.order) {
        setOrder(result.order);
        const customer = await getCustomerById(result.order.customerId || "");
        setCustomerInfo({
          name: customer?.givenName || customer?.familyName || "Customer",
          email: customer?.emailAddress || "customer@example.com",
        });
      } else {
        throw new Error("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load order details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateOrderTotal = (order: SquareOrder): number => {
    if (order.totalMoney?.amount) {
      // Square amounts are already in cents, so we return them as-is for calculations
      // but we'll divide by 100 only when displaying with formatPrice
      const totalInCents = Number(order.totalMoney.amount);
      // console.log("Order total calculation:", {
      //   rawAmount: order.totalMoney.amount,
      //   totalInCents,
      //   currency: order.totalMoney.currency,
      //   formattedForDisplay: formatPrice(
      //     totalInCents,
      //     order.totalMoney.currency
      //   ),
      // });
      return totalInCents / 100;
    }

    // Fallback: calculate from line items
    const fallbackTotal =
      order.lineItems?.reduce((total, item) => {
        const itemTotal = item.totalMoney?.amount
          ? Number(item.totalMoney.amount)
          : 0;
        return total + itemTotal;
      }, 0) || 0;

    console.log("Using fallback total calculation:", fallbackTotal);
    return fallbackTotal;
  };

  const getCustomerInfo = async (order: SquareOrder): Promise<{
    name: string;
    email: string;
  }> => {
    // For now, return placeholder values since customer info might be in metadata
    // In a real implementation, you might fetch customer details separately
    const customer = await getCustomerById(order.customerId || "");
    // const metadata = order.metadata || {};
    return {
      name: customer?.givenName || customer?.familyName || "Customer",
      email: customer?.emailAddress || "customer@example.com",
    };
  };

  const handlePayment = async () => {
    if (!order || !cardForm) {
      toast.error(
        "Payment form not ready. Please wait a moment and try again."
      );
      return;
    }

    setIsProcessing(true);

    try {
      // Get payment token from the card form
      const tokenResult = await cardForm.tokenize();

      if (tokenResult.status === "OK") {
        // Process payment with Square
        const orderTotal = calculateOrderTotal(order);

        const paymentResponse = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceId: tokenResult.token,
            orderId: order.id,
            amount: orderTotal, // Amount is already in cents
            currency: order.totalMoney?.currency || "USD",
          }),
        });

        const paymentResult = await paymentResponse.json();

        if (paymentResult.success) {
          setPaymentComplete(true);
          toast.success("Payment processed successfully!");

          // Redirect to success page after delay
          setTimeout(() => {
            router.push(`/payment/success?orderId=${resolvedParams?.orderId}`);
          }, 2000);
        } else {
          throw new Error(paymentResult.error || "Payment failed");
        }
      } else {
        const errorMessage =
          tokenResult.errors?.[0]?.message ||
          "Failed to process payment method";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
              {error ||
                "The order you're looking for doesn't exist or has expired."}
            </p>
            <div className="space-y-2">
              <Button onClick={fetchOrder} variant="outline" className="w-full">
                Try Again
              </Button>
              <Button onClick={() => router.push("/cart")} className="w-full">
                Return to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your payment has been processed successfully. You will be
              redirected shortly.
            </p>
            <div className="animate-pulse text-blue-600">Redirecting...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderTotal = calculateOrderTotal(order);
  // const customerInfo = await getCustomerInfo(order);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-sm">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span>{customerInfo?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{customerInfo?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span>{order.lineItems?.length || 0} item(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {order.state || "PENDING"}
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
                                  Number(item.totalMoney.amount) / 100,
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
                    <span>Total:</span>
                    <span className="text-green-600">
                      {formatPrice(orderTotal, order.totalMoney?.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Square Payment Form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Information
                  </label>
                  <div
                    id="card-container"
                    className="bg-white border border-gray-300 rounded-lg p-4 min-h-[60px]"
                    style={{ minHeight: "60px" }}
                  >
                    {!cardForm && (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        {squareLoaded
                          ? "Loading payment form..."
                          : "Loading Square SDK..."}
                      </div>
                    )}
                  </div>
                </div>

                {/* Process Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !cardForm}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    `Pay ${formatPrice(orderTotal, order.totalMoney?.currency)}`
                  )}
                </Button>

                <div className="text-center text-xs text-gray-500">
                  <p>
                    By clicking "Pay", you agree to our Terms of Service and
                    Privacy Policy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <h4 className="font-medium text-blue-900">Secure Checkout</h4>
                <p className="text-sm text-blue-700">
                  Your payment is protected by industry-standard SSL encryption
                  and processed securely by Square.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
