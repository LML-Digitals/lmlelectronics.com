'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import { PriceItem } from '../types/priceTypes';
import { useToast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import dynamic from 'next/dynamic';

// Dynamically import the PriceCheckerPage to avoid SSR issues
const PriceCheckerPage = dynamic(() => import('@/app/dashboard/price-checker/page'), { ssr: false });

export const GlobalPriceSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSelectPrice = (item: PriceItem) => {
    // Copy the price to clipboard
    navigator.clipboard.writeText(`$${item.finalPrice.toFixed(2)}`);

    // Show a toast notification
    toast({
      title: 'Price copied to clipboard',
      description: `${item.name}: $${item.finalPrice.toFixed(2)}`,
      duration: 3000,
    });

    setOpen(false);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <Dialog open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <DollarSign className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Price lookup</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Price lookup</p>
          </TooltipContent>
          <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] p-0 overflow-hidden flex flex-col bg-background">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="h-5 w-5" />
                <span>Price Lookup</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-0">
              {/* Use the new hierarchical price checker UI with padding */}
              <div className="p-6 mb-6">
                <PriceCheckerPage />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GlobalPriceSearch;
