"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Package, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/useCartStore";
import { toast } from "sonner";
import { buildApiUrl, handleApiResponse } from "@/lib/config/api";
import { getBundles } from "@/lib/services/bundles";

interface BundleItem {
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

export default function BundleListing() {
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [filteredBundles, setFilteredBundles] = useState<BundleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
       const bundles = await getBundles()

       // Filter for bundles that have variations.
       const visibleBundles = bundles?.filter((bundle) =>
         bundle.variations.length > 0
       );
        const data = visibleBundles;

        if (data) {
          // Filter only bundles with stock and valid pricing
          const availableBundles =
            data?.filter((bundle) => {
              const hasStock =
                typeof bundle.calculatedStock === "number"
                  ? bundle.calculatedStock > 0
                  : Array.isArray(bundle.calculatedStock)
                  ? bundle.calculatedStock.some(
                      (stock: any) => stock.availableStock > 0
                    )
                  : false;

              const hasPrice =
                bundle.variations.length > 0 &&
                bundle.variations[0].sellingPrice > 0;

              return hasStock && hasPrice;
            }) || [];

          setBundles(availableBundles);
          setFilteredBundles(availableBundles);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching bundles:", err);
        setError("Failed to load bundles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  // Filter bundles based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBundles(bundles);
    } else {
      const filtered = bundles.filter(
        (bundle) =>
          bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bundle.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          bundle.variations.some((v) =>
            v.sku.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setFilteredBundles(filtered);
    }
  }, [searchTerm, bundles]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const calculateSavings = (bundle: BundleItem) => {
    const bundlePrice = bundle.variations[0]?.sellingPrice || 0;
    const componentTotal = bundle.bundleComponents.reduce(
      (sum, comp) => sum + comp.componentVariation.sellingPrice * comp.quantity,
      0
    );
    const savings = componentTotal - bundlePrice;
    const savingsPercent =
      componentTotal > 0 ? (savings / componentTotal) * 100 : 0;

    return { savings, savingsPercent, componentTotal };
  };

  const getStockInfo = (bundle: BundleItem) => {
    if (typeof bundle.calculatedStock === "number") {
      return bundle.calculatedStock;
    }
    if (Array.isArray(bundle.calculatedStock)) {
      return bundle.calculatedStock.reduce(
        (total: number, stock: any) => total + stock.availableStock,
        0
      );
    }
    return 0;
  };

  const handleAddToCart = (e: React.MouseEvent, bundle: BundleItem) => {
    e.preventDefault();
    e.stopPropagation();

    const mainVariation = bundle.variations[0];
    const stock = getStockInfo(bundle);

    if (stock === 0) {
      toast.error(`${bundle.name} is currently out of stock.`);
      return;
    }

    addItem({
      id: mainVariation.id,
      name: bundle.name,
      type: "bundle",
      description:
        bundle.description ||
        `Bundle with ${bundle.bundleComponents.length} components`,
      price: mainVariation.sellingPrice,
      profit: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      image: bundle.image || "",
    });

    toast.success(`${bundle.name} has been added to your cart.`);
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Loading bundles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Available Bundles</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Browse our selection of carefully curated repair bundles and kits
            designed to give you everything you need for successful device
            repairs.
          </p>

          {/* Search Filter */}
          <div className="max-w-md mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search bundles..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {filteredBundles.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No bundles found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Check back soon for new bundle offerings."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBundles.map((bundle, index) => {
              const mainVariation = bundle.variations[0];
              const { savings, savingsPercent, componentTotal } =
                calculateSavings(bundle);
              const stock = getStockInfo(bundle);

              return (
                <Link
                  key={bundle.id}
                  href={`/bundles/${bundle.id}`}
                  className="block"
                >
                  <motion.div
                    className="bg-gray-100 p-4 rounded-3xl"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative aspect-square mb-3 overflow-hidden rounded-md">
                      {bundle.image ? (
                        <Image
                          src={bundle.image}
                          alt={bundle.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-200">
                          <Package className="h-16 w-16 text-gray-400" />
                        </div>
                      )}

                      {/* Savings Badge */}
                      {savingsPercent > 0 && (
                        <div className="absolute top-2 left-2 bg-secondary text-white px-2 py-1 rounded-md font-medium text-sm">
                          {savingsPercent.toFixed(0)}% OFF
                        </div>
                      )}
                    </div>

                    <h3 className="text-gray-800 font-medium text-center line-clamp-1">
                      {bundle.name}
                    </h3>

                    <p className="text-gray-600 text-sm text-center line-clamp-1 mt-1">
                      {bundle.bundleComponents.length} components included
                    </p>

                    <div className="mt-2 flex items-center justify-center">
                      <span className="text-lg font-bold text-secondary">
                        ${mainVariation?.sellingPrice.toFixed(2)}
                      </span>

                      {savings > 0 && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ${componentTotal.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="default"
                      className="mt-3 w-full bg-secondary text-white hover:bg-secondary/80 transition-colors"
                      disabled={stock === 0}
                      onClick={(e) => handleAddToCart(e, bundle)}
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      {stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {filteredBundles.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for?
            </p>
            <Button variant="outline" asChild>
              <Link href="/contact">Request Custom Bundle</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
