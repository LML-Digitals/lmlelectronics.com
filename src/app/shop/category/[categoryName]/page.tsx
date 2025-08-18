import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import { formatSlug, decodeSlug } from '@/components/products/utils/formatSlug';
import { truncate } from '@/components/products/utils/text';
import { ChevronRight } from 'lucide-react';
import type { InventoryItemCategory, InventoryVariation } from '@/types/api';
import ProductCard from '@/components/products/ProductCard';
import { buildApiUrl, handleApiResponse } from '@/lib/config/api';
import PageHero from '@/components/PageHero';
import { getInventoryCategoryBySlug } from '@/components/dashboard/inventory/categories/services/itemCategoryCrud';

// Generate dynamic metadata
export async function generateMetadata ({
  params,
}: {
  params: Promise<{ categoryName: string }>;
}): Promise<Metadata> {
  const { categoryName } = await params;
  const decodedName = decodeSlug(categoryName);

  return {
    title: `${decodedName} - High-Quality Parts & Accessories`,
    description: `Shop our collection of high-quality ${decodedName} parts and accessories. Find genuine replacement parts, components, and accessories with warranty and expert support.`,
    keywords: `${decodedName} parts, ${decodedName} accessories, ${decodedName} components, replacement parts, genuine parts, device repair parts, high-quality components, repair accessories`,
  };
}

async function fetchCategoryWithItems (categoryName: string) {
  try {
    const category = await getInventoryCategoryBySlug(categoryName);

    return { category, error: null };
  } catch (err) {
    console.error('Error fetching category:', err);

    return {
      category: null,
      error: 'Category not found or not available.',
    };
  }
}

async function fetchCategoryBreadcrumbs (categoryName: string) {
  try {
    const response = await fetch(`/api/inventory/categories/${categoryName}/breadcrumbs`);

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (err) {
    console.error('Error fetching breadcrumbs:', err);

    return [];
  }
}

export default async function ProductCategoryPage ({
  params,
}: {
  params: Promise<{ categoryName: string }>;
}) {
  const { categoryName } = await params;
  const { category, error } = await fetchCategoryWithItems(categoryName);

  if (error || !category) {
    return (
      <>
        <PageHero
          title="All Shop Items"
          subtitle="Find the perfect components and repair kits for your needs. High-quality parts for every fix."
          backgroundImage="/images/lml_box.webp"
          breadcrumbs={[{ name: 'Shop', href: '/shop' }]}
        />
        <div className="max-w-7xl mx-auto">
          <div className="container mx-auto px-4 py-8">
            <p className="text-red-500 text-center">
              {error || 'Category not found'}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={category.name}
        subtitle={`Browse our extensive selection of ${category.name} products.`}
        backgroundImage={category.image || '/images/lml_box.webp'}
        breadcrumbs={[
          { name: 'Shop', href: '/shop' },
          {
            name: category.name,
            href: `/shop/category/${formatSlug(category.name)}`,
          },
        ]}
      />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white mb-12">
          <div className="container mx-auto px-4 py-4 space-y-8">
            {/* Subcategories */}
            {category.children && category.children.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Subcategories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/shop/category/${formatSlug(child.name)}`}
                    >
                      <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="aspect-square relative overflow-hidden">
                          <Image
                            src={
                              child.image || '/images/product-placeholder.jpg'
                            }
                            alt={child.name}
                            width={300}
                            height={300}
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 truncate">
                            {child.name}
                          </h3>
                          {child.visible && (
                            <p className="text-sm text-gray-500 mt-1">
                              View Products
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {category.items.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={{
                      id: item.id,
                      name: item.name,
                      description: item.description || undefined,
                      image: item.image,
                      variations: item.variations.filter((v) => v.visible) as InventoryVariation[],
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
