'use client';
import React, { useState } from 'react';
import Filters, { FiltersState } from '@/components/products/Filters';
import ProductListing from '@/components/products/ProductListing';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_desc', label: 'Price (High–Low)' },
  { value: 'price_asc', label: 'Price (Low–High)' },
  { value: 'alpha_asc', label: 'Alphabetical (A–Z)' },
  { value: 'alpha_desc', label: 'Alphabetical (Z–A)' },
];

export default function ProductsClientPage ({ categories }: { categories: { id: string; name: string }[] }) {
  const [filters, setFilters] = useState<FiltersState>({});
  const [sort, setSort] = useState<string>('alpha_asc');
  const [resultsCount, setResultsCount] = useState<number>(0);

  const handleClearAll = () => setFilters({});

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Filters Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <Filters filters={filters} onChange={setFilters} categories={categories} />
      </div>
      {/* Product List */}
      <div className="flex-1">
        {/* Top bar: results count, clear all, sort dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-6">
            <span className="text-gray-600 text-base">{resultsCount} results</span>
            <button
              className="text-sm underline text-black hover:text-primary focus:outline-none"
              onClick={handleClearAll}
              type="button"
            >
              Clear all
            </button>
          </div>
          <div>
            <select
              className="border rounded px-4 py-2 text-base"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <ProductListing
          filters={filters}
          sort={sort}
          setResultsCount={setResultsCount}
        />
      </div>
    </div>
  );
}
