'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Package,
  ChevronDown,
  ChevronsUpDown,
  Check,
  CircleDashed,
  MoreHorizontal,
  Trash2,
  Copy,
  CheckSquare,
  Square,
  RefreshCcw,
  InfoIcon,
} from 'lucide-react';
import { useState } from 'react';
import { InventoryItemWithRelations } from './types/ItemType';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ItemDetailsDialog } from './ItemDetailsDialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useInventoryData } from './hooks/useInventoryData';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { CategoryWithChildren } from '@/components/dashboard/inventory/categories/types/types';
import { AllFiltersDialog } from './AllFiltersDialog';
import { Badge } from '@/components/ui/badge';
import { AddItemDialog } from './AddItemDialog';
import { ScannerDialog } from './ScannerDialog';
import { EditItemDialog } from './EditItemDialog';
import { DeleteItemDialog } from './DeleteItemDialog';
import { DuplicateItemDialog } from './DuplicateItemDialog';
import { BulkDeleteDialog } from './BulkDeleteDialog';
import { BulkDuplicateDialog } from './BulkDuplicateDialog';
import { useRouter } from 'next/navigation';
import { DefaultRatesDialog } from './DefaultRatesDialog';
import CategoryDialog from '../categories/CategoryDialog';

// Move helper functions outside and before the ItemsTable component
const getLocationStockInfo = (
  item: InventoryItemWithRelations,
  locationId: number,
) => {
  const totalStock = item.variations.reduce((total, variation) => {
    const stockLevel = variation.stockLevels.find((level) => level.locationId === locationId);

    return total + (stockLevel?.stock || 0);
  }, 0);

  return totalStock;
};

const isAvailableInAllLocations = (item: InventoryItemWithRelations) => {
  const stockByLocation = item.variations[0]?.stockLevels.every((level) => {
    const stock = getLocationStockInfo(item, level.locationId);

    return stock > 0;
  });

  return stockByLocation;
};

const calculateAverageCost = (item: InventoryItemWithRelations) => {
  let totalCost = 0;
  const totalItems = item.variations.length;

  item.variations.forEach((variation) => {
    totalCost += variation.sellingPrice;
  });

  return totalItems > 0 ? (totalCost / totalItems).toFixed(2) : '0.00';
};

const getCategoryPath = (
  categories: CategoryWithChildren[],
  categoryId: string,
): string => {
  const findPath = (
    categories: CategoryWithChildren[],
    id: string,
    path: string[] = [],
  ): string[] => {
    for (const category of categories) {
      if (category.id === id) { return [...path, category.name]; }
      if (category.children?.length) {
        const result = findPath(category.children, id, [
          ...path,
          category.name,
        ]);

        if (result.length) { return result; }
      }
    }

    return [];
  };

  return findPath(categories, categoryId).join(' > ');
};

type ItemsTableProps = {
  items: InventoryItemWithRelations[];
  onRefresh: () => void;
};

function ItemsTable ({ items, onRefresh }: ItemsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem]
    = useState<InventoryItemWithRelations | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { categories, suppliers, locations, tags, isLoading }
    = useInventoryData();
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState<Record<string, boolean>>({
    location: false,
    supplier: false,
    category: false,
    tag: false,
    visibility: false,
  });
  const [stockRange, setStockRange] = useState<[number, number]>([
    0,
    Number.MAX_VALUE,
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    Number.MAX_VALUE,
  ]);
  const [itemToEdit, setItemToEdit]
    = useState<InventoryItemWithRelations | null>(null);
  const [itemToDelete, setItemToDelete]
    = useState<InventoryItemWithRelations | null>(null);
  const [itemToDuplicate, setItemToDuplicate]
    = useState<InventoryItemWithRelations | null>(null);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);

  // New states for bulk selection
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemsToDeleteBulk, setItemsToDeleteBulk] = useState<
    InventoryItemWithRelations[]
  >([]);
  const [itemsToDuplicateBulk, setItemsToDuplicateBulk] = useState<
    InventoryItemWithRelations[]
  >([]);

  const handleScannedItem = (item: InventoryItemWithRelations) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  // New toggle selection handlers
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };

  const toggleSelectItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // Prevent row click event
    setSelectedItems((prev) => prev.includes(itemId)
      ? prev.filter((id) => id !== itemId)
      : [...prev, itemId]);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    const itemsToDelete = filteredItems.filter((item) => selectedItems.includes(item.id));

    setItemsToDeleteBulk(itemsToDelete);
  };

  const handleBulkDuplicate = () => {
    const itemsToDuplicate = filteredItems.filter((item) => selectedItems.includes(item.id));

    setItemsToDuplicateBulk(itemsToDuplicate);
  };

  const filteredItems = items?.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesLocation = selectedLocation
      ? item.variations.some((v) => v.stockLevels.some((sl) => sl.locationId === selectedLocation && sl.stock > 0))
      : true;
    const matchesSupplier = selectedSupplier
      ? item.supplierId === selectedSupplier
      : true;
    const matchesCategory = selectedCategory
      ? item.categories.some((c) => c.id === selectedCategory)
      : true;
    const matchesTag = selectedTag
      ? item.tags.some((t) => t.id === selectedTag)
      : true;
    const matchesVisibility = selectedVisibility
      ? selectedVisibility === 'visible'
        ? item.variations.some((v) => v.visible)
        : item.variations.every((v) => !v.visible)
      : true;

    const totalStock = item.variations.reduce(
      (total, variation) => total
        + variation.stockLevels.reduce((sum, level) => sum + level.stock, 0),
      0,
    );

    const avgCost = parseFloat(calculateAverageCost(item));

    const matchesStock
      = totalStock >= stockRange[0] && totalStock <= stockRange[1];
    const matchesPrice = avgCost >= priceRange[0] && avgCost <= priceRange[1];

    return (
      matchesSearch
      && matchesLocation
      && matchesSupplier
      && matchesCategory
      && matchesTag
      && matchesVisibility
      && matchesStock
      && matchesPrice
    );
  });

  // Update the usage of getCategoryPath to pass categories
  const getSelectedCategoryPath = (categoryId: string): string => {
    return getCategoryPath(categories, categoryId);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 sm:h-6 sm:w-6" />
            <h1 className="text-xl sm:text-2xl font-semibold">Inventory Items</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your inventory items, variations, and stock levels
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Bulk Actions Button - Only show when items are selected */}
          {selectedItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <span>Actions ({selectedItems.length})</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBulkDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Selected
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleBulkDelete}
                  className="text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearSelection}>
                  Clear Selection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <AddItemDialog
            onRefresh={onRefresh}
            categories={categories}
            suppliers={suppliers}
            locations={locations}
            isLoading={isLoading}
            open={addItemDialogOpen}
            onOpenChange={setAddItemDialogOpen}
          />
          <CategoryDialog
            trigger={
              <Button className="w-full sm:w-auto">
                <InfoIcon className="h-4 w-4 mr-2" />
                Categories
              </Button>
            }
          />
          <ScannerDialog
            onItemFound={handleScannedItem}
            onRefresh={onRefresh}
          />

          {/* Add the DefaultRatesDialog button */}
          <DefaultRatesDialog
            trigger={
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <InfoIcon className="h-4 w-4 mr-2" />
                Default Rates
              </Button>
            }
          />
          {/* <Button onClick={() => router.back()}>Go Back</Button> */}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search items..."
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Location Filter */}
          <Popover
            open={filtersOpen.location}
            onOpenChange={(open) => setFiltersOpen((prev) => ({ ...prev, location: open }))
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="min-w-[100px] justify-between h-10"
              >
                {selectedLocation
                  ? locations.find((l) => l.id === selectedLocation)?.name
                  : 'All Locations'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search locations..." />
                <CommandList>
                  <CommandEmpty>No locations available</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedLocation(null);
                        setFiltersOpen((prev) => ({
                          ...prev,
                          location: false,
                        }));
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          !selectedLocation ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      All Locations
                    </CommandItem>
                    {Array.isArray(locations)
                      && locations.map((location) => (
                        <CommandItem
                          key={location.id}
                          onSelect={() => {
                            setSelectedLocation(location.id);
                            setFiltersOpen((prev) => ({
                              ...prev,
                              location: false,
                            }));
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedLocation === location.id
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {location.name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* supplier Filter */}
          <Popover
            open={filtersOpen.supplier}
            onOpenChange={(open) => setFiltersOpen((prev) => ({ ...prev, supplier: open }))
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="min-w-[120px] justify-between h-10"
              >
                {selectedSupplier
                  ? suppliers.find((v) => v.id === selectedSupplier)?.name
                  : 'All Suppliers'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search suppliers..." />
                <CommandList>
                  <CommandEmpty>No suppliers available</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedSupplier(null);
                        setFiltersOpen((prev) => ({
                          ...prev,
                          supplier: false,
                        }));
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          !selectedSupplier ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      All suppliers
                    </CommandItem>
                    {Array.isArray(suppliers)
                      && suppliers.map((supplier) => (
                        <CommandItem
                          key={supplier.id}
                          onSelect={() => {
                            setSelectedSupplier(supplier.id);
                            setFiltersOpen((prev) => ({
                              ...prev,
                              supplier: false,
                            }));
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedSupplier === supplier.id
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {supplier.name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Category Filter */}
          <Popover
            open={filtersOpen.category}
            onOpenChange={(open) => setFiltersOpen((prev) => ({ ...prev, category: open }))
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="min-w-[100px] justify-between h-10"
              >
                {selectedCategory
                  ? getSelectedCategoryPath(selectedCategory)
                  : 'All Categories'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList className="max-h-[300px] overflow-auto">
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedCategory(null);
                        setFiltersOpen((prev) => ({
                          ...prev,
                          category: false,
                        }));
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          !selectedCategory ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      All Categories
                    </CommandItem>
                    {categories?.length > 0 && (
                      <RecursiveCategoryList
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelect={(id) => {
                          setSelectedCategory(id);
                          setFiltersOpen((prev) => ({
                            ...prev,
                            category: false,
                          }));
                        }}
                        level={0}
                      />
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Tag Filter */}
          <Popover
            open={filtersOpen.tag}
            onOpenChange={(open) => setFiltersOpen((prev) => ({ ...prev, tag: open }))
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="min-w-[100px] justify-between h-10"
              >
                {selectedTag
                  ? tags.find((t) => t.id === selectedTag)?.name || 'All Tags'
                  : 'All Tags'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandList>
                  <CommandEmpty>No tags found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedTag(null);
                        setFiltersOpen((prev) => ({
                          ...prev,
                          tag: false,
                        }));
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          !selectedTag ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      All Tags
                    </CommandItem>
                    {tags?.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => {
                          setSelectedTag(tag.id);
                          setFiltersOpen((prev) => ({
                            ...prev,
                            tag: false,
                          }));
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedTag === tag.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {tag.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Visibility Filter */}
          <Popover
            open={filtersOpen.visibility}
            onOpenChange={(open) => setFiltersOpen((prev) => ({ ...prev, visibility: open }))
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="min-w-[150px] justify-between h-10"
              >
                {selectedVisibility
                  ? selectedVisibility === 'visible'
                    ? 'Visible'
                    : 'Hidden'
                  : 'All Visibility'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search visibility..." />
                <CommandList>
                  <CommandEmpty>No visibility option found</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedVisibility(null);
                        setFiltersOpen((prev) => ({
                          ...prev,
                          visibility: false,
                        }));
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          !selectedVisibility ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      All Visibility
                    </CommandItem>
                    <CommandItem
                      onSelect={() => {
                        setSelectedVisibility('visible');
                        setFiltersOpen((prev) => ({
                          ...prev,
                          visibility: false,
                        }));
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedVisibility === 'visible' ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      Visible
                    </CommandItem>
                    <CommandItem
                      onSelect={() => {
                        setSelectedVisibility('hidden');
                        setFiltersOpen((prev) => ({
                          ...prev,
                          visibility: false,
                        }));
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedVisibility === 'hidden' ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      Hidden
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Reset Filters Button */}
          {(selectedLocation || selectedSupplier || selectedCategory || selectedTag || selectedVisibility) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedLocation(null);
                setSelectedSupplier(null);
                setSelectedCategory(null);
                setSelectedTag(null);
                setSelectedVisibility(null);
              }}
              className="h-10"
            >
              Reset Filters
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Add the new All Filters dialog */}
          <AllFiltersDialog
            categories={categories}
            suppliers={suppliers}
            locations={locations}
            selectedLocation={selectedLocation}
            selectedSupplier={selectedSupplier}
            selectedCategory={selectedCategory}
            stockRange={stockRange}
            priceRange={priceRange}
            onLocationChange={setSelectedLocation}
            onSuppliersChange={setSelectedSupplier}
            onCategoryChange={setSelectedCategory}
            onStockRangeChange={setStockRange}
            onPriceRangeChange={setPriceRange}
            onResetFilters={() => {
              setSelectedLocation(null);
              setSelectedSupplier(null);
              setSelectedCategory(null);
            }}
          />
          <Button
            variant="outline"
            onClick={() => {
              const button = document.querySelector('.refresh-icon');

              button?.classList.add('animate-spin');
              onRefresh();
              setTimeout(() => {
                button?.classList.remove('animate-spin');
              }, 1000);
            }}
            className="h-10"
          >
            <RefreshCcw className="h-4 w-4 mr-2 refresh-icon" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                {/* New checkbox column */}
                <TableHead className="w-[40px]">
                  <div className="flex items-center justify-center">
                    {filteredItems && filteredItems.length > 0 && (
                      <button
                        onClick={toggleSelectAll}
                        className="cursor-pointer"
                        aria-label={
                          selectedItems.length === filteredItems.length
                            ? 'Deselect all'
                            : 'Select all'
                        }
                      >
                        {selectedItems.length === filteredItems.length ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                </TableHead>
                <TableHead className="min-w-[200px] dark:text-black">Item</TableHead>
                <TableHead className="min-w-[120px] dark:text-black">Categories</TableHead>
                <TableHead className="min-w-[100px] dark:text-black">Tags</TableHead>
                <TableHead className="min-w-[80px] dark:text-black">Variations</TableHead>
                <TableHead className="min-w-[120px] dark:text-black">Locations</TableHead>
                <TableHead className="min-w-[80px] dark:text-black">Total Stock</TableHead>
                <TableHead className="min-w-[80px] dark:text-black">Avg. Cost</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {!items ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <CircleDashed className="h-8 w-8 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-slate-400" />
                      <p className="text-slate-500">No items found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn('group cursor-pointer')}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsDetailsOpen(true);
                    }}
                  >
                    {/* Checkbox cell */}
                    <TableCell className="pr-0 pl-4 w-[40px]">
                      <div
                        className="flex items-center justify-center"
                        onClick={(e) => toggleSelectItem(e, item.id)}
                      >
                        {selectedItems.includes(item.id) ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <Image
                            src={item.image ? item.image : '/noPicture.png'}
                            className="rounded-lg aspect-square"
                            alt="No Picture"
                            width={50}
                            height={50}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm sm:text-base">{item.name}</p>
                          {item.supplier && (
                            <p className="text-xs sm:text-sm text-slate-500">
                              {item.supplier.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {item.categories.map((category) => (
                          <span
                            key={category.id}
                            className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-900 w-fit rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 w-fit rounded-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{item.variations.length}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {isAvailableInAllLocations(item) ? (
                          <span className="px-2 py-1 text-xs w-fit rounded-full">
                            All Locations
                          </span>
                        ) : (
                          item.variations[0]?.stockLevels.map((level) => {
                            const stock = getLocationStockInfo(
                              item,
                              level.locationId,
                            );

                            if (stock > 0) {
                              return (
                                <span
                                  key={level.locationId}
                                  className="px-2 py-1 text-xs rounded-full w-fit"
                                >
                                  {level.location.name} ({stock})
                                </span>
                              );
                            }

                            return null;
                          })
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {item.variations.reduce(
                        (total, variation) => total
                          + variation.stockLevels.reduce(
                            (sum, level) => sum + level.stock,
                            0,
                          ),
                        0,
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      ${calculateAverageCost(item)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem onClick={() => setItemToEdit(item)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setItemToDuplicate(item)}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setItemToDelete(item)}
                            className="text-red-500"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {selectedItem && (
        <ItemDetailsDialog
          item={selectedItem}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onRefresh={onRefresh}
          categories={categories}
          suppliers={suppliers}
          locations={locations}
        />
      )}

      {itemToEdit && (
        <EditItemDialog
          item={itemToEdit}
          open={!!itemToEdit}
          onOpenChange={(open) => !open && setItemToEdit(null)}
          onEdited={() => {
            setItemToEdit(null);
            onRefresh();
          }}
          categories={categories}
          suppliers={suppliers}
          locations={locations}
        />
      )}

      {itemToDelete && (
        <DeleteItemDialog
          item={itemToDelete}
          open={!!itemToDelete}
          onOpenChange={(open: boolean) => !open && setItemToDelete(null)}
          onDeleted={() => {
            setItemToDelete(null);
            onRefresh();
          }}
        />
      )}

      {itemToDuplicate && (
        <DuplicateItemDialog
          item={itemToDuplicate}
          open={!!itemToDuplicate}
          onOpenChange={(open) => !open && setItemToDuplicate(null)}
          onDuplicated={() => {
            setItemToDuplicate(null);
            onRefresh();
          }}
        />
      )}

      {/* Bulk Delete Dialog */}
      {itemsToDeleteBulk.length > 0 && (
        <BulkDeleteDialog
          items={itemsToDeleteBulk}
          open={itemsToDeleteBulk.length > 0}
          onOpenChange={(open) => !open && setItemsToDeleteBulk([])}
          onDeleted={() => {
            setItemsToDeleteBulk([]);
            setSelectedItems([]);
            onRefresh();
          }}
        />
      )}

      {/* Bulk Duplicate Dialog */}
      {itemsToDuplicateBulk.length > 0 && (
        <BulkDuplicateDialog
          items={itemsToDuplicateBulk}
          open={itemsToDuplicateBulk.length > 0}
          onOpenChange={(open) => !open && setItemsToDuplicateBulk([])}
          onDuplicated={() => {
            setItemsToDuplicateBulk([]);
            setSelectedItems([]);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// Recursive category component
function RecursiveCategoryList ({
  categories = [], // Add default empty array
  selectedCategory,
  onSelect,
  level,
}: {
  categories: CategoryWithChildren[];
  selectedCategory: string | null;
  onSelect: (id: string) => void;
  level: number;
}) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  return (
    <>
      {categories.map((category) => (
        <div key={category.id}>
          <CommandItem
            onSelect={() => onSelect(category.id)}
            style={{ paddingLeft: `${level * 16 + 8}px` }} // Fix padding using style
          >
            <Check
              className={cn(
                'mr-2 h-4 w-4',
                selectedCategory === category.id ? 'opacity-100' : 'opacity-0',
              )}
            />
            {category.name}
          </CommandItem>
          {category.children?.length > 0 && (
            <RecursiveCategoryList
              categories={category.children}
              selectedCategory={selectedCategory}
              onSelect={onSelect}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </>
  );
}

export default ItemsTable;
