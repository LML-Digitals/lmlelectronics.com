'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface FAQFilterProps {
  filters: {
    search: string;
    category: string;
    isPublished?: boolean;
  };
  setFilters: (filters: any) => void;
  categories: string[];
  onSearch: () => void;
}

export default function FAQFilter ({
  filters,
  setFilters,
  categories,
}: FAQFilterProps) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Input
            placeholder="Search FAQs..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="text-sm sm:text-base min-h-[44px]"
          />

          <Select
            value={filters.category || 'all'}
            onValueChange={(value) => {
              setFilters({
                ...filters,
                category: value === 'all' ? '' : value,
              });
            }}
          >
            <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-sm sm:text-base">All Categories</SelectItem>
              {categories.length === 0 ? (
                <SelectItem value="no-categories" disabled className="text-sm sm:text-base">
                  No categories available
                </SelectItem>
              ) : (
                categories
                  .filter((category) => category && category.trim() !== '')
                  .map((category) => (
                    <SelectItem key={category} value={category} className="text-sm sm:text-base">
                      {category}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>

          <Select
            value={
              filters.isPublished === undefined
                ? 'all'
                : filters.isPublished.toString()
            }
            onValueChange={(value) => {
              setFilters({
                ...filters,
                isPublished: value === 'all' ? undefined : value === 'true',
              });
            }}
          >
            <SelectTrigger className="min-h-[44px] text-sm sm:text-base">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-sm sm:text-base">All Status</SelectItem>
              <SelectItem value="true" className="text-sm sm:text-base">Published</SelectItem>
              <SelectItem value="false" className="text-sm sm:text-base">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
