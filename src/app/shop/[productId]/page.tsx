import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import ProductCarousel from '@/components/products/ProductCarousel';
import type { Metadata } from 'next';
import type { InventoryItem } from '@/types/api';
import ProductVariationSelector from '@/components/products/ProductVariationSelector';
import { buildApiUrl, handleApiResponse } from '@/lib/config/api';
import { formatSlug } from '@/components/products/utils/formatSlug';
import { getInventoryItem, getInventoryItems } from '@/components/dashboard/inventory/items/services/itemsCrud';

export async function generateMetadata ({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const item = await getInventoryItem(productId);

  const variations = item.variations.filter((v) => v.visible && v.stockLevels.some((sl) => sl.stock > 0));

  const product: InventoryItem = {
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    warrantyType: item.warrantyType
      ? {
        ...item.warrantyType,
        createdAt: item.warrantyType.createdAt.toISOString(),
      }
      : null,
    tags: item.tags.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    categories: item.categories.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      children: [],
      items: [],
    })),
    supplier: item.supplier
      ? {
        ...item.supplier,
        createdAt: item.supplier.createdAt.toISOString(),
        updatedAt: item.supplier.updatedAt.toISOString(),
      }
      : null,
    variations: variations.map((v) => ({
      ...v,
      lastPurchaseDate: v.lastPurchaseDate
        ? v.lastPurchaseDate.toISOString()
        : null,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      stockLevels: v.stockLevels.map((sl) => ({
        ...sl,
        createdAt: sl.createdAt.toISOString(),
        updatedAt: sl.updatedAt.toISOString(),
        location: {
          ...sl.location,
          createdAt: sl.location.createdAt.toISOString(),
          updatedAt: sl.location.updatedAt.toISOString(),
        },
      })),
    })),
  };
  const defaultVariation = product.variations[0];
  const price = defaultVariation?.sellingPrice || 0;
  const sku = defaultVariation?.sku || '';

  return {
    title: `${product.name} - High-Quality Device Parts & Accessories`,
    description: `${
      product.description || `Buy ${product.name}`
    } High-quality replacement part with warranty. SKU: ${sku}.`,
    keywords: `${
      product.name
    }, device parts, replacement parts, ${product.categories
      ?.map((c) => c.name)
      .join(', ')}, repair parts, genuine parts`,
  };
}

export default async function ProductPage ({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const item = await getInventoryItem(productId);

  const variations = item.variations.filter((v) => v.visible && v.stockLevels.some((sl) => sl.stock > 0));

  const product: InventoryItem = {
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    warrantyType: item.warrantyType
      ? {
        ...item.warrantyType,
        createdAt: item.warrantyType.createdAt.toISOString(),
      }
      : null,
    tags: item.tags.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    categories: item.categories.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      children: [],
      items: [],
    })),
    supplier: item.supplier
      ? {
        ...item.supplier,
        createdAt: item.supplier.createdAt.toISOString(),
        updatedAt: item.supplier.updatedAt.toISOString(),
      }
      : null,
    variations: variations.map((v) => ({
      ...v,
      lastPurchaseDate: v.lastPurchaseDate
        ? v.lastPurchaseDate.toISOString()
        : null,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      stockLevels: v.stockLevels.map((sl) => ({
        ...sl,
        createdAt: sl.createdAt.toISOString(),
        updatedAt: sl.updatedAt.toISOString(),
        location: {
          ...sl.location,
          createdAt: sl.location.createdAt.toISOString(),
          updatedAt: sl.location.updatedAt.toISOString(),
        },
      })),
    })),
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Product Not Found</h1>
            <p className="mt-2 text-gray-600">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/shop">
              <button className="mt-6 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
                Back to Products
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get related products based on categories
  const relatedProducts = await getInventoryItems();
  // const relatedResponse = await fetch(
  //   buildApiUrl(
  //     `/api/inventory/items?category=${product.categories[0]?.id}&limit=5&exclude=${product.id}`
  //   )
  // );
  // const relatedProducts: InventoryItem[] = relatedResponse.ok
  //   ? await handleApiResponse(relatedResponse)
  //   : [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Product with Variation Selector (Client Component) */}
        <ProductVariationSelector
          product={{
            id: product.id,
            name: product.name,
            description: product.description || undefined,
            image: product.image,
            variations: product.variations
              .filter((v) => v.visible)
              .map((variation) => ({
                ...variation,
                shipping: variation.shipping || undefined,
                tax: variation.tax || undefined,
              })),
          }}
        />

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <ProductCarousel
              products={relatedProducts.map((product) => ({
                id: product.id,
                name: product.name,
                description: product.description || undefined,
                image: product.image,
                variations: product.variations.filter((v) => v.visible),
              }))}
              title=""
            />
          </section>
        )}
      </div>
    </div>
  );
}
