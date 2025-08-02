"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PriceItem,
  PriceSearchParams,
  PriceSearchResult,
} from "../types/priceTypes";
import { searchPrices } from "../services/priceService";
import PriceSearchBar from "./PriceSearchBar";
import PriceItemAccordion from "./PriceItemAccordion";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatSlug } from "@/utils/formatSlug";

interface PriceSearchGlobalProps {
  onSelectPrice?: (item: PriceItem) => void;
  initialType?: "all" | "repair" | "product";
  showTitle?: boolean;
  isPortal?: boolean;
}

export const PriceSearchGlobal: React.FC<PriceSearchGlobalProps> = ({
  onSelectPrice,
  initialType = "all",
  showTitle = true,
  isPortal,
}) => {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<PriceSearchParams>({
    query: "",
    type: initialType,
  });
  const [searchResults, setSearchResults] = useState<PriceSearchResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const performSearch = async (params: PriceSearchParams) => {
    setSearchError(null);

    if (!params.query || params.query.trim() === "") {
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
      setSearchError("An error occurred while searching. Please try again.");
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

  const filteredResults = searchResults?.items || [];

  // const handleAddToCalculator = (item: PriceItem) => {
  //   if (onSelectPrice) {
  //     onSelectPrice(item);
  //   }

  //   const calculatorItem = {
  //     name: item.name,
  //     type: item.type,
  //     price: item.finalPrice,
  //     raw: "0",
  //     tax: "0",
  //     shipping: "0",
  //     markup: "0",
  //     fee: "0",
  //     labour: "0",
  //     profit: "0",
  //   };

  //   if (item.type === "product") {
  //     calculatorItem.raw = item.basePrice?.toString() || "0";

  //     if (item.tax) calculatorItem.tax = item.tax.toString();
  //     if (item.shipping) calculatorItem.shipping = item.shipping.toString();

  //     if (item.basePrice && item.finalPrice > item.basePrice) {
  //       const markupAmount = item.finalPrice - item.basePrice;
  //       const markupPercentage = (markupAmount / item.basePrice) * 100;
  //       calculatorItem.markup = markupPercentage.toFixed(2);
  //     } else if (item.markup) {
  //       calculatorItem.markup = item.markup.toString();
  //     }
  //   } else if (item.type === "repair") {
  //     if (item.basePrice) {
  //       calculatorItem.raw = item.basePrice.toString();
  //     } else if (item.variation?.raw) {
  //       calculatorItem.raw = item.variation.raw.toString();
  //     }

  //     if (item.variation?.tax)
  //       calculatorItem.tax = item.variation.tax.toString();
  //     if (item.variation?.shipping)
  //       calculatorItem.shipping = item.variation.shipping.toString();

  //     if (item.labour) {
  //       calculatorItem.labour = item.labour.toString();
  //     } else {
  //       const basePrice = item.basePrice || 0;
  //       const labour = Math.max(0, item.finalPrice - basePrice);
  //       calculatorItem.labour = labour.toString();
  //     }
  //   }

  //   // Store the calculator item in sessionStorage instead of using URL params
  //   try {
  //     // Store the calculator item with a unique key
  //     sessionStorage.setItem("calculatorItem", JSON.stringify(calculatorItem));

  //     // Navigate directly to the main calculator page
  //     // router.push("/dashboard/calculator");
  //   } catch (error) {
  //     console.error("Error storing calculator item:", error);
  //     // Fallback to direct navigation if sessionStorage fails
  //     // router.push("/dashboard/calculator");
  //   }
  // };

  const handleViewDetails = (item: PriceItem) => {
    if (item.type === "repair") {
      if (item.navigationInfo) {
        const { brandName, seriesName, modelName, deviceTypeName } =
          item.navigationInfo;

        if (brandName && modelName && deviceTypeName) {
          const series = seriesName || "All Series";
          const url = `/dashboard/repairs/${formatSlug(deviceTypeName)}/${formatSlug(
            brandName
          )}/${formatSlug(series)}/${formatSlug(modelName)}`;
          router.push(url);
          return;
        }
      }

      router.push("/dashboard/repairs");
    } else if (item.type === "product") {
      try {
        router.push("/dashboard/inventory/items");
      } catch (error) {
        console.error("Error navigating to inventory item:", error);
        router.push("/dashboard/inventory/items");
      }
    }
  };

  return (
    <div className="w-full">
      {showTitle && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Price Search</h2>
        </div>
      )}

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
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          </div>
        ) : !hasSearched || !searchParams.query ? (
          <div className="text-center py-10 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">Start typing to search for prices</p>
            <p className="text-sm mt-1">Search for repairs, products, or services</p>
          </div>
        ) : searchResults && searchResults.items.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <p className="text-lg font-medium">No results found</p>
            <p className="mt-2 text-sm">
              Try a different search term or remove some filters
            </p>
          </div>
        ) : (
          <PriceItemAccordion
            items={filteredResults}
            onSelect={handleSelectItem}
            onViewDetails={handleViewDetails}
            // onAddToCalculator={handleAddToCalculator}
          />
        )}
      </div>
    </div>
  );
};
