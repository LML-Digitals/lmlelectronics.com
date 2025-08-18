'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductCard from './ProductCard';
import type { InventoryItem } from '@/types/api';
import { buildApiUrl, handleApiResponse } from '@/lib/config/api';
import { getInventoryItems } from '@/components/dashboard/inventory/items/services/itemsCrud';

interface ProductListingProps {
  filters?: any;
  sort?: string;
  setResultsCount?: (count: number) => void;
}

function sortProducts (
  products: InventoryItem[],
  sort: string,
): InventoryItem[] {
  switch (sort) {
  case 'price_asc':
    return [...products].sort((a, b) => (a.variations[0]?.sellingPrice ?? 0)
          - (b.variations[0]?.sellingPrice ?? 0));
  case 'price_desc':
    return [...products].sort((a, b) => (b.variations[0]?.sellingPrice ?? 0)
          - (a.variations[0]?.sellingPrice ?? 0));
  case 'alpha_asc':
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  case 'alpha_desc':
    return [...products].sort((a, b) => b.name.localeCompare(a.name));
    // Add more cases as needed
  default:
    return products;
  }
}

export default function ProductListing ({
  filters = {},
  sort = 'alpha_asc',
  setResultsCount,
}: ProductListingProps) {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const items = (await getInventoryItems()) as unknown as InventoryItem[];

        // We should only return items that are visible and have stock.
        const visibleItems = items
          .map((item) => {
            const variations = item.variations.filter((v) => v.visible && v.stockLevels.some((sl) => sl.stock > 0));

            if (variations.length > 0 || item.isBundle) {
              // Always include bundles regardless of stock
              return { ...item, variations };
            }

            return null;
          })
          .filter((item) => item !== null);

        // Filter out items that should not appear in Featured Products
        const filteredItems = items.filter((item) => {
          const itemsToHide = [
            'Protective Case',
            'Screen Protectors',
            'Chargers',
          ];

          const shouldHide = itemsToHide.some((name) => item.name.toLowerCase().includes(name.toLowerCase()));

          return !shouldHide && item.variations.some((v) => v.visible);
        });

        setProducts(filteredItems);
        setFilteredProducts(filteredItems);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Apply sorting and update results count
  const sortedProducts = sortProducts(filteredProducts, sort);

  useEffect(() => {
    if (setResultsCount) {
      setResultsCount(sortedProducts.length);
    }
  }, [sortedProducts.length, setResultsCount]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Apply filters (placeholder for now)
  const filtered = sortedProducts; // TODO: apply filters from props

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Search Filter */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-secondary" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No products found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  description: product.description || undefined,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
