'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Loader2,
  ShoppingCart,
  CheckCircle,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';
import { useCartStore } from '@/lib/stores/useCartStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StoreLocation } from '@/types/api';
import { buildApiUrl, handleApiResponse } from '@/lib/config/api';
import { calculateTax } from '@/lib/config/tax';
import { calculateShipping } from '@/lib/config/shipping';
import SquarePaymentForm, { SquarePaymentFormRef } from './SquarePaymentForm';
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmation';
import { getStoreLocations } from '@/components/locations/services/storeLocationCrud';
import { createOrderFromCheckout } from '@/app/actions/checkout';

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
}

const CheckoutClient = () => {
  const router = useRouter();
  const {
    items,
    clearCart,
    calculatedTax,
    setCalculatedTax,
    calculatedShipping,
    setCalculatedShipping,
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const paymentFormRef = useRef<SquarePaymentFormRef>(null);

  // Form states
  const [customerForm, setCustomerForm] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);

  // Calculate tax when subtotal changes
  useEffect(() => {
    const updateTax = async () => {
      try {
        const taxAmount = await calculateTax(subtotal);

        setCalculatedTax(taxAmount);
      } catch (error) {
        console.error('Error calculating tax:', error);
        toast.error('Failed to calculate tax');
        setCalculatedTax(0);
      }
    };

    if (subtotal > 0) {
      updateTax();
    } else {
      setCalculatedTax(0);
    }
  }, [subtotal, setCalculatedTax]);

  // Calculate shipping when state changes
  useEffect(() => {
    const updateShipping = async () => {
      if (!customerForm.state) { return; }

      try {
        const shippingCost = await calculateShipping(customerForm.state.toUpperCase());

        setCalculatedShipping(shippingCost);
      } catch (error) {
        console.error('Error calculating shipping:', error);
        toast.error('Failed to calculate shipping');
        setCalculatedShipping(0);
      }
    };

    updateShipping();
  }, [customerForm.state, setCalculatedShipping]);

  let total = subtotal + calculatedTax + calculatedShipping;

  total = Math.max(0, total);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Load store locations
  useEffect(() => {
    const fetchLocations = async () => {
      const data = await getStoreLocations();

      setLocations(data as unknown as StoreLocation[]);
    };

    fetchLocations();
  }, []);

  // Redirect if cart is empty (but not during order completion)
  useEffect(() => {
    if (items.length === 0 && !orderCompleted) {
      router.push('/cart');
    }
  }, [items.length, router, orderCompleted]);

  // Handle state field validation
  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();

    // Only allow letters and limit to 2 characters
    if (/^[A-Z]*$/.test(value) && value.length <= 2) {
      setCustomerForm({
        ...customerForm,
        state: value,
      });
    }
  };

  // Handle complete purchase process
  const handleCompletePurchase = async () => {
    if (!paymentToken) {
      // If no payment token, verify payment first
      if (paymentFormRef.current) {
        try {
          await paymentFormRef.current.handlePayment();
          // The onPaymentSuccess callback will set the paymentToken and trigger placeOrder
        } catch (error) {
          console.error('Payment verification failed:', error);
        }
      }
    } else {
      // If payment token exists, place order directly
      await placeOrder();
    }
  };

  // Refactored: Place order logic
  const placeOrder = async (token?: string) => {
    // Use the provided token if passed (from payment success), otherwise use state
    const paymentTokenToUse = token || paymentToken;

    if (!paymentTokenToUse) {
      toast.error('Please complete payment to place order');

      return;
    }

    // Form validation
    const requiredFields = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone',
      addressLine1: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'Zip code',
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!customerForm[field as keyof CustomerFormData]) {
        toast.error(`${label} is required`);

        return;
      }
    }

    setLoading(true);
    try {
      const checkoutData = {
        items,
        paymentMethod: 'Square',
        paymentToken: paymentTokenToUse,
        customerId: null,
        shippingAddress: {
          fullName: `${customerForm.firstName} ${customerForm.lastName}`,
          addressLine1: customerForm.addressLine1,
          addressLine2: customerForm.addressLine2,
          city: customerForm.city,
          state: customerForm.state,
          zipCode: customerForm.zipCode,
          phone: customerForm.phone,
          shippingMethod: 'Standard',
          shippingRate: calculatedShipping,
        },
        customerData: {
          firstName: customerForm.firstName,
          lastName: customerForm.lastName,
          email: customerForm.email,
          phone: customerForm.phone,
        },
        subtotal,
        taxAmount: calculatedTax,
        total,
        discountAmount: 0,
        isGuestCheckout: true,
      };

      const checkoutDataWithPayment = {
        ...checkoutData,
        paymentMethod: 'Square Card',
      };

      const result = await createOrderFromCheckout(checkoutDataWithPayment);
      const data = result;

      toast.success(`Order #${data.orderId} has been created`);

      // Send order confirmation email
      try {
        await sendOrderConfirmationEmail({
          to: customerForm.email,
          orderId: data.orderId as string,
          customerName: `${customerForm.firstName} ${customerForm.lastName}`,
          orderDetailsHtml: `
            <ul style='padding-left:20px;'>
              ${items
    .map((item) => `<li>${item.quantity} × ${item.name} - $${item.total.toFixed(2)}</li>`)
    .join('')}
            </ul>
            <p style='font-weight:bold;'>Shipping: $${calculatedShipping.toFixed(2)}</p>
            <p style='font-weight:bold;'>Tax: $${calculatedTax.toFixed(2)}</p>
            <p style='font-weight:bold;'>Total: $${total.toFixed(2)}</p>
          `,
        });
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }

      // Set order completed flag to prevent cart redirect
      setOrderCompleted(true);
      clearCart();
      router.push(`/orders/${data.orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if cart is empty (will redirect)
  if (items.length === 0 && !orderCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 rounded-3xl mb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* <Button
            variant="ghost"
            className="mb-4 hover:bg-transparent p-0 text-gray-600 hover:text-gray-900"
            onClick={() => router.push("/cart")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button> */}
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order below</p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Checkout Form - 70% */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Customer Information Form */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center">
                  <CreditCard className="h-6 w-6 mr-3 text-secondary" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={customerForm.firstName}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        firstName: e.target.value,
                      })
                      }
                      className="mt-1"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={customerForm.lastName}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        lastName: e.target.value,
                      })
                      }
                      className="mt-1"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({
                      ...customerForm,
                      email: e.target.value,
                    })
                    }
                    className="mt-1"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({
                      ...customerForm,
                      phone: e.target.value,
                    })
                    }
                    className="mt-1"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>

                {/* Shipping Address */}
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ArrowLeft className="h-5 w-5 mr-2 text-secondary rotate-180" />
                    Shipping Address
                  </h3>

                  <div>
                    <Label
                      htmlFor="addressLine1"
                      className="text-sm font-medium text-gray-700"
                    >
                      Street Address
                    </Label>
                    <Input
                      id="addressLine1"
                      value={customerForm.addressLine1}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        addressLine1: e.target.value,
                      })
                      }
                      className="mt-1"
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="addressLine2"
                      className="text-sm font-medium text-gray-700"
                    >
                      Apartment, suite, etc. (optional)
                    </Label>
                    <Input
                      id="addressLine2"
                      value={customerForm.addressLine2}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        addressLine2: e.target.value,
                      })
                      }
                      className="mt-1"
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="city"
                        className="text-sm font-medium text-gray-700"
                      >
                        City
                      </Label>
                      <Input
                        id="city"
                        value={customerForm.city}
                        onChange={(e) => setCustomerForm({
                          ...customerForm,
                          city: e.target.value,
                        })
                        }
                        className="mt-1"
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="state"
                        className="text-sm font-medium text-gray-700"
                      >
                        State
                      </Label>
                      <Input
                        id="state"
                        value={customerForm.state}
                        onChange={handleStateChange}
                        className="mt-1"
                        placeholder="NY"
                        maxLength={2}
                        required
                      />
                    </div>
                  </div>

                  <div className="max-w-xs">
                    <Label
                      htmlFor="zipCode"
                      className="text-sm font-medium text-gray-700"
                    >
                      ZIP Code
                    </Label>
                    <Input
                      id="zipCode"
                      value={customerForm.zipCode}
                      onChange={(e) => setCustomerForm({
                        ...customerForm,
                        zipCode: e.target.value,
                      })
                      }
                      className="mt-1"
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Order Summary & Payment - 30% */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Order Summary */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="pb-6 rounded-t-lg">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-3 text-secondary" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Order Items */}
                  <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="font-semibold text-gray-900 ml-4">
                          ${item.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="mb-6" />

                  {/* Order Totals */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Subtotal ({totalItems} items)
                      </span>
                      <span className="font-medium text-gray-900">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-gray-900">
                        ${calculatedTax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-gray-900">
                        ${calculatedShipping.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  <div className="flex justify-between text-lg font-bold mb-8 p-4 bg-secondary/10 rounded-lg">
                    <span className="text-gray-900">Total</span>
                    <span className="text-secondary">${total.toFixed(2)}</span>
                  </div>

                  {/* Payment Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-secondary" />
                      Payment
                    </h3>

                    <SquarePaymentForm
                      ref={paymentFormRef}
                      applicationId={
                        process.env.NEXT_PUBLIC_SQUARE_APP_ID || ''
                      }
                      locationId={
                        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ''
                      }
                      total={total}
                      onPaymentSuccess={(token) => {
                        setPaymentToken(token);
                        // After payment is verified, place the order
                        placeOrder(token);
                      }}
                      disabled={loading}
                      environment={
                        (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT as
                          | 'sandbox'
                          | 'production') || 'sandbox'
                      }
                    />

                    <Button
                      className="w-full h-12 text-lg text-black font-semibold bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/80 hover:to-secondary shadow-lg transition-all duration-200 transform hover:scale-105"
                      onClick={handleCompletePurchase}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Complete Purchase Now • ${total.toFixed(2)}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-3">
                      Your payment information is secure and encrypted
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutClient;
