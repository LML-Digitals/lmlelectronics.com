'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Info, ShoppingCart, AlertCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface BundleComponent {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface BundleIndicatorProps {
  isBundle: boolean;
  componentCount?: number;
  components?: BundleComponent[];
  totalComponentPrice?: number;
  bundlePrice?: number;
  className?: string;
  showDetails?: boolean;
}

export default function BundleIndicator ({
  isBundle,
  componentCount,
  components = [],
  totalComponentPrice,
  bundlePrice,
  className = '',
  showDetails = false,
}: BundleIndicatorProps) {
  if (!isBundle) {
    return null;
  }

  const savings
    = totalComponentPrice && bundlePrice ? totalComponentPrice - bundlePrice : 0;

  const savingsPercent
    = totalComponentPrice && savings > 0
      ? ((savings / totalComponentPrice) * 100).toFixed(0)
      : 0;

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <Badge
        variant="secondary"
        className="bg-blue-100 text-blue-800 border-blue-200"
      >
        <Package className="h-3 w-3 mr-1" />
        Bundle
      </Badge>

      {componentCount && (
        <Badge variant="outline" className="text-xs">
          {componentCount} {componentCount === 1 ? 'item' : 'items'}
        </Badge>
      )}

      {showDetails && components.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Info className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Bundle Contents
                </CardTitle>
                {savings > 0 && (
                  <CardDescription className="text-green-600 font-medium">
                    Save ${savings.toFixed(2)} ({savingsPercent}%)
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {components.map((component, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{component.name}</p>
                        <p className="text-xs text-gray-500">{component.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {component.quantity}x ${component.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {totalComponentPrice && (
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Individual Total:</span>
                        <span>${totalComponentPrice.toFixed(2)}</span>
                      </div>
                      {bundlePrice && (
                        <>
                          <div className="flex justify-between text-sm font-medium">
                            <span>Bundle Price:</span>
                            <span>${bundlePrice.toFixed(2)}</span>
                          </div>
                          {savings > 0 && (
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                              <span>You Save:</span>
                              <span>${savings.toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

// Simple version for list displays
export function BundleBadge ({
  isBundle,
  componentCount,
  className = '',
}: {
  isBundle: boolean;
  componentCount?: number;
  className?: string;
}) {
  if (!isBundle) { return null; }

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <Badge
        variant="secondary"
        className="bg-blue-100 text-blue-800 border-blue-200 text-xs"
      >
        <Package className="h-3 w-3 mr-1" />
        Bundle
      </Badge>
      {componentCount && (
        <span className="text-xs text-gray-500">({componentCount})</span>
      )}
    </div>
  );
}

// Stock warning for bundles
export function BundleStockWarning ({
  isBundle,
  stock,
  componentLimitations = [],
}: {
  isBundle: boolean;
  stock: number;
  componentLimitations?: Array<{
    name: string;
    available: number;
    needed: number;
  }>;
}) {
  if (!isBundle || stock > 0) { return null; }

  const limitingComponents = componentLimitations.filter((comp) => Math.floor(comp.available / comp.needed) === 0);

  if (limitingComponents.length === 0) { return null; }

  return (
    <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <div className="flex-1">
        <p className="text-sm text-red-800 font-medium">Bundle unavailable</p>
        <p className="text-xs text-red-600">
          Missing: {limitingComponents.map((comp) => comp.name).join(', ')}
        </p>
      </div>
    </div>
  );
}
