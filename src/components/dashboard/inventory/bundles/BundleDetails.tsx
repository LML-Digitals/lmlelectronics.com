"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Search,
  Package,
  Eye,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import {
  getBundleById,
  updateBundle,
  addBundleComponents,
  removeBundleComponent,
  getBundleStock,
} from "@/components/dashboard/inventory/bundles/services/bundles";
import { toast } from "@/components/ui/use-toast";

interface BundleComponent {
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
      image: string | null;
      id: string;
      isBundle: boolean;
      warrantyTypeId: string | null;
      createdAt: Date;
      updatedAt: Date;
      supplierId: number | null;
    } | null;
    stockLevels: Array<{
      stock: number;
      location: {
        id: number;
        name: string;
      };
    }>;
  };
}

interface BundleDetails {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isBundle: boolean;
  variations: Array<{
    id: string;
    name: string;
    sku: string;
    sellingPrice: number;
    bundlePrice?: number;
  }>;
  bundleComponents: BundleComponent[];
  stockByLocation?: Array<{
    locationId: number;
    locationName: string;
    availableStock: number;
  }>;
}

interface InventoryVariation {
  id: string;
  sku: string;
  name: string;
  sellingPrice: number;
  image?: string;
  stockLevels: Array<{
    stock: number;
    location: {
      id: number;
      name: string;
    };
  }>;
}

interface BundleDetailsProps {
  bundleId: string;
  locations: Array<{
    id: number;
    name: string;
  }>;
}

export default function BundleDetails({
  bundleId,
  locations,
}: BundleDetailsProps) {
  const router = useRouter();
  const [bundle, setBundle] = useState<BundleDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryVariation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number>(
    locations[0]?.id || 0
  );

  useEffect(() => {
    loadBundle();
  }, [bundleId]);

  const loadBundle = async () => {
    try {
      setIsLoading(true);
      const result = await getBundleById(bundleId);
      if (result.success && result.bundle) {
        setBundle(result.bundle);
        setEditForm({
          name: result.bundle.name,
          description: result.bundle.description || "",
          image: result.bundle.image || "",
        });

        // Load stock information
        const stockResult = await getBundleStock(bundleId, selectedLocation);
        if (stockResult.success && stockResult.availableStock !== undefined) {
          setBundle((prev) =>
            prev
              ? {
                  ...prev,
                  stockByLocation: [
                    {
                      locationId: selectedLocation,
                      locationName:
                        locations.find((l) => l.id === selectedLocation)
                          ?.name || "",
                      availableStock: stockResult.availableStock || 0,
                    },
                  ],
                }
              : null
          );
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load bundle details",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error loading bundle",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const result = await updateBundle(bundleId, editForm);
      if (result.success) {
        toast({
          title: "Success",
          description: "Bundle updated successfully",
        });
        setIsEditing(false);
        await loadBundle();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update bundle",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error updating bundle",
      });
    }
  };

  const handleRemoveComponent = async (componentId: string) => {
    try {
      const result = await removeBundleComponent(componentId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Component removed successfully",
        });
        await loadBundle();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove component",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error removing component",
      });
    }
  };

  const handleAddComponent = async (variationId: string, quantity: number) => {
    try {
      const result = await addBundleComponents({
        bundleItemId: bundleId,
        components: [{ componentVariationId: variationId, quantity }],
      });
      if (result.success) {
        toast({
          title: "Success",
          description: "Component added successfully",
        });
        setShowAddComponent(false);
        setSearchQuery("");
        setSearchResults([]);
        await loadBundle();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add component",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error adding component",
      });
    }
  };

  const searchComponents = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // This would need to be implemented in the bundle actions
      // For now, we'll create a simple search
      const response = await fetch(
        `/api/inventory/search?q=${encodeURIComponent(
          query
        )}&exclude_bundles=true`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const currentLocationStock =
    bundle?.stockByLocation?.find(
      (stock) => stock.locationId === selectedLocation
    )?.availableStock || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Bundle not found</h3>
        <p className="text-gray-600">
          The bundle you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{bundle.name}</h1>
          <p className="text-gray-600">Bundle Details and Components</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/inventory/bundles")}
          >
            <X className="h-4 w-4 mr-2" />
            Back to Bundles
          </Button>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Bundle
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="variations">Variations</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Bundle Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-600">{bundle.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  {isEditing ? (
                    <Input
                      id="image"
                      value={editForm.image}
                      onChange={(e) =>
                        setEditForm({ ...editForm, image: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-600">
                      {bundle.image || "No image"}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-600">
                    {bundle.description || "No description"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bundle Components</CardTitle>
                <Dialog
                  open={showAddComponent}
                  onOpenChange={setShowAddComponent}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Component
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Component</DialogTitle>
                      <DialogDescription>
                        Search for inventory items to add to this bundle
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Search components..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            searchComponents(e.target.value);
                          }}
                        />
                        <Button onClick={() => searchComponents(searchQuery)}>
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {searchResults.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.sku} - ${item.sellingPrice}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddComponent(item.id, 1)}
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bundle.bundleComponents.map((component) => (
                    <TableRow key={component.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {component.componentVariation.image && (
                            <img
                              src={component.componentVariation.image}
                              alt={component.componentVariation.name}
                              className="h-8 w-8 object-cover rounded"
                            />
                          )}
                          <span>{component.componentVariation.name}</span>
                          {component.isHighlight && (
                            <Badge variant="secondary">Featured</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{component.componentVariation.sku}</TableCell>
                      <TableCell>
                        ${component.componentVariation.sellingPrice}
                      </TableCell>
                      <TableCell>{component.quantity}</TableCell>
                      <TableCell>
                        $
                        {(
                          component.componentVariation.sellingPrice *
                          component.quantity
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveComponent(component.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Levels by Location</CardTitle>
              <div className="flex items-center space-x-2">
                <Label htmlFor="location">Location:</Label>
                <Select
                  value={selectedLocation.toString()}
                  onValueChange={(value) =>
                    setSelectedLocation(parseInt(value))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem
                        key={location.id}
                        value={location.id.toString()}
                      >
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-2">Available Bundle Stock</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentLocationStock}
                  </p>
                  <p className="text-sm text-gray-600">
                    Based on component availability at selected location
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Component Stock Breakdown</h4>
                  {bundle.bundleComponents.map((component) => {
                    const componentStock =
                      component.componentVariation.stockLevels.find(
                        (level) => level.location.id === selectedLocation
                      )?.stock || 0;
                    const possibleBundles = Math.floor(
                      componentStock / component.quantity
                    );

                    return (
                      <div
                        key={component.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {component.componentVariation.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Need {component.quantity} each, Have{" "}
                            {componentStock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {possibleBundles} bundles
                          </p>
                          <Badge
                            variant={
                              possibleBundles === 0
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {possibleBundles === 0
                              ? "Out of Stock"
                              : "In Stock"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variation</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Component Price</TableHead>
                    <TableHead>Bundle Price</TableHead>
                    <TableHead>Savings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bundle.variations.map((variation) => {
                    const componentTotal = bundle.bundleComponents.reduce(
                      (total, component) =>
                        total +
                        component.componentVariation.sellingPrice *
                          component.quantity,
                      0
                    );
                    const savings = componentTotal - variation.sellingPrice;

                    return (
                      <TableRow key={variation.id}>
                        <TableCell>{variation.name}</TableCell>
                        <TableCell>{variation.sku}</TableCell>
                        <TableCell>${componentTotal.toFixed(2)}</TableCell>
                        <TableCell>${variation.sellingPrice}</TableCell>
                        <TableCell className="text-green-600">
                          ${savings.toFixed(2)} (
                          {((savings / componentTotal) * 100).toFixed(1)}%)
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
