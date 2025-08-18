'use client';

import { useEffect, useState } from 'react';
import {
  getLowStockItems,
  StockItem,
} from '@/components/dashboard/inventory/services/inventoryStockService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// import { DataTableSkeleton } from "./DataTableSkeleton"; // Assuming this exists for loading state
import { Badge } from '@/components/ui/badge';

export function LowStockItems () {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData () {
      setLoading(true);
      setError(null);
      try {
        const response = await getLowStockItems(5); // Example threshold

        if (response.success && response.data) {
          setItems(response.data);
        } else {
          setError(response.error || 'Failed to fetch low stock items');
        }
      } catch (err) {
        console.error(err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card className="w-full xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Low Stock Items</CardTitle>
          <CardDescription>Items with stock level 5 or less.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto overflow-y-auto max-h-[400px]">
        {loading ? (
          // <DataTableSkeleton columnsCount={5} rowsCount={5} />
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No low stock items found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="text-right">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {item.category}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.location}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={item.stock <= 2 ? 'destructive' : 'outline'}
                    >
                      {item.stock}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
