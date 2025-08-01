import { Suspense } from "react";
import prisma from "@/lib/prisma";
import BundleManagement from "@/components/dashboard/inventory/bundles/BundleManagement";

async function getBundlePageData() {
  try {
    const [locations, categories, suppliers, variations] = await Promise.all([
      prisma.storeLocation.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.inventoryItemCategory.findMany({
        where: { visible: true },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.vendor.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.inventoryVariation.findMany({
        where: {
          visible: true,
          inventoryItem: {
            isBundle: false, // Only non-bundle items can be components
          },
        },
        select: {
          id: true,
          name: true,
          sku: true,
          sellingPrice: true,
          image: true,
          inventoryItem: {
            select: {
              name: true,
              description: true,
            },
          },
          stockLevels: {
            select: {
              stock: true,
              location: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
        take: 100, // Limit for performance
      }),
    ]);

    return {
      locations,
      categories,
      suppliers,
      variations,
    };
  } catch (error) {
    console.error("Error fetching bundle page data:", error);
    return {
      locations: [],
      categories: [],
      suppliers: [],
      variations: [],
    };
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 border rounded"
              >
                <div className="h-12 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function BundlesPage() {
  const data = await getBundlePageData();

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <BundleManagement
          locations={data.locations}
          categories={data.categories}
          suppliers={data.suppliers}
          variations={data.variations}
        />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: "Bundle Management",
  description: "Create and manage product bundles for your repair shop",
};
