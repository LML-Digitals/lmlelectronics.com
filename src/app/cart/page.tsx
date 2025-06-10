"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Shield,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useCartStore,
  useCartShippingCost,
  useCartDiscountAmount,
} from "@/store/cartStore";
import { formatPrice } from "../../types/product";

export default function CartPage() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const { cost: shippingCost } = useCartShippingCost();
  const discountAmount = useCartDiscountAmount();

  const [isLoading, setIsLoading] = useState(false);

  const subtotal = getTotalPrice();
  const total = subtotal + shippingCost - discountAmount;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    setIsLoading(true);
    // Use Next.js router for navigation
    router.push("/checkout");
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center space-y-6">
            <div
              className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#FDF200" }}
            >
              <ShoppingBag className="w-16 h-16 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your cart is empty
              </h1>
              <p className="text-gray-600 text-lg">
                Discover our amazing repair kits and components to get started.
              </p>
            </div>
            <Link href="/products">
              <Button
                size="lg"
                className="text-black font-semibold shadow-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#FDF200" }}
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}{" "}
                ready for checkout
              </p>
            </div>
            <Link href="/products">
              <Button
                variant="outline"
                size="lg"
                className="hover:bg-yellow-50 hover:border-yellow-400"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="xl:col-span-2 space-y-4">
            {cart.items.map((item, index) => (
              <Card
                key={item.id}
                className="p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-6">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <Image
                      src={
                        item.product.images?.[0]?.url ||
                        "/placeholder-product.svg"
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {formatPrice(item.price)} each
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Fast Shipping
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="h-8 w-8 p-0 hover:bg-white rounded-full"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold text-lg">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="h-8 w-8 p-0 hover:bg-white rounded-full"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-bold text-xl text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>

              {/* Trust Badges */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1 text-green-600" />
                  Secure Checkout
                </div>
                <div className="flex items-center">
                  <Truck className="w-4 h-4 mr-1 text-blue-600" />
                  Fast Delivery
                </div>
              </div>
            </div>
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
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Subtotal ({getTotalItems()} items)
                    </span>
                    <span className="font-semibold text-lg">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <div className="text-right">
                      <span className="font-semibold">
                        {shippingCost > 0 ? formatPrice(shippingCost) : 0}
                      </span>
                    </div>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 bg-green-50 p-3 rounded-lg">
                      <span className="font-medium">Discount Applied</span>
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
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full text-black font-bold text-lg py-3 shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
                  size="lg"
                  style={{ backgroundColor: "#FDF200" }}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>

                {/* Security & Shipping Info */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>256-bit SSL secure checkout</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="text-center text-xs text-gray-500 pt-2">
                    30-day return policy • Expert customer support
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
