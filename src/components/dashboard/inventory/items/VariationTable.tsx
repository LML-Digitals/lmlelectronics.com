'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { VariationImage } from './types/types';
import { ImageIcon } from './icons';

export function VariationTable({
  variations,
  variationImages,
  onEdit,
  onDelete,
}: {
  variations: any[];
  variationImages: VariationImage[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  if (variations.length === 0) {
    return (
      <div className="text-center p-4 border rounded-lg text-slate-500">
        No variations added yet
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <ScrollArea className="h-[400px] w-full">
        <div className="min-w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variations.map((variation, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {variationImages[index]?.preview ? (
                      <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                        <Image
                          src={variationImages[index]?.preview}
                          alt={variation.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center bg-slate-100 rounded-md">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{variation.name}</TableCell>
                  <TableCell className="font-mono text-sm">{variation.sku}</TableCell>
                  <TableCell>
                    {Object.entries(variation.stockLevels).reduce(
                      (total, [_, stockInfo]: any) => {
                        return total + (parseInt(stockInfo.stock) || 0);
                      },
                      0
                    )}{' '}
                    units
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(index)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        title="Edit variation"
                      >
                        <Pencil className="text-blue-500 h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(index)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                        title="Delete variation"
                      >
                        <Trash2 className="text-red-500 h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
