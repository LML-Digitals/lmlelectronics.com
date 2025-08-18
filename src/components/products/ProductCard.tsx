'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/useCartStore';
import { toast } from 'sonner';
import type { InventoryItem, InventoryVariation } from '@/types/api';

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    description?: string;
    image: string | null;
    variations: InventoryVariation[];
  };
};

export default function ProductCard ({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCartStore();

  // Get the default variation (first visible variation)
  const defaultVariation = product.variations[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!defaultVariation) { return; }

    const price = defaultVariation.sellingPrice;
    const tax = defaultVariation.tax || 0;
    const shipping = defaultVariation.shipping || 0;

    addItem({
      id: defaultVariation.id,
      name: product.name,
      type: 'product',
      description: product.description || '',
      price,
      profit: 0,
      discount: 0,
      shipping,
      tax,
      image: product.image || '',
      quantity: 1,
      total: price,
    });

    toast.success('Added to cart', {
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  if (!defaultVariation) { return null; }

  return (
    <Link href={`/shop/${product.id}`} className="block">
      <motion.div
        className="bg-gray-100 p-4 rounded-3xl"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative aspect-square mb-3 overflow-hidden rounded-md">
          <Image
            src={product.image || '/images/product-placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        <h3 className="text-gray-800 font-medium text-center line-clamp-1">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center justify-center">
          <span className="text-lg font-bold text-secondary">
            ${defaultVariation.sellingPrice.toFixed(2)}
          </span>
        </div>

        <Button
          variant="default"
          className="mt-3 w-full bg-secondary text-white hover:bg-secondary/80 transition-colors"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={16} className="mr-2" />
          Add to Cart
        </Button>
      </motion.div>
    </Link>
  );
}
