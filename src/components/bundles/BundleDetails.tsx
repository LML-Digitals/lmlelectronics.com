'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  Star,
  Check,
  ArrowLeft,
  Info,
  Truck,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCartStore } from '@/lib/stores/useCartStore';
import { toast } from 'sonner';

export interface BundleDetailsProps {
  bundle: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    variations: Array<{
      id: string;
      name: string;
      sku: string;
      sellingPrice: number;
    }>;
    bundleComponents: Array<{
      id: string;
      quantity: number;
      displayOrder: number;
      isHighlight: boolean;
      componentVariation: {
        id: string;
        name: string;
        sku: string;
        sellingPrice: number;
        image: string | null;
        inventoryItem: {
          name: string;
          description: string | null;
        } | null;
      };
    }>;
    calculatedStock: any;
  };
}

export default function BundleDetails ({ bundle }: BundleDetailsProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addItem } = useCartStore();

  const mainVariation = bundle.variations[0];

  // Calculate savings
  const componentTotal = bundle.bundleComponents.reduce(
    (sum, comp) => sum + comp.componentVariation.sellingPrice * comp.quantity,
    0,
  );
  const bundlePrice = mainVariation?.sellingPrice || 0;
  const savings = componentTotal - bundlePrice;
  const savingsPercent
    = componentTotal > 0 ? (savings / componentTotal) * 100 : 0;

  // Get stock info
  const getStockInfo = () => {
    if (typeof bundle.calculatedStock === 'number') {
      return bundle.calculatedStock;
    }
    if (Array.isArray(bundle.calculatedStock)) {
      return bundle.calculatedStock.reduce(
        (total: number, stock: any) => total + stock.availableStock,
        0,
      );
    }

    return 0;
  };

  const stock = getStockInfo();
  const maxQuantity = Math.min(stock, 10); // Limit to 10 or available stock

  // Sort components by display order, with highlights first
  const sortedComponents = [...bundle.bundleComponents].sort((a, b) => {
    if (a.isHighlight && !b.isHighlight) { return -1; }
    if (!a.isHighlight && b.isHighlight) { return 1; }

    return a.displayOrder - b.displayOrder;
  });

  const handleAddToCart = () => {
    if (stock === 0) {
      toast.error(`${bundle.name} is currently out of stock.`);

      return;
    }

    if (selectedQuantity > stock) {
      toast.error(`Only ${stock} units available. Please reduce the quantity.`);

      return;
    }

    // Add each item based on selected quantity
    for (let i = 0; i < selectedQuantity; i++) {
      addItem({
        id: mainVariation.id,
        name: bundle.name,
        type: 'bundle',
        description:
          bundle.description
          || `Bundle with ${bundle.bundleComponents.length} components`,
        price: bundlePrice,
        profit: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        image: bundle.image || '',
      });
    }

    toast.success(`${selectedQuantity} x ${bundle.name} added to your cart.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      {/* <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-secondary hover:text-secondary/80">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href="/bundles"
              className="text-secondary hover:text-secondary/80"
            >
              Bundles
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 font-medium">{bundle.name}</span>
          </nav>
        </div>
      </div> */}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg border p-8 flex items-center justify-center">
              {bundle.image ? (
                <Image
                  src={bundle.image}
                  alt={bundle.name}
                  width={500}
                  height={500}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-accent text-black">Complete Bundle</Badge>
                {stock > 0 ? (
                  <Badge
                    variant="outline"
                    className="border-green-500 text-green-700"
                  >
                    In Stock ({stock} available)
                  </Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {bundle.name}
              </h1>
              <p className="text-gray-600 text-lg">{mainVariation?.sku}</p>
            </div>

            {/* Description */}
            {bundle.description && (
              <div>
                <p className="text-gray-700 leading-relaxed">
                  {bundle.description}
                </p>
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-secondary">
                  ${bundlePrice.toFixed(2)}
                </span>
                {savings > 0 && (
                  <span className="text-xl text-gray-500 line-through">
                    ${componentTotal.toFixed(2)}
                  </span>
                )}
              </div>
              {savingsPercent > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">
                    Save ${savings.toFixed(2)} ({savingsPercent.toFixed(0)}%)
                  </Badge>
                </div>
              )}
            </div>

            {/* Key Features */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">What's Included:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {bundle.bundleComponents.length} Components
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Professional Quality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Complete Kit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Expert Curated</span>
                </div>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="font-medium">
                  Quantity:
                </label>
                <select
                  id="quantity"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value))
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                  disabled={stock === 0}
                >
                  {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={stock === 0}
                  className="flex-1 h-12 bg-secondary text-black cursor-pointer"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-6 w-6 text-secondary mx-auto mb-2" />
                <p className="text-xs text-gray-600">Fast Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 text-secondary mx-auto mb-2" />
                <p className="text-xs text-gray-600">Quality Guarantee</p>
              </div>
              <div className="text-center">
                <RefreshCw className="h-6 w-6 text-secondary mx-auto mb-2" />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="components" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
              </TabsList>

              <TabsContent value="components" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Included Components</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Individual Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedComponents.map((component) => (
                        <TableRow key={component.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {component.componentVariation.image ? (
                                <Image
                                  src={component.componentVariation.image}
                                  alt={component.componentVariation.name}
                                  width={40}
                                  height={40}
                                  className="rounded border"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                                  <Package className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">
                                  {component.componentVariation.name}
                                </p>
                                {component.isHighlight && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Highlight
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {component.componentVariation.sku}
                          </TableCell>
                          <TableCell>{component.quantity}</TableCell>
                          <TableCell>
                            ${component.componentVariation.sellingPrice}
                          </TableCell>
                          <TableCell className="font-medium">
                            $
                            {(
                              component.componentVariation.sellingPrice
                              * component.quantity
                            ).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell colSpan={4} className="font-semibold">
                          Individual Total:
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${componentTotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="font-semibold text-secondary"
                        >
                          Bundle Price:
                        </TableCell>
                        <TableCell className="font-semibold text-secondary">
                          ${bundlePrice.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      {savings > 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="font-semibold text-green-600"
                          >
                            Your Savings:
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            ${savings.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Bundle Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">General Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Bundle SKU:</span>
                          <span className="font-mono">
                            {mainVariation?.sku}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Components:</span>
                          <span>{bundle.bundleComponents.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bundle Type:</span>
                          <span>Complete Repair Kit</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Quality & Support</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Quality Grade:</span>
                          <span>Professional</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Warranty:</span>
                          <span>90 Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Support:</span>
                          <span>Expert Technical</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Shipping Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Shipping Options</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Standard Shipping (3-5 business days)</li>
                          <li>• Express Shipping (1-2 business days)</li>
                          <li>• Overnight Shipping (next business day)</li>
                          <li>• Local Pickup Available</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Return Policy</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• 30-day return window</li>
                          <li>• Original packaging required</li>
                          <li>• Free return shipping on defects</li>
                          <li>• Quick refund processing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Back to Bundles */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/bundles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bundles
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
