'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PriceItem,
  PriceSearchParams,
  PriceSearchResult,
} from '../types/priceTypes';
import { searchPrices } from '../services/priceService';
import PriceSearchBar from './PriceSearchBar';
import PriceItemAccordion from './PriceItemAccordion';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatSlug } from '@/utils/formatSlug';

interface PriceSearchProps {
  onSelectPrice?: (item: PriceItem) => void;
  initialType?: 'all' | 'repair' | 'product';
  showTitle?: boolean;
  isCalculator?: boolean;
}

export const PriceSearch: React.FC<PriceSearchProps> = ({
  onSelectPrice,
  initialType = 'all',
  showTitle = true,
  isCalculator,
}) => {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<PriceSearchParams>({
    query: '',
    type: initialType,
  });
  const [searchResults, setSearchResults] = useState<PriceSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const performSearch = async (params: PriceSearchParams) => {
    // Reset error state
    setSearchError(null);

    // Don't search if query is empty
    if (!params.query || params.query.trim() === '') {
      setSearchResults(null);
      setHasSearched(false);

      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const results = await searchPrices(params);

      setSearchResults(results);
    } catch (error) {
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (params: PriceSearchParams) => {
    setSearchParams(params);
    performSearch(params);
  };

  const handleSelectItem = (item: PriceItem) => {
    if (onSelectPrice) {
      onSelectPrice(item);
    }
  };

  const handleViewDetails = (item: PriceItem) => {
    // Navigate to details page based on item type
    if (item.type === 'repair') {
      if (item.navigationInfo) {
        const { brandName, seriesName, modelName, deviceTypeName }
          = item.navigationInfo;

        if (brandName && modelName && deviceTypeName) {
          const series = seriesName || 'All Series';
          const url = `/dashboard/repairs/${formatSlug(deviceTypeName)}/${formatSlug(brandName)}/${formatSlug(series)}/${formatSlug(modelName)}`;

          router.push(url);

          return;
        }
      }

      router.push('/dashboard/repairs');
    } else {
      // For inventory items/products - redirect to main inventory items page
      router.push('/dashboard/inventory/items');
    }
  };

  // Get all results directly
  const filteredResults = searchResults?.items || [];

  return (
    <div className="w-full">
      <div className="px-6 py-4">
        {showTitle && <h2 className="text-2xl font-bold mb-4">Price Search</h2>}

        <div className="flex flex-col space-y-4">
          <div className="flex-1">
            <PriceSearchBar
              onSearch={handleSearch}
              initialParams={searchParams}
            />
          </div>
        </div>

        {searchError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{searchError}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !hasSearched || !searchParams.query ? (
            <div className="text-center py-10 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Start typing to search for prices...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
              <p className="text-lg font-medium">No results found</p>
              <p className="mt-2">
                Try a different search term or remove some filters
              </p>
            </div>
          ) : (
            <PriceItemAccordion
              items={filteredResults}
              onSelect={handleSelectItem}
              onViewDetails={handleViewDetails}
              isCalculator
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceSearch;
