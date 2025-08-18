'use client';
import React from 'react';

export type FiltersState = {
  category?: string;
  priceRange?: [number, number];
  availability?: string;
  deals?: boolean;
};

export default function Filters ({
  filters,
  onChange,
  categories = [],
}: {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  categories?: { id: string; name: string }[];
}) {
  return (
    <aside className="w-full md:w-64 mb-8 md:mb-0 md:mr-8">
      <div className="bg-white rounded-lg shadow p-6 sticky top-24">
        <h2 className="text-lg font-bold mb-6">Browse by category</h2>
        <ul className="mb-8">
          <li>
            <button
              className={`block w-full text-left py-1.5 px-2 rounded font-semibold ${!filters.category ? 'text-black' : 'text-gray-700'}`}
              onClick={() => onChange({ ...filters, category: undefined })}
            >
              All Items
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                className={`block w-full text-left py-1.5 px-2 rounded ${filters.category === cat.id ? 'font-bold text-black' : 'text-gray-700'}`}
                onClick={() => onChange({ ...filters, category: cat.id })}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Price range ($)</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={0}
              placeholder="Min"
              className="w-20 px-2 py-1 border rounded"
              value={filters.priceRange?.[0] ?? ''}
              onChange={e => onChange({ ...filters, priceRange: [Number(e.target.value) || 0, filters.priceRange?.[1] ?? 0] })}
            />
            <span>-</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              className="w-20 px-2 py-1 border rounded"
              value={filters.priceRange?.[1] ?? ''}
              onChange={e => onChange({ ...filters, priceRange: [filters.priceRange?.[0] ?? 0, Number(e.target.value) || 0] })}
            />
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Availability</h3>
          <select
            className="w-full border rounded px-2 py-1"
            value={filters.availability || ''}
            onChange={e => onChange({ ...filters, availability: e.target.value })}
          >
            <option value="">All</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!filters.deals}
              onChange={e => onChange({ ...filters, deals: e.target.checked })}
            />
            <span>Sale and Deals</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
