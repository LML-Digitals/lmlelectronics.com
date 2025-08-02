"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { buildApiUrl, handleApiResponse } from "@/lib/config/api";
import { Card } from "@/components/ui/card";
import { getBundles } from "../dashboard/inventory/bundles/services/bundles";

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

export default function BundleGrid() {
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        const bundles = await getBundles();

        // Filter for bundles that are visible and have stock.
        const visibleBundles = bundles.bundles?.filter((bundle) =>
          bundle.variations.some((v) => v.visible)
        );
        const data = visibleBundles;

        if (data) {
          // Filter only bundles with stock and valid pricing, and take first 4
          const availableBundles =
            data
              ?.filter((bundle) => {
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
              })
              .slice(0, 4) || [];

          setBundles(availableBundles);
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

  const calculateSavings = (bundle: BundleItem) => {
    const bundlePrice = bundle.variations[0]?.sellingPrice || 0;
    const componentTotal = bundle.bundleComponents.reduce(
      (sum, comp) => sum + comp.componentVariation.sellingPrice * comp.quantity,
      0
    );
    const savings = componentTotal - bundlePrice;
    const savingsPercent =
      componentTotal > 0 ? (savings / componentTotal) * 100 : 0;

    return { savings, savingsPercent };
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (bundles.length === 0) {
    return (
      <div className="py-8 text-center">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No Bundles</h3>
        <p className="mt-1 text-sm text-gray-500">
          No bundles are currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {bundles.map((bundle) => {
          const { savings, savingsPercent } = calculateSavings(bundle);
          const price = bundle.variations[0]?.sellingPrice || 0;

          return (
            <Link
              key={bundle.id}
              href={`/bundles/${bundle.id}`}
              className="group"
            >
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={bundle.image || "/placeholder-product.svg"}
                    alt={bundle.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {savingsPercent > 0 && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-sm font-bold px-2 py-1 rounded">
                      Save {Math.round(savingsPercent)}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2">
                    {bundle.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {bundle.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">${price.toFixed(2)}</p>
                    {savings > 0 && (
                      <p className="text-sm text-green-600">
                        Save ${savings.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
