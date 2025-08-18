'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

interface RepairPriceColumnProps {
  repairId: string;
  price?: number;
  labour?: number;
}

export const RepairPriceColumn: React.FC<RepairPriceColumnProps> = ({
  repairId,
  price = 0,
  labour = 0,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number>(price + labour);
  const [priceBreakdown, setPriceBreakdown] = useState<{
    parts: number;
    labour: number;
  }>({
    parts: price,
    labour: labour,
  });

  // Calculate the total price when props change
  useEffect(() => {
    setTotalPrice(price + labour);
    setPriceBreakdown({
      parts: price,
      labour: labour,
    });
  }, [price, labour]);

  return (
    <div className="flex items-center space-x-2">
      <span className="font-medium">${totalPrice.toFixed(2)}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-1.5">
              <p className="font-semibold">Price Breakdown</p>
              <div className="flex justify-between">
                <span>Parts:</span>
                <span>${priceBreakdown.parts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Labour:</span>
                <span>${priceBreakdown.labour.toFixed(2)}</span>
              </div>
              <div className="border-t pt-1.5 mt-1.5 flex justify-between font-medium">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isLoading && (
        <Badge variant="outline" className="animate-pulse">
          Updating...
        </Badge>
      )}
    </div>
  );
};

export default RepairPriceColumn;
