"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types/product";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: Product;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function AddToCartButton({
  product,
  variant = "default",
  size = "default",
  className = "",
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    if (!product.variations?.[0]) {
      toast.error("Product variation not available");
      return;
    }

    const variation = product.variations[0];

    // Check if product is in stock
    if (!product.inStock && !variation.inStock) {
      toast.error("Product is currently out of stock");
      return;
    }

    setIsLoading(true);

    try {
      addItem(product, variation.id, quantity);

      toast.success(`Added ${quantity} ${product.name} to cart`);
      setQuantity(1); // Reset quantity after adding
    } catch {
      toast.error("Failed to add item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Quantity Selector */}
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-700">Quantity:</span>
        <div className="flex items-center border border-gray-300 rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="h-8 w-8 p-0"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={incrementQuantity}
            disabled={quantity >= 99}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={
          isLoading ||
          !product.variations?.[0]?.price ||
          (!product.inStock && !product.variations?.[0]?.inStock)
        }
        variant={variant}
        size={size}
        className="w-full cursor-pointer"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Adding...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </div>
        )}
      </Button>
    </div>
  );
}
