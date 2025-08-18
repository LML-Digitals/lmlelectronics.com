'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CategoryWithChildren } from './types/types';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { DialogDescription } from '@/components/common/top-dialog/TopDialog';

function CategoryItem ({
  category,
  selectedIds,
  onSelect,
  level = 0,
}: {
  category: CategoryWithChildren;
  selectedIds: string[];
  onSelect: (id: string) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedIds.includes(category.id);

  return (
    <div className="py-1">
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center gap-2 ${
            hasChildren ? 'cursor-pointer' : ''
          }`}
          onClick={() => hasChildren && setExpanded(!expanded)}
        >
          {hasChildren ? (
            <div className="w-5 h-5 flex items-center justify-center text-muted-foreground">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          ) : (
            <div className="w-5" /> /* Spacer for alignment */
          )}

          <div className="flex-1 text-sm">{category.name}</div>
        </div>

        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(category.id)}
          onClick={(e) => e.stopPropagation()}
          className="ml-2"
        />
      </div>

      {hasChildren && expanded && (
        <div className="ml-6 mt-1 border-l pl-3 border-slate-200">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              selectedIds={selectedIds}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategorySelect ({
  categories,
  selectedIds,
  onSelect,
  searchQuery,
}: {
  categories: CategoryWithChildren[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  searchQuery: string;
}) {
  // Filter categories based on search query
  const filterCategories = (
    cats: CategoryWithChildren[],
    query: string,
  ): CategoryWithChildren[] => {
    if (!query) { return cats; }

    return cats
      .map((cat) => {
        // Check if this category matches
        if (cat.name.toLowerCase().includes(query.toLowerCase())) {
          return cat;
        }

        // Check if any children match and create a new object with only matching children
        if (cat.children.length > 0) {
          const filteredChildren = filterCategories(cat.children, query);

          if (filteredChildren.length > 0) {
            return {
              ...cat,
              children: filteredChildren,
            };
          }
        }

        return null;
      })
      .filter(Boolean) as CategoryWithChildren[];
  };

  const filteredCategories = filterCategories(categories, searchQuery);

  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-3 text-muted-foreground">
        No categories match your search
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredCategories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          selectedIds={selectedIds}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export function CategorySelectionDialog ({
  open,
  onOpenChange,
  categories,
  selectedIds,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryWithChildren[];
  selectedIds: string[];
  onSelect: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Count selected categories
  const selectedCount = selectedIds.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select Categories</DialogTitle>
          <DialogDescription>
            Select the categories you want to include. You can search for
            categories using the search bar below.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* <div className="flex justify-between mb-2">
          <div className="text-sm text-muted-foreground">
            {selectedCount} {selectedCount === 1 ? "category" : "categories"}{" "}
            selected
          </div>
          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Clear all selected categories
                selectedIds.forEach((id) => onSelect(id));
              }}
            >
              Clear all
            </Button>
          )}
        </div> */}

        <div className="overflow-y-auto max-h-[60vh]">
          <Card className="p-4">
            <CategorySelect
              categories={categories}
              selectedIds={selectedIds}
              onSelect={onSelect}
              searchQuery={searchQuery}
            />
          </Card>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
