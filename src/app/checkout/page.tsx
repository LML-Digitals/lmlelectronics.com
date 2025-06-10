"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Lock,
  Truck,
  ArrowLeft,
  Shield,
  Check,
} from "lucide-react";

// Add Square SDK type declaration
declare global {
  interface Window {
    Square: any;
  }
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCartStore,
  useCartShippingCost,
  useCartTaxAmount,
  useCartDiscountAmount,
} from "@/store/cartStore";
import { formatPrice } from "../../types/product";
import { toast } from "sonner";

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  saveInfo: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const clearCart = useCartStore((state) => state.clearCart);

  const [form, setForm] = useState<CheckoutForm>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
    saveInfo: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [shippingCost, setShippingCost] = useState<number>(5.99);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [calculationsLoading, setCalculationsLoading] =
    useState<boolean>(false);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [cardForm, setCardForm] = useState<any>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Calculate shipping and tax based on address
  const shippingAddress =
    form.address && form.city && form.state && form.zipCode
      ? {
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
        }
      : undefined;

  const discountAmount = useCartDiscountAmount();

  const subtotal = getTotalPrice();
  const total = subtotal + shippingCost + taxAmount - discountAmount;

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push("/cart");
    }
  }, [cart.items.length, router]);

  // Load Square Web Payments SDK
  useEffect(() => {
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
  }, []);

  // Initialize Square payment form when SDK is loaded
  useEffect(() => {
    if (!squareLoaded || cardForm) return;

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
  }, [squareLoaded]);

  // Calculate shipping and tax when address changes
  useEffect(() => {
    if (!shippingAddress || cart.items.length === 0) {
      // Fallback to simple calculation
      const totalPrice = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setShippingCost(totalPrice >= 5000 ? 0 : 5.99); // 5000 cents = $50
      setTaxAmount(0);
      return;
    }

    const calculateCosts = async () => {
      setCalculationsLoading(true);
      try {
        const items = cart.items.map((item) => ({
          id: item.id,
          name: item.product.name,
          price: item.price / 100, // Convert from cents to dollars
          quantity: item.quantity,
          catalogObjectId: item.variationId,
        }));

        // Calculate shipping and tax in parallel
        const [shippingResponse, taxResponse] = await Promise.all([
          fetch("/api/calculate/shipping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items,
              shippingAddress,
              method: "STANDARD",
            }),
          }),
          fetch("/api/calculate/tax", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items, shippingAddress }),
          }),
        ]);

        const [shippingResult, taxResult] = await Promise.all([
          shippingResponse.json(),
          taxResponse.json(),
        ]);

        if (shippingResult.success) {
          setShippingCost(shippingResult.data.cost);
        }

        if (taxResult.success) {
          setTaxAmount(taxResult.data.totalTax);
        }
      } catch (error) {
        console.error("Failed to calculate costs:", error);
        // Fallback to simple calculation
        const totalPrice = cart.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        setShippingCost(totalPrice >= 5000 ? 0 : 5.99);
        setTaxAmount(0);
      } finally {
        setCalculationsLoading(false);
      }
    };

    calculateCosts();
  }, [shippingAddress, cart.items]);

  const handleInputChange = (
    field: keyof CheckoutForm,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const required = [
      "email",
      "firstName",
      "lastName",
      "address",
      "city",
      "state",
      "zipCode",
      "phone",
    ];

    for (const field of required) {
      if (!form[field as keyof CheckoutForm]) {
        toast.error(
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!cardForm) {
      toast.error(
        "Payment form not ready. Please wait a moment and try again."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Get payment token from the card form
      const tokenResult = await cardForm.tokenize();

      if (tokenResult.status !== "OK") {
        const errorMessage =
          tokenResult.errors?.[0]?.message ||
          "Failed to process payment method";
        throw new Error(errorMessage);
      }

      // Step 2: Create order with Square
      const orderData = {
        items: cart.items.map((item) => ({
          id: item.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          variationId: item.variationId,
        })),
        customer: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        },
        shipping: {
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
        },
        totals: {
          subtotal,
          shipping: shippingCost,
          tax: taxAmount,
          discount: discountAmount,
          total,
        },
      };

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const { orderId } = await orderResponse.json();

      // Step 3: Process payment with Square
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          orderId: orderId,
          amount: Math.round(total), // Amount in cents
          currency: "USD",
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Payment failed");
      }

      // Step 4: Success! Clear cart and redirect to order details
      setPaymentComplete(true);
      clearCart();
      toast.success("Payment processed successfully!");

      // Redirect to order details page after short delay
      // setTimeout(() => {
      //   router.push(`/orders/${orderId}`);
      // }, 2000);
      router.push(`/payment/success`);
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trust Bar */}
      <div
        className="text-black py-3"
        style={{
          background: "linear-gradient(135deg, #FDF200 0%, #D6CD00 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 text-sm font-medium">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Secure Checkout
            </div>
            <div className="flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              Fast Delivery
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              30-Day Returns
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Secure Checkout
              </h1>
              <p className="text-gray-600 mt-2">
                Complete your order for {getTotalItems()} items
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="hover:bg-yellow-50 hover:border-yellow-400"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Cart
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="xl:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50 rounded-t-lg border-b">
                  <CardTitle className="flex items-center text-lg">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-black font-bold"
                      style={{ backgroundColor: "#FDF200" }}
                    >
                      1
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="your@email.com"
                      className="mt-1 focus:ring-yellow-400 focus:border-yellow-400"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium"
                      >
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="mt-1 focus:ring-yellow-400 focus:border-yellow-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={form.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="mt-1 focus:ring-yellow-400 focus:border-yellow-400"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="(555) 123-4567"
                      className="mt-1 focus:ring-yellow-400 focus:border-yellow-400"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50 rounded-t-lg border-b">
                  <CardTitle className="flex items-center text-lg">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-black font-bold"
                      style={{ backgroundColor: "#FDF200" }}
                    >
                      2
                    </div>
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">
                      Street Address *
                    </Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="123 Main Street"
                      className="mt-1 focus:ring-yellow-400 focus:border-yellow-400"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium">
                        City *
                      </Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className="mt-1 focus:ring-yellow-400 focus:border-yellow-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium">
                        State *
                      </Label>
                      <Select
                        value={form.state}
                        onValueChange={(value) =>
                          handleInputChange("state", value)
                        }
                      >
                        <SelectTrigger className="mt-1 focus:ring-yellow-400 focus:border-yellow-400">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AL">Alabama</SelectItem>
                          <SelectItem value="WA">Washington</SelectItem>
                          <SelectItem value="AK">Alaska</SelectItem>
                          <SelectItem value="AZ">Arizona</SelectItem>
                          <SelectItem value="AR">Arkansas</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="CO">Colorado</SelectItem>
                          <SelectItem value="CT">Connecticut</SelectItem>
                          <SelectItem value="DE">Delaware</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="GA">Georgia</SelectItem>
                          <SelectItem value="HI">Hawaii</SelectItem>
                          <SelectItem value="ID">Idaho</SelectItem>
                          <SelectItem value="IL">Illinois</SelectItem>
                          <SelectItem value="IN">Indiana</SelectItem>
                          <SelectItem value="IA">Iowa</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          {/* Add more states as needed */}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode" className="text-sm font-medium">
                        ZIP Code *
                      </Label>
                      <Input
                        id="zipCode"
                        value={form.zipCode}
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
                        placeholder="12345"
                        className="mt-1 focus:ring-yellow-400 focus:border-yellow-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium">
                        Country *
                      </Label>
                      <Select
                        value={form.country}
                        onValueChange={(value) =>
                          handleInputChange("country", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          {/* <SelectItem value="CA">Canada</SelectItem> */}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 pt-4">
                    <Checkbox
                      id="saveInfo"
                      checked={form.saveInfo}
                      onCheckedChange={(checked) =>
                        handleInputChange("saveInfo", checked as boolean)
                      }
                    />
                    <Label htmlFor="saveInfo" className="text-sm font-medium">
                      Save this information for faster checkout next time
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50 rounded-t-lg border-b">
                  <CardTitle className="flex items-center text-lg">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-black font-bold"
                      style={{ backgroundColor: "#FDF200" }}
                    >
                      3
                    </div>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("card")}
                      className={`h-14 text-base ${
                        paymentMethod === "card" ? "text-black shadow-lg" : ""
                      }`}
                      style={
                        paymentMethod === "card"
                          ? { backgroundColor: "#FDF200" }
                          : {}
                      }
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Credit Card
                    </Button>
                    {/* <Button
                      type="button"
                      variant={
                        paymentMethod === "paypal" ? "default" : "outline"
                      }
                      onClick={() => setPaymentMethod("paypal")}
                      className={`h-14 text-base ${
                        paymentMethod === "paypal"
                          ? "text-black shadow-lg"
                          : ""
                      }`}
                      style={
                        paymentMethod === "paypal"
                          ? { backgroundColor: "#FDF200" }
                          : {}
                      }
                    >
                      PayPal
                    </Button> */}
                  </div>

                  {/* Square Payment Form */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
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
                    </div>
                  )}

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Your payment information is protected with 256-bit SSL
                      encryption
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="xl:col-span-1">
              <Card className="sticky top-8 shadow-lg">
                <CardHeader
                  className="text-black rounded-t-lg p-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #FDF200 0%, #D6CD00 100%)",
                  }}
                >
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                  <p className="text-sm opacity-80">
                    {getTotalItems()} items in your order
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Order Items */}
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={
                              item.product.images?.[0]?.url ||
                              "/placeholder-product.svg"
                            }
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <div className="text-right">
                        <span className="font-semibold">
                          {shippingCost > 0
                            ? "$" + formatPrice(Math.round(shippingCost * 100))
                            : "$0.00"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <div className="text-right">
                        <span className="font-semibold">
                          {taxAmount > 0
                            ? formatPrice(Math.round(taxAmount * 100))
                            : "$0.00"}
                        </span>
                        {calculationsLoading && (
                          <div className="text-xs text-gray-500">
                            Calculating...
                          </div>
                        )}
                      </div>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded">
                        <span className="font-medium">Discount</span>
                        <span className="font-semibold">
                          -{formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !cardForm || paymentComplete}
                    className="w-full text-black font-bold text-lg py-4 shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
                    size="lg"
                    style={{ backgroundColor: "#FDF200" }}
                  >
                    {paymentComplete ? (
                      <div className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span>Payment Successful!</span>
                      </div>
                    ) : isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Processing Payment...</span>
                      </div>
                    ) : !cardForm ? (
                      "Loading Payment Form..."
                    ) : (
                      `Pay Now • ${formatPrice(total)}`
                    )}
                  </Button>

                  <div className="text-center text-xs text-gray-500 space-y-2">
                    <p>
                      By placing your order, you agree to our Terms of Service
                      and Privacy Policy.
                    </p>
                    <div className="flex items-center justify-center space-x-4 pt-2">
                      <div className="flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        SSL Secured
                      </div>
                      <div className="flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Money Back Guarantee
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
