'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Package2,
  X,
  Save,
  Info,
  Upload,
  Shuffle,
  Image as ImageIcon,
} from 'lucide-react';
import {
  getBundles,
  createBundle,
  createBundleVariation,
  getBundleById,
  updateBundle,
  addBundleComponents,
  removeBundleComponent,
  getBundleStock,
  deleteBundle,
  calculateBundleStockDynamic,
  refreshBundleStocks,
} from '@/components/dashboard/inventory/bundles/services/bundles';
import { toast } from '@/components/ui/use-toast';
import { generateSKU } from '../items/utils/generateSKU';

interface Location {
  id: number;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface InventoryVariation {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  image: string | null;
  inventoryItem: {
    name: string;
    description: string | null;
  } | null;
  stockLevels: Array<{
    stock: number;
    location: {
      id: number;
      name: string;
    };
  }>;
}

interface Bundle {
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
    componentVariation: {
      id: string;
      name: string;
      sku: string;
      sellingPrice: number;
    };
  }>;
  calculatedStock: any;
}

interface BundleManagementProps {
  locations: Location[];
  categories: Category[];
  suppliers: Supplier[];
  variations: InventoryVariation[];
}

export default function BundleManagement ({
  locations,
  categories,
  suppliers,
  variations,
}: BundleManagementProps) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingStock, setIsRefreshingStock] = useState(false);
  const [refreshingBundleIds, setRefreshingBundleIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<number>(locations[0]?.id || 0);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Create/Edit form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    categoryIds: [] as string[],
    supplierId: undefined as number | undefined,
    sku: '',
    sellingPrice: 0,
    selectedComponents: [] as Array<{
      id: string;
      name: string;
      sku: string;
      price: number;
      quantity: number;
    }>,
  });

  // Image upload state
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Component search for creation/editing
  const [componentSearch, setComponentSearch] = useState('');
  const [componentSearchResults, setComponentSearchResults] = useState<
    InventoryVariation[]
  >([]);

  // Calculate component total
  const componentTotal = formData.selectedComponents.reduce(
    (sum, comp) => sum + comp.price * comp.quantity,
    0,
  );

  // Update selling price when components change
  useEffect(() => {
    if (componentTotal > 0 && formData.sellingPrice === 0) {
      setFormData((prev) => ({ ...prev, sellingPrice: componentTotal }));
    }
  }, [componentTotal]);

  useEffect(() => {
    loadBundles();
  }, []); // Remove selectedLocation dependency since we want all locations

  // Auto-refresh stock every 30 seconds
  useEffect(() => {
    // DISABLED: This was causing high function invocations
    // TODO: Re-enable if auto-refresh is needed
    /*
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshingStock) {
        refreshStock();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
    */
  }, [isLoading, isRefreshingStock]); // Remove selectedLocation dependency

  useEffect(() => {
    // Filter variations based on search
    if (componentSearch.trim()) {
      const filtered = variations
        .filter((v) => v.name.toLowerCase().includes(componentSearch.toLowerCase())
            || v.sku.toLowerCase().includes(componentSearch.toLowerCase()))
        .slice(0, 10);

      setComponentSearchResults(filtered);
    } else {
      setComponentSearchResults([]);
    }
  }, [componentSearch, variations]);

  // Filter bundles based on search
  const filteredBundles = bundles.filter((bundle) => bundle.name.toLowerCase().includes(searchQuery.toLowerCase())
      || bundle.description?.toLowerCase().includes(searchQuery.toLowerCase())
      || bundle.variations.some((v) => v.sku.toLowerCase().includes(searchQuery.toLowerCase())));

  const loadBundles = async () => {
    try {
      setIsLoading(true);
      // Load bundles with stock for ALL locations, not filtered by selectedLocation
      const result = await getBundles(); // No locationId parameter

      if (result.success) {
        setBundles(result.bundles || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bundles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced refresh stock function
  const refreshStock = async (showToast = false) => {
    try {
      setIsRefreshingStock(true);

      // Get fresh stock for all bundles across ALL locations
      const stockResult = await refreshBundleStocks(); // No locationId parameter

      if (stockResult.success && stockResult.stocks) {
        // Update bundles with new stock data
        setBundles((currentBundles) => currentBundles.map((bundle) => {
          const stockData = stockResult.stocks.find((s) => s.bundleId === bundle.id);

          return {
            ...bundle,
            calculatedStock: stockData
              ? stockData.stock
              : bundle.calculatedStock,
          };
        }));

        if (showToast) {
          toast({
            title: 'Success',
            description: 'Stock levels refreshed across all locations',
          });
        }
      } else {
        throw new Error('Failed to refresh stock');
      }
    } catch (error) {
      if (showToast) {
        toast({
          title: 'Error',
          description: 'Failed to refresh stock levels',
          variant: 'destructive',
        });
      }
    } finally {
      setIsRefreshingStock(false);
    }
  };

  // Enhanced update individual bundle stock
  const updateBundleStock = async (bundleId: string) => {
    try {
      setRefreshingBundleIds((prev) => new Set([...prev, bundleId]));

      // Calculate stock across ALL locations, not just selected location
      const stockResult = await calculateBundleStockDynamic(bundleId); // No locationId parameter

      if (stockResult.success) {
        setBundles((currentBundles) => currentBundles.map((bundle) => bundle.id === bundleId
          ? { ...bundle, calculatedStock: stockResult.stock }
          : bundle));

        toast({
          title: 'Stock Updated',
          description: 'Bundle stock recalculated across all locations',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update stock',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to update bundle stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bundle stock',
        variant: 'destructive',
      });
    } finally {
      setRefreshingBundleIds((prev) => {
        const newSet = new Set(prev);

        newSet.delete(bundleId);

        return newSet;
      });
    }
  };

  // Remove the handleLocationChange function since we don't filter by location anymore

  const getStockInfo = (bundle: Bundle) => {
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

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const formDataUpload = new FormData();

      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();

      setFormData({ ...formData, image: url });

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setImageUploading(false);
    }
  };

  const generateSKUForBundle = () => {
    const sku = generateSKU();

    setFormData({ ...formData, sku });
  };

  const handleSubmit = async () => {
    if (
      !formData.name
      || !formData.sku
      || formData.selectedComponents.length === 0
    ) {
      toast({
        title: 'Error',
        description:
          'Please fill in all required fields and add at least one component',
        variant: 'destructive',
      });

      return;
    }

    if (isEditMode) {
      await handleUpdateBundle();
    } else {
      await handleCreateBundle();
    }
  };

  const handleCreateBundle = async () => {
    try {
      // Create bundle
      const bundleResult = await createBundle({
        name: formData.name,
        description: formData.description || undefined,
        image: formData.image || undefined,
        categoryIds: formData.categoryIds,
        supplierId: formData.supplierId,
      });

      if (!bundleResult.success) {
        throw new Error('Failed to create bundle');
      }

      // Create bundle variation with components
      const variationResult = await createBundleVariation({
        bundleItemId: bundleResult.bundle?.id || '',
        sku: formData.sku,
        name: formData.name,
        sellingPrice: formData.sellingPrice,
        image: formData.image || undefined,
        components: formData.selectedComponents.map((comp) => ({
          componentVariationId: comp.id,
          quantity: comp.quantity,
          displayOrder: 0,
          isHighlight: false,
        })),
      });

      if (!variationResult.success) {
        throw new Error('Failed to create bundle variation');
      }

      toast({
        title: 'Success',
        description: 'Bundle created successfully',
      });

      setShowCreateDialog(false);
      resetForm();
      loadBundles();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create bundle',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateBundle = async () => {
    if (!selectedBundle) { return; }

    try {
      const result = await updateBundle(selectedBundle, {
        name: formData.name,
        description: formData.description,
        image: formData.image,
      });

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Bundle updated successfully',
        });
        setShowCreateDialog(false);
        resetForm();
        loadBundles();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update bundle',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBundle = async (bundleId: string) => {
    try {
      const result = await deleteBundle(bundleId);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Bundle deleted successfully',
        });
        loadBundles();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete bundle',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      categoryIds: [],
      supplierId: undefined,
      sku: '',
      sellingPrice: 0,
      selectedComponents: [],
    });
    setIsEditMode(false);
    setSelectedBundle(null);
    setComponentSearch('');
    setComponentSearchResults([]);
  };

  const addComponent = (variation: InventoryVariation) => {
    const existing = formData.selectedComponents.find((comp) => comp.id === variation.id);

    if (existing) {
      updateComponentQuantity(variation.id, existing.quantity + 1);
    } else {
      const newComponent = {
        id: variation.id,
        name: variation.name,
        sku: variation.sku,
        price: variation.sellingPrice,
        quantity: 1,
      };

      setFormData({
        ...formData,
        selectedComponents: [...formData.selectedComponents, newComponent],
      });
    }

    setComponentSearch('');
    setComponentSearchResults([]);
  };

  const removeComponent = (componentId: string) => {
    setFormData({
      ...formData,
      selectedComponents: formData.selectedComponents.filter((comp) => comp.id !== componentId),
    });
  };

  const updateComponentQuantity = (componentId: string, quantity: number) => {
    setFormData({
      ...formData,
      selectedComponents: formData.selectedComponents.map((comp) => comp.id === componentId ? { ...comp, quantity } : comp),
    });
  };

  const openBundleDetails = (bundleId: string) => {
    setSelectedBundle(bundleId);
    setShowDetailsDialog(true);
  };

  const openEditMode = async (bundleId: string) => {
    try {
      const result = await getBundleById(bundleId);

      if (result.success && result.bundle) {
        const bundle = result.bundle;
        const mainVariation = bundle.variations[0];

        setFormData({
          name: bundle.name,
          description: bundle.description || '',
          image: bundle.image || '',
          categoryIds: bundle.categories?.map((c: any) => c.id) || [],
          supplierId: bundle.supplier?.id,
          sku: mainVariation?.sku || '',
          sellingPrice: mainVariation?.sellingPrice || 0,
          selectedComponents:
            bundle.bundleComponents?.map((comp: any) => ({
              id: comp.componentVariation.id,
              name: comp.componentVariation.name,
              sku: comp.componentVariation.sku,
              price: comp.componentVariation.sellingPrice,
              quantity: comp.quantity,
            })) || [],
        });

        setSelectedBundle(bundleId);
        setIsEditMode(true);
        setShowCreateDialog(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bundle for editing',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Bundle Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Create and manage product bundles for your repair shop
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => refreshStock(true)}
            disabled={isRefreshingStock || isLoading}
            className="w-full sm:w-auto"
          >
            {isRefreshingStock ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
            ) : (
              <Package className="h-4 w-4 mr-2" />
            )}
            Refresh Stock
          </Button>

          <Dialog
            open={showCreateDialog}
            onOpenChange={(open) => {
              setShowCreateDialog(open);
              if (!open) {
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Bundle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? 'Edit Bundle' : 'Create New Bundle'}
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? 'Update bundle information and components'
                    : 'Create a product bundle by combining multiple inventory items'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Bundle Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., iPhone 14 Screen Repair Kit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })
                        }
                        placeholder="e.g., KIT-IP14-SCR"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateSKUForBundle}
                        className="px-3"
                      >
                        <Shuffle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                    }
                    placeholder="Describe what this bundle includes..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Bundle Image</Label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })
                        }
                        placeholder="Image URL or upload below"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={imageUploading}
                        className="px-3"
                      >
                        {imageUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) { handleImageUpload(file); }
                      }}
                      className="hidden"
                    />
                    {formData.image && (
                      <div className="mt-2">
                        <img
                          src={formData.image}
                          alt="Bundle preview"
                          className="h-20 w-20 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Components Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bundle Components</h3>

                  {/* Add Component */}
                  <div className="space-y-2">
                    <Label>Add Component</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Search inventory items..."
                        value={componentSearch}
                        onChange={(e) => setComponentSearch(e.target.value)}
                        className="flex-1"
                      />
                    </div>

                    {componentSearchResults.length > 0 && (
                      <div className="border rounded-md max-h-64 overflow-y-auto">
                        {componentSearchResults.map((variation) => (
                          <div
                            key={variation.id}
                            className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-medium">{variation.name}</p>
                              <p className="text-sm text-gray-600">
                                {variation.sku} - ${variation.sellingPrice}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addComponent(variation)}
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Components */}
                  {formData.selectedComponents.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Components</Label>
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Component</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.selectedComponents.map((component) => (
                              <TableRow key={component.id}>
                                <TableCell>{component.name}</TableCell>
                                <TableCell>{component.sku}</TableCell>
                                <TableCell>${component.price}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={component.quantity}
                                    onChange={(e) => updateComponentQuantity(
                                      component.id,
                                      parseInt(e.target.value),
                                    )
                                    }
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>
                                  $
                                  {(
                                    component.price * component.quantity
                                  ).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeComponent(component.id)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="p-3 border-t bg-gray-50">
                          <div className="flex justify-between text-sm">
                            <span>Component Total:</span>
                            <span>${componentTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Section - moved below components */}
                {formData.selectedComponents.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Bundle Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Bundle Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.sellingPrice}
                          onChange={(e) => setFormData({
                            ...formData,
                            sellingPrice: parseFloat(e.target.value) || 0,
                          })
                          }
                          placeholder="0.00"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Defaults to component total ($
                          {componentTotal.toFixed(2)}). You can adjust this
                          price.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Pricing Summary</Label>
                        <div className="p-3 border rounded-md bg-gray-50 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Component Total:</span>
                            <span>${componentTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium">
                            <span>Bundle Price:</span>
                            <span>${formData.sellingPrice.toFixed(2)}</span>
                          </div>
                          {formData.sellingPrice < componentTotal && (
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                              <span>Customer Saves:</span>
                              <span>
                                $
                                {(
                                  componentTotal - formData.sellingPrice
                                ).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {isEditMode ? 'Update Bundle' : 'Create Bundle'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search bundles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            {/* Remove the location selector since we show all locations */}
            <div className="text-sm text-muted-foreground">
              Showing stock across all locations
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Bundles ({filteredBundles.length})
            </div>
            <div className="flex items-center space-x-4">
              {isRefreshingStock && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                  Updating stock...
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Auto-refresh: 30s | All locations
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredBundles.length === 0 ? (
            <div className="text-center py-8">
              <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">
                No bundles found
              </h3>
              <p className="text-gray-500">
                Create your first bundle to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bundle</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBundles.map((bundle) => {
                  const mainVariation = bundle.variations[0];
                  const isRefreshing = refreshingBundleIds.has(bundle.id);
                  const totalStock = getStockInfo(bundle);

                  return (
                    <TableRow key={bundle.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {bundle.image ? (
                              <img
                                src={bundle.image}
                                alt={bundle.name}
                                className="h-10 w-10 object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{bundle.name}</span>
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800"
                              >
                                Bundle
                              </Badge>
                            </div>
                            {bundle.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {bundle.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {mainVariation?.sku}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {bundle.bundleComponents.length} components
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={totalStock > 0 ? 'default' : 'destructive'}
                          >
                            {totalStock} available
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateBundleStock(bundle.id)}
                            disabled={isRefreshing}
                            className="h-6 w-6 p-0"
                            title="Refresh stock"
                          >
                            {isRefreshing ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
                            ) : (
                              <Package className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${mainVariation?.sellingPrice?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openBundleDetails(bundle.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditMode(bundle.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Bundle
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{bundle.name}
                                  "? This action cannot be undone and will
                                  remove all bundle variations and components.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBundle(bundle.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bundle Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bundle Details</DialogTitle>
          </DialogHeader>
          {selectedBundle && (
            <BundleDetailsContent
              bundleId={selectedBundle}
              locations={locations}
              onClose={() => setShowDetailsDialog(false)}
              onUpdate={loadBundles}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Bundle Details Component for Dialog (unchanged from previous implementation)
function BundleDetailsContent ({
  bundleId,
  locations,
  onClose,
  onUpdate,
}: {
  bundleId: string;
  locations: Location[];
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [bundle, setBundle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBundleDetails();
  }, [bundleId]);

  const loadBundleDetails = async () => {
    try {
      setIsLoading(true);
      const result = await getBundleById(bundleId);

      if (result.success && result.bundle) {
        setBundle(result.bundle);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error loading bundle details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p>Bundle not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{bundle.name}</h2>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="variations">Variations</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Bundle Name</Label>
              <p className="text-sm text-gray-600">{bundle.name}</p>
            </div>
            <div>
              <Label>Image</Label>
              <p className="text-sm text-gray-600">
                {bundle.image ? (
                  <img
                    src={bundle.image}
                    alt={bundle.name}
                    className="h-16 w-16 object-cover rounded mt-1"
                  />
                ) : (
                  'No image'
                )}
              </p>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <p className="text-sm text-gray-600">
              {bundle.description || 'No description'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="components">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundle.bundleComponents?.map((component: any) => (
                <TableRow key={component.id}>
                  <TableCell>{component.componentVariation.name}</TableCell>
                  <TableCell>{component.componentVariation.sku}</TableCell>
                  <TableCell>
                    ${component.componentVariation.sellingPrice}
                  </TableCell>
                  <TableCell>{component.quantity}</TableCell>
                  <TableCell>
                    $
                    {(
                      component.componentVariation.sellingPrice
                      * component.quantity
                    ).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="variations">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variation</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundle.variations?.map((variation: any) => (
                <TableRow key={variation.id}>
                  <TableCell>{variation.name}</TableCell>
                  <TableCell>{variation.sku}</TableCell>
                  <TableCell>${variation.sellingPrice}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
