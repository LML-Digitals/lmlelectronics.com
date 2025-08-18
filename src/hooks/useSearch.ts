import { useEffect, useState } from 'react';

interface SearchRoute {
  id: string;
  name: string;
  path: string;
  keywords: string[];
  description?: string;
}

interface SearchData {
  routes: SearchRoute[];
}

export function useSearch (query: string) {
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<SearchRoute[]>([]);

  // Fetch initial search data
  useEffect(() => {
    const fetchSearchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/search-data.json');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setSearchData(data);
      } catch (err) {
        console.error('Error fetching search data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch search data'));
        // Set empty data to prevent crashes
        setSearchData({ routes: [] });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSearchData();
  }, []);

  // Handle search when query changes
  useEffect(() => {
    if (!searchData?.routes || !query.trim()) {
      setResults([]);

      return;
    }

    setIsLoading(true);
    try {
      const normalizedQuery = query.toLowerCase().trim();
      const filteredResults = searchData.routes.filter((route) => {
        return (
          route.name.toLowerCase().includes(normalizedQuery)
          || route.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery))
          || (route.description?.toLowerCase().includes(normalizedQuery))
        );
      });

      setResults(filteredResults);
    } catch (err) {
      console.error('Error filtering search results:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, searchData]);

  return {
    results: results || [],
    isLoading,
    error,
  };
}
