import { Suspense } from "react";
import {
  getProducts,
  getCategories,
  searchProducts,
} from "@/lib/square/products";
import { Product, formatPrice } from "@/types/product";
import { SquareCategory } from "@/types/square";
import Link from "next/link";
import Image from "next/image";
import { Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/SafeImage";

interface ProductsPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

// Filter Sidebar Component
async function FilterSidebar({
  searchParams,
}: {
  searchParams?: ProductsPageProps["searchParams"];
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  try {
    // Fetch real data from Square
    const [categoriesData, searchResult] = await Promise.all([
      getCategories(),
      searchProducts(), // Get all products to calculate counts
    ]);

    const allProducts = searchResult.products;
    const totalCount = allProducts.length;

    // Create category list with counts
    const categories = [
      { name: "All Items", count: totalCount, id: "all" },
      ...categoriesData
        .map((category) => {
          const productCount = allProducts.filter(
            (product) => product.category?.id === category.id
          ).length;

          return {
            name: category.categoryData.name,
            count: productCount,
            id: category.id,
          };
        })
        .filter((category) => category.count > 0), // Only show categories with products
    ];

    // Calculate price ranges based on actual product prices
    const prices = allProducts.map((p) => p.price).sort((a, b) => a - b);
    const maxPrice = prices[prices.length - 1] || 0;

    const priceRanges: {
      count: number;
      label: string;
      min: number;
      max: number;
    }[] = [];
    if (maxPrice > 0) {
      const ranges = [
        { label: "Under $25", min: 0, max: 25 },
        { label: "$25 - $50", min: 25, max: 50 },
        { label: "$50 - $100", min: 50, max: 100 },
        { label: "$100 - $200", min: 100, max: 200 },
        { label: "Over $200", min: 200, max: Infinity },
      ];

      ranges.forEach((range) => {
        const count = allProducts.filter(
          (p) =>
            p.price >= range.min &&
            (range.max === Infinity ? true : p.price < range.max)
        ).length;

        if (count > 0) {
          priceRanges.push({ ...range, count });
        }
      });
    }

    // Calculate availability counts
    const inStockCount = allProducts.filter((p) => p.inStock).length;
    const outOfStockCount = allProducts.filter((p) => !p.inStock).length;

    const availability = [
      { label: "In Stock", count: inStockCount },
      { label: "Out of Stock", count: outOfStockCount },
    ].filter((item) => item.count > 0);

    // Calculate deal counts
    const onSaleCount = allProducts.filter(
      (p) => p.compareAtPrice && p.compareAtPrice > p.price
    ).length;

    const freeShippingCount = allProducts.filter((p) => p.price >= 50).length; // Assuming free shipping over $50

    const newArrivalsCount = allProducts.filter((p) => {
      if (!p.createdAt) return false;
      const createdDate = new Date(p.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length;

    const deals = [
      { label: "On Sale", count: onSaleCount },
      { label: "Free Shipping", count: freeShippingCount },
      { label: "New Arrivals", count: newArrivalsCount },
    ].filter((deal) => deal.count > 0);

    return (
      <div className="w-full space-y-8">
        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Browse by category
          </h3>
          <div className="space-y-2">
            {categories.map((category) => {
              const isActive =
                (category.id === "all" && !resolvedSearchParams?.category) ||
                resolvedSearchParams?.category === category.id;

              return (
                <Link
                  key={category.id}
                  href={
                    category.id === "all"
                      ? "/products"
                      : `/products?category=${category.id}`
                  }
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors block ${
                    isActive
                      ? "text-black font-medium shadow-sm"
                      : "text-gray-700"
                  }`}
                  style={{
                    backgroundColor: isActive ? "#FDF200" : "transparent",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">
                      ({category.count})
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            Price range ($)
            <Filter className="w-4 h-4 ml-2" />
          </h3>
          <div className="space-y-3">
            {priceRanges.map((range) => (
              <label key={range.label} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-400"
                  style={{ accentColor: "#FDF200" }}
                />
                <span className="ml-3 text-sm text-gray-700">
                  {range.label}
                </span>
                <span className="ml-auto text-sm text-gray-500">
                  ({range.count})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            Availability
            <Filter className="w-4 h-4 ml-2" />
          </h3>
          <div className="space-y-3">
            {availability.map((item) => (
              <label key={item.label} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-400"
                  style={{ accentColor: "#FDF200" }}
                />
                <span className="ml-3 text-sm text-gray-700">{item.label}</span>
                <span className="ml-auto text-sm text-gray-500">
                  ({item.count})
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading filter data:", error);

    // Fallback UI if data loading fails
    return (
      <div className="w-full space-y-8">
        <div className="text-center py-8">
          <p className="text-gray-600">Unable to load filters</p>
          <p className="text-sm text-gray-500">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images[0];
  // console.log(product);
  // console.log(primaryImage);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200"
    >
      <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
        <SafeImage
          src={primaryImage?.url}
          alt={primaryImage?.altText || product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium bg-red-600 px-3 py-1 rounded-full text-sm">
              Out of Stock
            </span>
          </div>
        )}

        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              SALE
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-yellow-600 transition-colors line-clamp-2 mb-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {product.description.substring(0, 100)}...
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.compareAtPrice, product.currency)}
                </span>
              )}
          </div>

          {product.inStock ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              In Stock
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Out of Stock
            </span>
          )}
        </div>

        {product.category && (
          <div>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
              {product.category.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// Loading skeleton
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="aspect-square bg-gray-200 rounded-t-lg animate-pulse" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
        <div className="flex justify-between items-center mb-3">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
        </div>
        <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
      </div>
    </div>
  );
}

// Products Grid Component
async function ProductsGrid({
  searchParams,
}: {
  searchParams?: ProductsPageProps["searchParams"];
}) {
  try {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    // Build search filters from URL parameters
    const filters: any = {};

    if (resolvedSearchParams?.query) {
      filters.query = resolvedSearchParams.query;
    }

    if (
      resolvedSearchParams?.category &&
      resolvedSearchParams.category !== "all"
    ) {
      filters.categoryIds = [resolvedSearchParams.category];
    }

    if (resolvedSearchParams?.minPrice) {
      filters.priceMin = parseFloat(resolvedSearchParams.minPrice);
    }

    if (resolvedSearchParams?.maxPrice) {
      filters.priceMax = parseFloat(resolvedSearchParams.maxPrice);
    }

    if (resolvedSearchParams?.sort) {
      const [sortBy, sortOrder] = resolvedSearchParams.sort.split(":");
      filters.sortBy = sortBy;
      filters.sortOrder = sortOrder || "asc";
    }

    // Use searchProducts with filters
    const searchResult = await searchProducts(filters);
    const products = searchResult.products;

    if (!products.length) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600">Check back later for new products.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error loading products:", error);

    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 text-red-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error loading products
        </h3>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }
}

// Loading fallback for ProductsGrid
function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Results Header Component
async function ResultsHeader({
  searchParams,
}: {
  searchParams?: ProductsPageProps["searchParams"];
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  try {
    // Build same filters as ProductsGrid to get accurate count
    const filters: any = {};

    if (resolvedSearchParams?.query) {
      filters.query = resolvedSearchParams.query;
    }

    if (
      resolvedSearchParams?.category &&
      resolvedSearchParams.category !== "all"
    ) {
      filters.categoryIds = [resolvedSearchParams.category];
    }

    if (resolvedSearchParams?.minPrice) {
      filters.priceMin = parseFloat(resolvedSearchParams.minPrice);
    }

    if (resolvedSearchParams?.maxPrice) {
      filters.priceMax = parseFloat(resolvedSearchParams.maxPrice);
    }

    if (resolvedSearchParams?.sort) {
      const [sortBy, sortOrder] = resolvedSearchParams.sort.split(":");
      filters.sortBy = sortBy;
      filters.sortOrder = sortOrder || "asc";
    }

    const searchResult = await searchProducts(filters);
    const totalCount = searchResult.products.length;

    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="text-lg font-medium text-gray-900">
            {totalCount} result{totalCount !== 1 ? "s" : ""}
            {resolvedSearchParams?.query && (
              <span className="text-gray-600">
                {" "}
                for "{resolvedSearchParams.query}"
              </span>
            )}
            {resolvedSearchParams?.category &&
              resolvedSearchParams.category !== "all" && (
                <span className="text-gray-600"> in selected category</span>
              )}
          </span>
          {((resolvedSearchParams?.category &&
            resolvedSearchParams.category !== "all") ||
            resolvedSearchParams?.query) && (
            <Link
              href="/products"
              className="ml-4 text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Clear filters
            </Link>
          )}
        </div>

        {/* Sort and View Options */}
        <div className="flex items-center space-x-4">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
            <option>Alphabetical (A-Z)</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
            <option>Best Selling</option>
          </select>

          <div className="flex items-center border border-gray-300 rounded-lg">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
              <Grid className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l border-gray-300">
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading product count:", error);
    return (
      <div className="flex items-center justify-between mb-6">
        <span className="text-lg font-medium text-gray-900">Products</span>
      </div>
    );
  }
}

// Main Products Page
export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Find Your Fix.
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Explore our complete range of simple, affordable DIY electronic
              repair kits. Everything you need to get your devices working like
              new, right here.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <Suspense fallback={<ProductsGridSkeleton />}>
                <FilterSidebar
                  searchParams={Promise.resolve(resolvedSearchParams)}
                />
              </Suspense>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <Suspense
              fallback={
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-medium text-gray-900">
                    Loading...
                  </span>
                </div>
              }
            >
              <ResultsHeader
                searchParams={Promise.resolve(resolvedSearchParams)}
              />
            </Suspense>

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Products Grid */}
            <Suspense fallback={<ProductsGridSkeleton />}>
              <ProductsGrid
                searchParams={Promise.resolve(resolvedSearchParams)}
              />
            </Suspense>

            {/* Load More */}
            <LoadMoreButton
              searchParams={Promise.resolve(resolvedSearchParams)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Load More Button Component
function LoadMoreButton({
  searchParams,
}: {
  searchParams?: ProductsPageProps["searchParams"];
}) {
  return (
    <div className="mt-12 text-center">
      <Button variant="outline" size="lg">
        Load More Products
      </Button>
    </div>
  );
}

// Metadata for SEO
export const metadata = {
  title: "Products",
  description:
    "Browse our complete catalog of electronics, repair kits, components, and accessories. Find the perfect parts for your next project.",
  keywords:
    "electronics, repair kits, components, parts, accessories, technology, DIY repair",
};
