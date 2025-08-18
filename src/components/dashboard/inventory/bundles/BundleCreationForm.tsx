'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search, Package } from 'lucide-react';
import {
  createBundle,
  createBundleVariation,
} from '@/components/dashboard/inventory/bundles/services/bundles';
import { toast } from '@/components/ui/use-toast';

interface InventoryVariation {
  id: string;
  sku: string;
  name: string;
  sellingPrice: number;
  inventoryItem: {
    id: string;
    name: string;
    isBundle: boolean;
  };
  stockLevels: {
    id: string;
    stock: number;
    location: {
      id: number;
      name: string;
    };
  }[];
}

interface BundleComponent {
  componentVariationId: string;
  variation: InventoryVariation;
  quantity: number;
  displayOrder: number;
  isHighlight: boolean;
}

interface BundleCreationFormProps {
  categories: Array<{ id: string; name: string }>;
  suppliers: Array<{ id: number; name: string }>;
  variations: InventoryVariation[];
}

export default function BundleCreationForm ({
  categories,
  suppliers,
  variations,
}: BundleCreationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Bundle basic info
  const [bundleInfo, setBundleInfo] = useState({
    name: '',
    description: '',
    image: '',
    categoryIds: [] as string[],
    supplierId: undefined as number | undefined,
  });

  // Bundle variation info
  const [variationInfo, setVariationInfo] = useState({
    sku: '',
    name: '',
    sellingPrice: 0,
    image: '',
  });

  // Bundle components
  const [components, setComponents] = useState<BundleComponent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariation, setSelectedVariation]
    = useState<InventoryVariation | null>(null);
  const [componentQuantity, setComponentQuantity] = useState(1);

  // Filter available variations (exclude bundles and already added components)
  const availableVariations = variations.filter((v) => !v.inventoryItem.isBundle
      && !components.some((c) => c.componentVariationId === v.id)
      && (v.name.toLowerCase().includes(searchTerm.toLowerCase())
        || v.sku.toLowerCase().includes(searchTerm.toLowerCase())));

  const handleAddComponent = () => {
    if (!selectedVariation) { return; }

    const newComponent: BundleComponent = {
      componentVariationId: selectedVariation.id,
      variation: selectedVariation,
      quantity: componentQuantity,
      displayOrder: components.length,
      isHighlight: false,
    };

    setComponents([...components, newComponent]);
    setSelectedVariation(null);
    setComponentQuantity(1);
    setSearchTerm('');
  };

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const updated = [...components];

    updated[index].quantity = quantity;
    setComponents(updated);
  };

  const handleToggleHighlight = (index: number) => {
    const updated = [...components];

    updated[index].isHighlight = !updated[index].isHighlight;
    setComponents(updated);
  };

  const calculateTotalCost = () => {
    return components.reduce((total, component) => {
      return total + component.variation.sellingPrice * component.quantity;
    }, 0);
  };

  const handleSubmit = async () => {
    if (
      !bundleInfo.name
      || !variationInfo.sku
      || !variationInfo.name
      || components.length === 0
    ) {
      toast({
        title: 'Error',
        description:
          'Please fill in all required fields and add at least one component',
      });

      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create the bundle item
      const bundleResult = await createBundle(bundleInfo);

      if (!bundleResult.success) {
        throw new Error(bundleResult.error);
      }

      // Step 2: Create the bundle variation with components
      const variationResult = await createBundleVariation({
        bundleItemId: bundleResult.bundle!.id,
        ...variationInfo,
        components: components.map((c) => ({
          componentVariationId: c.componentVariationId,
          quantity: c.quantity,
          displayOrder: c.displayOrder,
          isHighlight: c.isHighlight,
        })),
      });

      if (!variationResult.success) {
        throw new Error(variationResult.error);
      }

      toast({
        title: 'Success',
        description: 'Bundle created successfully!',
      });
      router.push('/dashboard/inventory/bundles');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create bundle',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center space-x-4">
        <div
          className={`flex items-center space-x-2 ${
            step >= 1 ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= 1
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300'
            }`}
          >
            1
          </div>
          <span className="font-medium">Basic Info</span>
        </div>
        <div className="flex-1 h-px bg-gray-300" />
        <div
          className={`flex items-center space-x-2 ${
            step >= 2 ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= 2
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300'
            }`}
          >
            2
          </div>
          <span className="font-medium">Variation</span>
        </div>
        <div className="flex-1 h-px bg-gray-300" />
        <div
          className={`flex items-center space-x-2 ${
            step >= 3 ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= 3
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300'
            }`}
          >
            3
          </div>
          <span className="font-medium">Components</span>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Bundle Basic Information</CardTitle>
            <CardDescription>
              Set up the basic details for your bundle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bundle Name *</Label>
              <Input
                id="name"
                value={bundleInfo.name}
                onChange={(e) => setBundleInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., iPhone 14 Screen Repair Kit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={bundleInfo.description}
                onChange={(e) => setBundleInfo((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
                }
                placeholder="Describe what's included in this bundle..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={bundleInfo.image}
                onChange={(e) => setBundleInfo((prev) => ({ ...prev, image: e.target.value }))
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  onValueChange={(value) => setBundleInfo((prev) => ({ ...prev, categoryIds: [value] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select
                  onValueChange={(value) => setBundleInfo((prev) => ({
                    ...prev,
                    supplierId: parseInt(value),
                  }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.id}
                        value={supplier.id.toString()}
                      >
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!bundleInfo.name}>
                Next: Variation Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Bundle Variation</CardTitle>
            <CardDescription>
              Create a variation for this bundle with SKU and pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={variationInfo.sku}
                  onChange={(e) => setVariationInfo((prev) => ({
                    ...prev,
                    sku: e.target.value,
                  }))
                  }
                  placeholder="e.g., KIT-IP14-SCR"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variation-name">Variation Name *</Label>
                <Input
                  id="variation-name"
                  value={variationInfo.name}
                  onChange={(e) => setVariationInfo((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                  }
                  placeholder="e.g., Standard Kit"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling-price">Selling Price *</Label>
              <Input
                id="selling-price"
                type="number"
                step="0.01"
                min="0"
                value={variationInfo.sellingPrice}
                onChange={(e) => setVariationInfo((prev) => ({
                  ...prev,
                  sellingPrice: parseFloat(e.target.value) || 0,
                }))
                }
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variation-image">Variation Image URL</Label>
              <Input
                id="variation-image"
                value={variationInfo.image}
                onChange={(e) => setVariationInfo((prev) => ({
                  ...prev,
                  image: e.target.value,
                }))
                }
                placeholder="https://example.com/variation-image.jpg"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!variationInfo.sku || !variationInfo.name}
              >
                Next: Add Components
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {/* Add Components Section */}
          <Card>
            <CardHeader>
              <CardTitle>Add Components</CardTitle>
              <CardDescription>
                Search and add products to include in this bundle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Products</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or SKU..."
                    />
                  </div>
                </div>
                <div className="w-24">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={componentQuantity}
                    onChange={(e) => setComponentQuantity(parseInt(e.target.value) || 1)
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAddComponent}
                    disabled={!selectedVariation}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {searchTerm && (
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {availableVariations.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center">
                      No products found
                    </p>
                  ) : (
                    availableVariations.map((variation) => (
                      <div
                        key={variation.id}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                          selectedVariation?.id === variation.id
                            ? 'bg-blue-50'
                            : ''
                        }`}
                        onClick={() => setSelectedVariation(variation)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{variation.name}</p>
                            <p className="text-sm text-gray-500">
                              SKU: {variation.sku}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ${variation.sellingPrice}
                            </p>
                            <p className="text-sm text-gray-500">
                              Stock:{' '}
                              {variation.stockLevels.reduce(
                                (sum, level) => sum + level.stock,
                                0,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bundle Components List */}
          <Card>
            <CardHeader>
              <CardTitle>Bundle Components ({components.length})</CardTitle>
              <CardDescription>
                Components that will be included in this bundle
              </CardDescription>
            </CardHeader>
            <CardContent>
              {components.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No components added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {components.map((component, index) => (
                    <div
                      key={`${component.componentVariationId}-${index}`}
                      className="flex items-center space-x-4 p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            {component.variation.name}
                          </h4>
                          {component.isHighlight && (
                            <Badge variant="secondary">Highlighted</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          SKU: {component.variation.sku} • $
                          {component.variation.sellingPrice} each
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`qty-${index}`} className="sr-only">
                          Quantity
                        </Label>
                        <Input
                          id={`qty-${index}`}
                          type="number"
                          min="1"
                          value={component.quantity}
                          onChange={(e) => handleUpdateQuantity(
                            index,
                            parseInt(e.target.value) || 1,
                          )
                          }
                          className="w-20"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleHighlight(index)}
                        >
                          {component.isHighlight ? 'Unhighlight' : 'Highlight'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveComponent(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Component Cost:</span>
                      <span className="text-lg font-semibold">
                        ${calculateTotalCost().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Bundle Selling Price:</span>
                      <span>${variationInfo.sellingPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || components.length === 0}
            >
              {isLoading ? 'Creating Bundle...' : 'Create Bundle'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
