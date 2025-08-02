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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  Edit,
  Eye,
  Plus,
  Filter,
  Package2,
  AlertCircle,
} from "lucide-react";
import { getBundles } from "@/components/dashboard/inventory/bundles/services/bundles";
import { toast } from "@/components/ui/use-toast";

interface BundleStock {
  locationId: number;
  locationName: string;
  availableStock: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  categories: Array<{
    id: string;
    name: string;
    description: string;
    image: string;
    visible: boolean;
    parentId: string | null;
  }>;
  supplier: { id: number; name: string } | null;
  supplierId: number | null;
  variations: Array<{
    id: string;
    sku: string;
    name: string;
    sellingPrice: number;
    image: string | null;
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
      inventoryItem: {
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        isBundle: boolean;
        warrantyTypeId: string | null;
        createdAt: Date;
        updatedAt: Date;
        supplierId: number | null;
      } | null;
      stockLevels: any[];
    };
  }>;
  calculatedStock: number | BundleStock[] | undefined;
}

interface BundleListProps {
  locations: Array<{ id: number; name: string }>;
}

export default function BundleList({ locations }: BundleListProps) {
  const router = useRouter();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<number | "all">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    loadBundles();
  }, [selectedLocation]);

  const loadBundles = async () => {
    setIsLoading(true);
    try {
      const locationId =
        selectedLocation === "all" ? undefined : selectedLocation;
      const result = await getBundles(locationId);

      if (result.success) {
        setBundles(result.bundles || []);
      } else {
        toast({
          title: "Error",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bundles",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBundles = bundles.filter((bundle) => {
    const matchesSearch =
      bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.variations.some((v) =>
        v.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "all" ||
      bundle.categories.some((cat) => cat.id === categoryFilter);

    return matchesSearch && matchesCategory;
  });

  const allCategories = Array.from(
    new Set(bundles.flatMap((bundle) => bundle.categories.map((cat) => cat.id)))
  )
    .map((id) => {
      const category = bundles
        .find((b) => b.categories.some((c) => c.id === id))
        ?.categories.find((c) => c.id === id);
      return category ? { id, name: category.name } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string }>;

  const getTotalStock = (bundle: Bundle) => {
    if (selectedLocation === "all") {
      if (Array.isArray(bundle.calculatedStock)) {
        return bundle.calculatedStock.reduce(
          (sum, stock) => sum + stock.availableStock,
          0
        );
      }
      return 0;
    } else {
      return typeof bundle.calculatedStock === "number"
        ? bundle.calculatedStock
        : 0;
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { variant: "destructive" as const, text: "Out of Stock" };
    if (stock < 5) return { variant: "secondary" as const, text: "Low Stock" };
    return { variant: "default" as const, text: "In Stock" };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bundle Products</h2>
          <p className="text-gray-600">
            Manage your product bundles and repair kits
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/inventory/bundles/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bundle
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search bundles by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={selectedLocation.toString()}
                onValueChange={(value) =>
                  setSelectedLocation(value === "all" ? "all" : parseInt(value))
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
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

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Grid */}
      {filteredBundles.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No bundles found</h3>
              <p className="text-gray-500 mb-4">
                {bundles.length === 0
                  ? "You haven't created any bundles yet."
                  : "No bundles match your current filters."}
              </p>
              {bundles.length === 0 && (
                <Button
                  onClick={() =>
                    router.push("/dashboard/inventory/bundles/new")
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Bundle
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBundles.map((bundle) => {
            const totalStock = getTotalStock(bundle);
            const stockStatus = getStockStatus(totalStock);

            return (
              <Card key={bundle.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {bundle.image ? (
                    <img
                      src={bundle.image}
                      alt={bundle.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.text}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{bundle.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {bundle.description || "No description"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Variations */}
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Variations ({bundle.variations.length})
                    </p>
                    <div className="space-y-1">
                      {bundle.variations.slice(0, 2).map((variation) => (
                        <div
                          key={variation.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {variation.name}
                          </span>
                          <span className="font-medium">
                            ${variation.sellingPrice}
                          </span>
                        </div>
                      ))}
                      {bundle.variations.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{bundle.variations.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Components */}
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Components ({bundle.bundleComponents.length})
                    </p>
                    <div className="space-y-1">
                      {bundle.bundleComponents.slice(0, 3).map((component) => (
                        <div
                          key={component.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600 flex items-center">
                            {component.isHighlight && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                            )}
                            {component.componentVariation.name}
                          </span>
                          <span className="text-gray-500">
                            x{component.quantity}
                          </span>
                        </div>
                      ))}
                      {bundle.bundleComponents.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{bundle.bundleComponents.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock Information */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Available Stock
                      </span>
                      <span className="text-lg font-semibold">
                        {totalStock}
                      </span>
                    </div>
                    {selectedLocation === "all" &&
                      Array.isArray(bundle.calculatedStock) &&
                      bundle.calculatedStock.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {(bundle.calculatedStock as BundleStock[])
                            .slice(0, 3)
                            .map((stock) => (
                              <div
                                key={stock.locationId}
                                className="flex justify-between text-xs text-gray-500"
                              >
                                <span>{stock.locationName}</span>
                                <span>{stock.availableStock}</span>
                              </div>
                            ))}
                        </div>
                      )}
                  </div>

                  {/* Categories */}
                  {bundle.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {bundle.categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(`/dashboard/inventory/bundles/${bundle.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(
                          `/dashboard/inventory/bundles/${bundle.id}/edit`
                        )
                      }
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
