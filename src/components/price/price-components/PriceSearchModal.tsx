"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import { PriceItem } from "../types/priceTypes";

// Dynamically import the PriceCheckerPage to avoid SSR issues
const PriceCheckerPage = dynamic(() => import("@/app/dashboard/price-checker/page"), { ssr: false });

interface PriceSearchModalProps {
  trigger?: React.ReactNode;
  onSelectPrice: (item: PriceItem) => void;
  initialType?: "all" | "repair" | "product";
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  buttonLabel?: string;
}

export const PriceSearchModal: React.FC<PriceSearchModalProps> = ({
  trigger,
  onSelectPrice,
  initialType = "all",
  buttonVariant = "outline",
  buttonLabel = "Search Prices",
}) => {
  const [open, setOpen] = useState(false);

  const handleSelectPrice = (item: PriceItem) => {
    onSelectPrice(item);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5">
            <Search className="h-4 w-4" />
            <span>{buttonLabel}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] p-0 overflow-hidden flex flex-col bg-background">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Search className="h-5 w-5" />
            <span>Search Prices</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-0">
          <div className="p-6 mb-6">
            <PriceCheckerPage />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceSearchModal;
