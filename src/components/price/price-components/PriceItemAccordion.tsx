"use client";

import { PriceItem } from "../types/priceTypes";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  Tag,
  Clock,
  AlertTriangle,
  DollarSign,
  Info,
  Truck,
  Calculator,
  Wrench,
  Percent,
  Copy,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

interface PriceItemAccordionProps {
  items: PriceItem[];
  onSelect: (item: PriceItem) => void;
  onViewDetails: (item: PriceItem) => void;
  onAddToCalculator?: (item: PriceItem) => void;
  isCalculator?: boolean
}

export const PriceItemAccordion: React.FC<PriceItemAccordionProps> = ({
  items,
  onSelect,
  onViewDetails,
  onAddToCalculator,
  isCalculator,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">
          No items found. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Accordion type="single" collapsible className="w-full">
        {items.map((item) => {
          // Calculate component costs for each item
          let totalCost = 0;
          let cost = 0;
          let profit = 0;

          if (item.type === "repair") {
            if (item.variation) {
              totalCost = item.basePrice || 0;
            }
          } else if (item.type === "product") {
            const raw = item.raw || 0
            const tax = item.tax || 0
            const shipping = item.shipping || 0
            const markup = item.markup || 0

            cost = raw + raw * (tax / 100) + shipping;
            totalCost = cost + cost * (markup / 100);
            profit = totalCost - cost;

          }

          // Labor cost for repairs
          const laborCost = item.type === "repair" ? Number(item.labour || 0) : 0;

          return (
            <AccordionItem
              key={item.id}
              value={item.id.toString()}
              className="border-b border-border hover:bg-accent/5 transition-colors"
            >
              <AccordionTrigger className="hover:no-underline py-3 px-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center text-left">
                    {item.imageUrl ? (
                      <div className="relative h-12 w-12 mr-3 rounded overflow-hidden border border-border flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 mr-3 rounded flex items-center justify-center bg-muted flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <span className="font-medium line-clamp-1">
                        {item.name}
                      </span>
                      <div className="flex items-center mt-1 gap-1.5">
                        <Badge
                          variant={
                            item.type === "repair" ? "secondary" : "default"
                          }
                          className="text-xs px-1.5 py-0"
                        >
                          {item.type}
                        </Badge>
                        {item.category && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0"
                          >
                            {item.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-sm sm:text-base text-primary">
                      ${item.finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-5 pt-1">
                <div className="space-y-4">
                  {item.description && (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                      {item.description}
                    </div>
                  )}

                  {/* Simplified pricing information - only showing the required fields */}
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    {item.type === "product" ? (
                      // For products: cost, markup, total price
                      <>
                        {/* Cost */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-between cursor-help">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Info className="h-3.5 w-3.5" />
                                Cost:
                              </span>
                              <span className="font-medium">
                                ${cost.toFixed(2)}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Base cost including tax and shipping</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Markup */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-between cursor-help">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Calculator className="h-3.5 w-3.5" />
                                Profit:
                              </span>
                              <span className="font-medium">
                                ${profit.toFixed(2)}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Profit margin added to the cost</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Final price */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-between cursor-help">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                Total:
                              </span>
                              <span className="font-bold text-primary">
                                ${totalCost.toFixed(2)}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Final selling price (cost + profit)</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    ) : (
                      // For repairs: item cost (including markup), labor, final price
                      <>
                        {/* Item cost with markup */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-between cursor-help">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Info className="h-3.5 w-3.5" />
                                Item:
                              </span>
                              <span className="font-medium">
                                ${(item.basePrice).toFixed(2)}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cost of replacement parts</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Labor */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-between cursor-help">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Wrench className="h-3.5 w-3.5" />
                                Labor:
                              </span>
                              <span className="font-medium">
                                ${laborCost.toFixed(2)}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Service fee for repair work</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Final price */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-between cursor-help">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                Total:
                              </span>
                              <span className="font-bold text-primary">
                                ${item.finalPrice.toFixed(2)}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total repair cost (parts + labor)</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // Create a modified item with ONLY the calculated price, ignoring any stored price
                            const updatedItem = {
                              ...item,
                              // Override any existing finalPrice with our calculation
                              // finalPrice: calculatedFinalPrice,
                            };

                            if (onAddToCalculator) {
                              onAddToCalculator(updatedItem);
                            } else {
                              onSelect(updatedItem);
                            }
                          }}
                        >
                          {isCalculator ? (
                            <>
                              <Calculator className="h-4 w-4 mr-2" />
                              Add to Calculator
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy to Clipboard
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isCalculator 
                            ? "Add this item to the price calculator" 
                            : "Copy price information to clipboard"
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            onViewDetails({
                              ...item,
                              // Override any existing finalPrice with our calculation
                              // finalPrice: calculatedFinalPrice,
                            })
                          }
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View detailed information and edit this item</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </TooltipProvider>
  );
};

export default PriceItemAccordion;
