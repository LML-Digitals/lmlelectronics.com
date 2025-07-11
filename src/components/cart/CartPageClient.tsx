"use client";

import { useCartStore } from "@/lib/stores/useCartStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateTax } from "@/lib/config/tax";
import { useEffect } from "react";

export default function CartPageClient() {
  const router = useRouter();
  const { items, updateItemQuantity, removeItem, clearCart, setCalculatedTax } = useCartStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Update calculations to match the logic in CartComponent.tsx
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);

  const tax = 0;

  const shipping = 0;

  // Calculate total
  let total = subtotal;


  // Ensure total is not negative
  total = Math.max(0, total);

  const handleProceedToCheckout = () => {
    // Simply navigate to checkout - authentication and payment will be handled there
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 mb-20 mt-10">
      <div className="md:col-span-2">
        <Card className="p-6">
          <div className="space-y-6">
            {items.map((item) => (
              <>
                <div key={item.id} className="flex gap-4">
                  <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gray-100">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-gray-500">
                      ${item.price.toFixed(2)}
                      
                      
                    </p>
                    <div className="flex items-center mt-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-secondary"
                        onClick={() =>
                          updateItemQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-4 w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-secondary"
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="ml-auto font-medium">
                        ${item.total.toFixed(2)}
                        
                      </span>
                    </div>
                  </div>
                </div>
                <Separator className="my-6 border-secondary" />
              </>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => clearCart()}>
              Clear Cart
            </Button>
            <Button asChild variant="outline" className="border-secondary">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </Card>
      </div>

      <div className="md:col-span-1">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          {/* Order Details */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">
                Subtotal ({totalItems} items)
              </span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between my-4 text-lg font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <Button
            className="w-full bg-secondary hover:bg-secondary"
            size="lg"
            onClick={handleProceedToCheckout}
          >
            Proceed to Checkout
          </Button>
        </Card>
      </div>
    </div>
  );
}
