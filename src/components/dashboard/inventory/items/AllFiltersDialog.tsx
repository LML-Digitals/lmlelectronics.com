'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import type { CategoryWithChildren } from '@/components/dashboard/inventory/categories/types/types';
import { Label } from '@/components/ui/label';
import * as Slider from '@radix-ui/react-slider';
import React from 'react';

// Add new types for filter sections
type FilterSection = {
  id: string;
  title: string;
  description: string;
  count: number;
};

const filterSections: FilterSection[] = [
  {
    id: 'location',
    title: 'Location',
    description: 'Filter by store location',
    count: 0,
  },
  {
    id: 'suppliers',
    title: 'suppliers',
    description: 'Filter by supplier/suppliers',
    count: 0,
  },
  {
    id: 'category',
    title: 'Category',
    description: 'Filter by item category',
    count: 0,
  },
  {
    id: 'stock',
    title: 'Stock Level',
    description: 'Filter by stock availability',
    count: 0,
  },
  {
    id: 'price',
    title: 'Price Range',
    description: 'Filter by purchase cost',
    count: 0,
  },
];

interface AllFiltersDialogProps {
  categories: CategoryWithChildren[];
  suppliers: { id: number; name: string }[];
  locations: { id: number; name: string }[];
  selectedLocation: number | null;
  selectedSupplier: number | null;
  selectedCategory: string | null;
  onLocationChange: (id: number | null) => void;
  onSuppliersChange: (id: number | null) => void;
  onCategoryChange: (id: string | null) => void;
  onResetFilters: () => void;
  onStockRangeChange: (range: [number, number]) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  stockRange: [number, number];
  priceRange: [number, number];
}

export function AllFiltersDialog ({
  categories,
  suppliers,
  locations,
  selectedLocation = null,
  selectedSupplier = null,
  selectedCategory = null,
  onLocationChange,
  onSuppliersChange,
  onCategoryChange,
  onResetFilters,
  onStockRangeChange,
  onPriceRangeChange,
  stockRange,
  priceRange = [0, 10000], // Set default to highest range
}: AllFiltersDialogProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Toggle active filter in dropdown view
  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) => prev.includes(filterId)
      ? prev.filter((id) => id !== filterId)
      : [...prev, filterId]);
  };

  // Update counts based on selected filters
  const getFilterCounts = () => {
    return filterSections.map((section) => ({
      ...section,
      count: getSelectedCount(section.id),
    }));
  };

  const getSelectedCount = (filterId: string) => {
    switch (filterId) {
    case 'location':
      return selectedLocation ? 1 : 0;
    case 'suppliers':
      return selectedSupplier ? 1 : 0;
    case 'category':
      return selectedCategory ? 1 : 0;
    case 'stock':
      return stockRange[0] > 0 || stockRange[1] < 100 ? 1 : 0;
    case 'price':
      return priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0;
    default:
      return 0;
    }
  };

  // Handle reset all filters
  const handleResetAllFilters = () => {
    onResetFilters();
    // Clear any UI state related to filters
    setActiveFilters([]);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          All Filters
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-0 right-0 h-[100dvh] w-[400px] bg-white shadow-lg focus:outline-none z-50">
          <div className="flex h-full flex-col">
            {/* Filter List Header */}
            <div className="shrink-0 border-b">
              <div className="flex items-center justify-between p-4">
                <Dialog.Title className="text-lg font-semibold">
                  Filters
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="rounded-full hover:bg-slate-100 p-2">
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* Main Content Area - Converted to Dropdowns */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {getFilterCounts().map((section) => (
                  <Card key={section.id} className="overflow-hidden">
                    <button
                      onClick={() => toggleFilter(section.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 border-b"
                    >
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{section.title}</div>
                        {section.count > 0 && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                            {section.count}
                          </span>
                        )}
                      </div>
                      <div>
                        {activeFilters.includes(section.id) ? (
                          <ChevronUp className="h-4 w-4 text-slate-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                    </button>

                    {activeFilters.includes(section.id) && (
                      <div className="p-4">
                        {section.id === 'location' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              {locations.map((location) => (
                                <div
                                  key={location.id}
                                  className="flex items-center gap-2"
                                >
                                  <div className="relative flex items-center">
                                    <input
                                      type="radio"
                                      id={`location-${location.id}`}
                                      name="location"
                                      checked={selectedLocation === location.id}
                                      onChange={() => onLocationChange(location.id)
                                      }
                                      className="appearance-none w-5 h-5 border border-gray-300 rounded bg-white checked:bg-gray-500 checked:border-gray-500"
                                    />
                                    <div className="absolute pointer-events-none w-5 h-5 flex items-center justify-center">
                                      {selectedLocation === location.id && (
                                        <div className="w-2 h-2 bg-white rounded" />
                                      )}
                                    </div>
                                  </div>
                                  <label
                                    htmlFor={`location-${location.id}`}
                                    className="ml-1"
                                  >
                                    {location.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                            {selectedLocation && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-800"
                                onClick={() => onLocationChange(null)}
                              >
                                Clear selection
                              </Button>
                            )}
                          </div>
                        )}

                        {section.id === 'suppliers' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              {suppliers.map((supplier) => (
                                <div
                                  key={supplier.id}
                                  className="flex items-center gap-2"
                                >
                                  <div className="relative flex items-center">
                                    <input
                                      type="radio"
                                      id={`suppliers-${supplier.id}`}
                                      name="suppliers"
                                      checked={selectedSupplier === supplier.id}
                                      onChange={() => onSuppliersChange(supplier.id)
                                      }
                                      className="appearance-none w-5 h-5 border border-gray-300 rounded bg-white checked:bg-gray-500 checked:border-gray-500"
                                    />
                                    <div className="absolute pointer-events-none w-5 h-5 flex items-center justify-center">
                                      {selectedSupplier === supplier.id && (
                                        <div className="w-2 h-2 bg-white rounded" />
                                      )}
                                    </div>
                                  </div>
                                  <label
                                    htmlFor={`suppliers-${supplier.id}`}
                                    className="ml-1"
                                  >
                                    {supplier.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                            {selectedSupplier && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-800"
                                onClick={() => onSuppliersChange(null)}
                              >
                                Clear selection
                              </Button>
                            )}
                          </div>
                        )}

                        {section.id === 'category' && (
                          <div className="space-y-4">
                            <CategorySelector
                              categories={categories}
                              selectedCategory={selectedCategory}
                              onSelect={onCategoryChange}
                            />
                            {selectedCategory && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-800"
                                onClick={() => onCategoryChange(null)}
                              >
                                Clear selection
                              </Button>
                            )}
                          </div>
                        )}

                        {section.id === 'stock' && (
                          <div className="space-y-6">
                            <div className="space-y-6">
                              <Slider.Root
                                className="relative flex items-center select-none touch-none w-full h-5"
                                value={stockRange}
                                onValueChange={onStockRangeChange}
                                max={100}
                                step={1}
                                minStepsBetweenThumbs={1}
                              >
                                <Slider.Track className="bg-slate-200 relative grow rounded-full h-[3px]">
                                  <Slider.Range className="absolute bg-gray-500 rounded-full h-full" />
                                </Slider.Track>
                                <Slider.Thumb
                                  className="block w-5 h-5 bg-white border-2 border-gray-500 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                                  aria-label="Min stock"
                                />
                                <Slider.Thumb
                                  className="block w-5 h-5 bg-white border-2 border-gray-500 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                                  aria-label="Max stock"
                                />
                              </Slider.Root>
                              <div className="flex justify-between text-sm">
                                <span>Min: {stockRange[0]}</span>
                                <span>Max: {stockRange[1]}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <Button
                                  variant="outline"
                                  onClick={() => onStockRangeChange([0, 10])}
                                >
                                  Low Stock (0-10)
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => onStockRangeChange([11, 50])}
                                >
                                  Medium (11-50)
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => onStockRangeChange([51, 100])}
                                >
                                  High (51+)
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => onStockRangeChange([0, 100])}
                                >
                                  Reset
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {section.id === 'price' && (
                          <div className="space-y-6">
                            <div className="space-y-6">
                              <Slider.Root
                                className="relative flex items-center select-none touch-none w-full h-5"
                                value={priceRange}
                                onValueChange={onPriceRangeChange}
                                max={10000}
                                step={50}
                                minStepsBetweenThumbs={100}
                              >
                                <Slider.Track className="bg-slate-200 relative grow rounded-full h-[3px]">
                                  <Slider.Range className="absolute bg-gray-500 rounded-full h-full" />
                                </Slider.Track>
                                <Slider.Thumb
                                  className="block w-5 h-5 bg-white border-2 border-gray-500 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                                  aria-label="Min price"
                                />
                                <Slider.Thumb
                                  className="block w-5 h-5 bg-white border-2 border-gray-500 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                                  aria-label="Max price"
                                />
                              </Slider.Root>
                              <div className="flex justify-between text-sm">
                                <span>${priceRange[0]}</span>
                                <span>${priceRange[1]}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <Button
                                  variant="outline"
                                  onClick={() => onPriceRangeChange([0, 100])}
                                >
                                  Budget ($0-$100)
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => onPriceRangeChange([101, 500])}
                                >
                                  Mid-range ($101-$500)
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => onPriceRangeChange([501, 2000])
                                  }
                                >
                                  High-end ($501-$2000)
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => onPriceRangeChange([0, 10000])}
                                >
                                  Reset
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t p-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleResetAllFilters}
              >
                Reset All Filters
              </Button>
              <Dialog.Close asChild>
                <Button className="flex-1">Apply Filters</Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Replace RecursiveCategorySelect with this improved CategorySelector component
function CategorySelector ({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: CategoryWithChildren[];
  selectedCategory: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((current) => current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId]);
  };

  return (
    <div className="space-y-1 border rounded-md p-1">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          selectedCategory={selectedCategory}
          onSelect={onSelect}
          expandedCategories={expandedCategories}
          toggleCategory={toggleCategory}
          level={0}
        />
      ))}
    </div>
  );
}

function CategoryItem ({
  category,
  selectedCategory,
  onSelect,
  expandedCategories,
  toggleCategory,
  level,
}: {
  category: CategoryWithChildren;
  selectedCategory: string | null;
  onSelect: (id: string | null) => void;
  expandedCategories: string[];
  toggleCategory: (id: string) => void;
  level: number;
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories.includes(category.id);
  const isSelected = selectedCategory === category.id;

  return (
    <div>
      <div
        className={`flex items-center justify-between py-1.5 px-2 rounded-md ${
          isSelected
            ? 'bg-gray-200 text-gray-900'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <div className="flex items-center gap-2 flex-1">
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              className="p-0.5 rounded-sm hover:bg-gray-200 text-gray-600"
            >
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          <button
            type="button"
            onClick={() => onSelect(category.id)}
            className="flex-1 text-left flex items-center"
          >
            <span className="truncate">{category.name}</span>
          </button>

          <div className="relative flex items-center">
            <input
              type="radio"
              id={`category-${category.id}`}
              name="category"
              checked={isSelected}
              onChange={() => onSelect(category.id)}
              className="appearance-none w-4 h-4 border border-gray-400 rounded bg-white checked:bg-gray-600 checked:border-gray-600"
            />
            <div className="absolute pointer-events-none w-4 h-4 flex items-center justify-center">
              {isSelected && (
                <div className="w-1.5 h-1.5 bg-white rounded" />
              )}
            </div>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="pl-2">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              selectedCategory={selectedCategory}
              onSelect={onSelect}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
