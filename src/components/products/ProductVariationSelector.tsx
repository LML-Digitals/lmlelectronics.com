"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCartStore } from "@/lib/stores/useCartStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

type Variation = {
  id: string;
  name?: string;
  sku: string;
  image?: string | null;
  sellingPrice: number;
  shipping?: number;
  tax?: number;
};

type ProductVariationSelectorProps = {
  product: {
    id: string;
    name: string;
    description?: string;
    image?: string | null;
    variations: Variation[];
  };
};

export default function ProductVariationSelector({
  product,
}: ProductVariationSelectorProps) {
  // Set first variation as default selected variation
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(
    product.variations && product.variations.length > 0
      ? product.variations[0]
      : null
  );

  const { addItem } = useCartStore();

  const handleVariationClick = (variation: Variation) => {
    setSelectedVariation(variation);
  };

  const handleAddToCart = () => {
    if (!selectedVariation) return;

    const price = selectedVariation.sellingPrice;
    const tax = selectedVariation.tax || 0;
    const shipping = selectedVariation.shipping || 0;

    addItem({
      id: selectedVariation.id,
      name: selectedVariation.name || product.name,
      type: "product",
      description: product.description || "",
      price,
      profit: 0,
      discount: 0,
      shipping,
      tax,
      image: selectedVariation.image || product.image || "",
      quantity: 1,
      total: price,
    });

    toast.success("Added to cart", {
      description: `${
        selectedVariation.name || product.name
      } has been added to your cart.`,
      duration: 3000,
    });
  };

  return (
    <>
      {/* Product Details */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Product Image */}
        <div className="flex-1">
          <div className="bg-gray-100 rounded-3xl overflow-hidden p-6">
            <div className="relative aspect-square">
              <Image
                src={
                  selectedVariation?.image ||
                  product.image ||
                  "/images/product-placeholder.jpg"
                }
                alt={selectedVariation?.name || product.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          {selectedVariation?.name &&
            selectedVariation.name !== product.name && (
              <h2 className="text-xl text-gray-600 mt-1">
                {selectedVariation.name}
              </h2>
            )}

          {/* Price */}
          <div className="mt-4">
            <p className="text-3xl font-bold text-secondary">
              ${selectedVariation?.sellingPrice?.toFixed(2) || "0.00"}
            </p>
          </div>

          {/* Variation Options - Amazon Style */}
          {product.variations && product.variations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Choose an Option:</h3>
              <div className="flex flex-wrap gap-3">
                {product.variations.map((variation) => (
                  <button
                    key={variation.id}
                    onClick={() => handleVariationClick(variation)}
                    className={`
                      px-4 py-2 rounded-lg border text-left min-w-[120px]
                      ${
                        selectedVariation?.id === variation.id
                          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-300"
                          : "border-gray-300 bg-white hover:border-blue-400"
                      }
                      transition
                    `}
                  >
                    <div className="font-semibold">{variation.name}</div>
                    <div className="text-sm text-gray-500">
                      ${variation.sellingPrice.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium">Details:</h3>
            <p className="text-gray-600 mt-1">
              {product.description || "No detailed description available."}
            </p>
          </div>

          {/* Add to Cart */}
          <div className="mt-8">
            {selectedVariation && (
              <Button
                variant="default"
                className="w-full bg-secondary text-white hover:bg-secondary/80 transition-colors"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
