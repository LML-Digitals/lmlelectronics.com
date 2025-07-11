"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/lib/stores/useCartStore";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";

export default function CartDrawer() {
  const { items, updateItemQuantity, removeItem } = useCartStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-[1.2rem] w-[1.2rem]" />
          {totalItems > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-black"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({totalItems} items)
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-500">
              Your cart is empty
            </h3>
            <p className="text-gray-400 mt-2">Add some products to your cart</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 h-[calc(100vh-12rem)]">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {item.image && (
                      <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">${item.price}</p>
                      <div className="flex items-center mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateItemQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t py-4 space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <Link href="/cart">
                <Button className="w-full">
                  View Cart
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
