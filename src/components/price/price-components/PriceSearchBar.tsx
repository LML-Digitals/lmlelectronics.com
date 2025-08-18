'use client';

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PriceSearchParams } from '../types/priceTypes';
import { Search, Filter, HelpCircle } from 'lucide-react';
import { debounce } from 'lodash';

interface PriceSearchBarProps {
  onSearch: (params: PriceSearchParams) => void;
  initialParams?: Partial<PriceSearchParams>;
}

export const PriceSearchBar: React.FC<PriceSearchBarProps> = ({
  onSearch,
  initialParams = {},
}) => {
  const [query, setQuery] = useState(initialParams.query || '');
  const [type, setType] = useState<'all' | 'repair' | 'product'>(initialParams.type || 'all');
  const [sort, setSort] = useState<
    'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | undefined
  >(initialParams.sort);

  // Debounce the search to avoid too many requests
  const debouncedSearch = useCallback(
    debounce((params: PriceSearchParams) => {
      onSearch(params);
    }, 300),
    [onSearch],
  );

  const handleSearch = () => {
    const params: PriceSearchParams = {
      query,
      type,
      sort,
    };

    onSearch(params);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;

    setQuery(newQuery);

    // Auto-search after typing
    debouncedSearch({
      query: newQuery,
      type,
      sort,
    });
  };

  const handleTypeChange = (value: string) => {
    const newType = value as 'all' | 'repair' | 'product';

    setType(newType);

    // Auto-search after changing type
    onSearch({
      query,
      type: newType,
      sort,
    });
  };

  const handleSortChange = (value: string) => {
    const newSort
      = value === 'default'
        ? undefined
        : (value as 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc');

    setSort(newSort);

    // Auto-search after changing sort
    onSearch({
      query,
      type,
      sort: newSort,
    });
  };

  return (
    <TooltipProvider>
      <div className="w-full space-y-2">
        <div className="relative flex w-full">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search repairs or products..."
              value={query}
              onChange={handleQueryChange}
              className="pl-9 pr-3 w-full"
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSearch}
                size="sm"
                className="ml-2 flex-shrink-0 hidden sm:flex"
              >
                Search
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manually trigger search (auto-search is enabled)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Use filters to narrow down your search results</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="h-8 text-xs w-[100px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="repair">Repairs</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                </SelectContent>
              </Select>
            </TooltipTrigger>
            <TooltipContent>
              <p>Filter by item type: repairs, products, or both</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Select value={sort || 'default'} onValueChange={handleSortChange}>
                <SelectTrigger className="h-8 text-xs w-[120px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                  <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sort results by price or alphabetical order</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSearch} size="sm" className="ml-auto sm:hidden">
                Search
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manually trigger search on mobile</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PriceSearchBar;
