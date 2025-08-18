'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatSlug } from './utils/formatSlug';
import type { InventoryItemCategory } from '@/types/api';

export default function CategoryGrid ({
  categories,
}: {
  categories: InventoryItemCategory[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {categories.map((category) => (
        <Link
          href={`/shop/category/${formatSlug(category.name)}`}
          key={category.id}
          className="block"
        >
          <motion.div
            className="bg-gray-100 p-4 rounded-3xl"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative aspect-square mb-3 overflow-hidden rounded-md">
              <Image
                src={category.image || '/placeholder.svg'}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-gray-800 font-medium text-center">
              {category.name}
            </h3>
            {/* We don't have direct access to items count in the API type */}
            {category.visible && (
              <p className="text-center text-sm text-gray-500 mt-1">
                View Products
              </p>
            )}
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
