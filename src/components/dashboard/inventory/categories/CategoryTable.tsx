'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  Search,
  FolderOpen,
  Folder,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { InventoryItem } from '@prisma/client';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EditCategoryDialog } from './EditCategoryDialog';
import { AddCategoryDialog } from './AddCategoryDialog';
import { CategoryDetailsDialog } from './CategoryDetailsDialog';
import DeleteItemCategory from './DeleteItemCategory';

export type CategoryWithChildren = {
  id: string;
  name: string;
  parentId: string | null;
  children: CategoryWithChildren[];
  items: InventoryItem[];
  visible: boolean;
  image: string;
  description: string;
};

function CategoryTable ({ categories }: { categories: CategoryWithChildren[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    setSearch(inputValue);
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => prev.includes(categoryId)
      ? prev.filter((id) => id !== categoryId)
      : [...prev, categoryId]);
  };

  // Trigger refresh after changes
  const handleDataChange = () => {
    setRefreshTrigger((prev) => prev + 1);
    // If you need to reload data from server, you would call that function here
  };

  // Add this function to transform flat data into tree structure
  const buildCategoryTree = (flatCategories: CategoryWithChildren[]) => {
    const categoryMap = new Map<string, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // First pass: Create map of all categories
    flatCategories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: Build the tree structure
    flatCategories.forEach((category) => {
      const currentCategory = categoryMap.get(category.id)!;

      if (category.parentId === null) {
        rootCategories.push(currentCategory);
      } else {
        const parentCategory = categoryMap.get(category.parentId);

        if (parentCategory) {
          parentCategory.children.push(currentCategory);
        }
      }
    });

    return rootCategories;
  };

  // Transform the categories before filtering
  const categoryTree = buildCategoryTree(categories);

  const filteredCategories = categoryTree.filter((category) => {
    const matchesSearch = (cat: CategoryWithChildren): boolean => {
      return (
        cat.name.toLowerCase().includes(search.toLowerCase())
        || cat.description.toLowerCase().includes(search.toLowerCase())
        || cat.children.some(matchesSearch)
      );
    };

    return search.toLowerCase() === '' || matchesSearch(category);
  });

  const renderCategoryRow = (
    category: CategoryWithChildren,
    depth = 0,
    parentExpanded = true,
  ): React.JSX.Element[] => {
    const isExpanded = expandedCategories.includes(category.id);
    const hasChildren = category.children.length > 0;
    const isVisible = depth === 0 || parentExpanded;

    const rows: React.JSX.Element[] = [];

    if (isVisible) {
      rows.push(<TableRow key={category.id} className="">
        <TableCell className="lg:w-96">
          <div
            className="flex items-center gap-3"
            style={{ paddingLeft: `${depth * 24}px` }}
          >
            {/* Expand/Collapse button - OUTSIDE the dialog trigger */}
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(category.id);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            ) : (
              <span className="w-[32px]" />
            )}

            {/* Category name and icon - INSIDE the dialog trigger */}
            <CategoryDetailsDialog
              category={category}
              onItemAdded={handleDataChange}
              categories={categories}
            >
              <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded p-1 flex-grow">
                {category.image ? (
                  <div className="relative h-6 w-6 rounded-full overflow-hidden">
                    <Image
                      src={category.image || '/placeholder.svg'}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : isExpanded && hasChildren ? (
                  <FolderOpen size={18} />
                ) : (
                  <Folder size={18} />
                )}
                <span className="font-medium">{category.name}</span>
              </div>
            </CategoryDetailsDialog>
          </div>
        </TableCell>

        {/* Description column */}
        <TableCell className="max-w-xs">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="truncate text-sm text-gray-600">
                  {category.description || (
                    <span className="text-xs italic">No description</span>
                  )}
                </p>
              </TooltipTrigger>
              {category.description && (
                <TooltipContent>
                  <p className="max-w-xs">{category.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </TableCell>

        {/* Structure column */}
        <TableCell>
          {hasChildren ? (
            <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
              {category.children.length}{' '}
              {category.children.length === 1
                ? 'subcategory'
                : 'subcategories'}
            </span>
          ) : (
            <span className="text-xs italic">No subcategories</span>
          )}
        </TableCell>

        {/* Items column */}
        <TableCell>
          {category.items.length > 0 ? (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              {category.items.length}{' '}
              {category.items.length === 1 ? 'item' : 'items'}
            </span>
          ) : (
            <span className="text-xs italic">No items</span>
          )}
        </TableCell>

        {/* Visibility column */}
        <TableCell>
          {category.visible !== false ? (
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full w-fit">
              <Eye size={12} />
              <span>Visible</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full w-fit">
              <EyeOff size={12} />
              <span>Hidden</span>
            </div>
          )}
        </TableCell>

        {/* Actions column */}
        <TableCell>
          <div className="flex items-center gap-4">
            <EditCategoryDialog categoryId={category.id} />
            <DeleteItemCategory itemCategoryId={category.id} />
          </div>
        </TableCell>
      </TableRow>);

      // Recursively render children if expanded
      if (hasChildren && isExpanded) {
        category.children.forEach((child) => {
          rows.push(...renderCategoryRow(child, depth + 1, isExpanded));
        });
      }
    }

    return rows;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Inventory Categories</h1>
          </div>
          <p className="text-sm">
            Manage your inventory categories and hierarchy
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddCategoryDialog categories={categories} />
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          <Input
            placeholder="Search categories..."
            onChange={handleInputChange}
            className="w-full pl-10"
          />
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="lg:w-80 font-semibold dark:text-black">
                Name
              </TableHead>
              <TableHead className="font-semibold dark:text-black">
                Description
              </TableHead>
              <TableHead className="font-semibold dark:text-black">
                Structure
              </TableHead>
              <TableHead className="font-semibold dark:text-black">
                Items
              </TableHead>
              <TableHead className="font-semibold dark:text-black">
                Visibility
              </TableHead>
              <TableHead className="font-semibold dark:text-black">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length > 0 ? (
              <>
                {filteredCategories.flatMap((category) => renderCategoryRow(category, 0, true))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FolderTree className="h-8 w-8 text-slate-400" />
                    <p>No categories found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default CategoryTable;
