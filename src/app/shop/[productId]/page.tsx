import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductVariationSelector from "@/components/products/ProductVariationSelector";
import { buildApiUrl, handleApiResponse } from "@/lib/config/api";
import { formatSlug } from "@/components/products/utils/formatSlug";
import { getInventoryItem, getInventoryItems } from "@/lib/services/inventory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const item = await getInventoryItem(productId);

  if (!item) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const variations = item.variations.filter(
    (v) => v.visible && v.stockLevels.some((sl) => sl.stock > 0)
  );

  const product = {
    id: item.id,
    name: item.name,
    description: item.description || undefined,
    image: item.image,
    variations: variations.map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      image: v.image,
      sellingPrice: v.sellingPrice,
      shipping: v.shipping || undefined,
      tax: v.tax || undefined,
    })),
  };
  
  const defaultVariation = product.variations[0];
  const price = defaultVariation?.sellingPrice || 0;
  const sku = defaultVariation?.sku || "";

  return {
    title: `${product.name} - High-Quality Device Parts & Accessories`,
    description: `${
      product.description || `Buy ${product.name}`
    } High-quality replacement part with warranty. SKU: ${sku}.`,
    keywords: `${
      product.name
    }, device parts, replacement parts, ${item.categories
      ?.map((c) => c.name)
      .join(", ")}, repair parts, genuine parts`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const item = await getInventoryItem(productId);

  if (!item) {
    notFound();
  }

  const variations = item.variations.filter(
    (v) => v.visible && v.stockLevels.some((sl) => sl.stock > 0)
  );

  const product = {
    id: item.id,
    name: item.name,
    description: item.description || undefined,
    image: item.image,
    variations: variations.map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      image: v.image,
      sellingPrice: v.sellingPrice,
      shipping: v.shipping || undefined,
      tax: v.tax || undefined,
    })),
  };

  // Get related products
  const relatedProducts = await getInventoryItems();
  const filteredRelatedProducts = relatedProducts
    .filter((p) => p.id !== productId)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductVariationSelector
          product={product}
        />
      </div>
    </div>
  );
}
