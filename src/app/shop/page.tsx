import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import type { InventoryItemCategory } from '@/types/api';

import CategoryGrid from '@/components/products/CategoryGrid';
import ProductListing from '@/components/products/ProductListing';
import { buildApiUrl, handleApiResponse } from '@/lib/config/api';
import PageHero from '@/components/PageHero';
import ProductsClientPage from './ProductsClientPage';
import Script from 'next/script';
import { getInventoryCategories } from '@/components/dashboard/inventory/categories/services/itemCategoryCrud';

export async function generateMetadata (): Promise<Metadata> {
  const baseUrl = 'https://lmlelectronics.com';

  return {
    title: 'Shop - High-Quality Parts, Devices & Accessories | LML Electronics',
    description:
      'Shop our extensive collection of high-quality device parts, accessories, and replacement components. Find genuine parts for phones, tablets, and laptops with warranty and expert support.',
    keywords:
      'device parts, phone accessories, tablet parts, laptop components, replacement parts, tech accessories, genuine parts, device repair parts, high-quality components, repair accessories',
    openGraph: {
      title: 'Shop - High-Quality Parts, Devices & Accessories | LML Electronics',
      description:
        'Shop our extensive collection of high-quality device parts, accessories, and replacement components. Find genuine parts for phones, tablets, and laptops with warranty and expert support.',
      url: `${baseUrl}/shop`,
      type: 'website',
      siteName: 'LML Electronics',
      images: [
        {
          url: `${baseUrl}/images/lml_box.webp`,
          width: 1200,
          height: 630,
          alt: 'LML Electronics Shop',
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Shop - High-Quality Parts, Devices & Accessories | LML Electronics',
      description:
        'Shop our extensive collection of high-quality device parts, accessories, and replacement components. Find genuine parts for phones, tablets, and laptops with warranty and expert support.',
      images: [`${baseUrl}/images/lml_box.webp`],
      creator: '@lmlelectronics',
    },
    alternates: {
      canonical: `${baseUrl}/shop`,
    },
  };
}

async function fetchProductCategories () {
  try {
    const response = await getInventoryCategories();
    const categories = response.map(category => ({
      ...category,
      children: category.children || [],
      items: [],
    }));

    return { categories, error: null };
  } catch (error) {
    console.error('Failed to fetch product categories:', error);

    return { categories: [], error: 'Could not load categories.' };
  }
}

export default async function ProductsPage () {
  const { categories, error } = await fetchProductCategories();

  // Convert categories for Filters
  const filterCategories = categories
    .filter(category => category.visible === true && category.parentId == null && category.name !== 'Tickets')
    .map(cat => ({ id: cat.id, name: cat.name }));

  return (
    <div>
      <Script
        id="shop-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            'name': 'Shop - LML Electronics',
            'description': 'Shop our extensive collection of high-quality device parts, accessories, and replacement components.',
            'url': 'https://lmlelectronics.com/shop',
            'publisher': {
              '@type': 'Organization',
              'name': 'LML Electronics',
              'url': 'https://lmlelectronics.com',
              'logo': {
                '@type': 'ImageObject',
                'url': 'https://lmlelectronics.com/logo.png',
              },
            },
            'breadcrumb': {
              '@type': 'BreadcrumbList',
              'itemListElement': [
                {
                  '@type': 'ListItem',
                  'position': 1,
                  'name': 'Home',
                  'item': 'https://lmlelectronics.com',
                },
                {
                  '@type': 'ListItem',
                  'position': 2,
                  'name': 'Shop',
                  'item': 'https://lmlelectronics.com/shop',
                },
              ],
            },
          }),
        }}
      />
      <PageHero
        title="All Shop Items"
        subtitle="Find the perfect components and repair kits for your needs. High-quality parts for every fix."
        backgroundImage="/images/lml_box.webp"
        breadcrumbs={[{ name: 'Shop', href: '/shop' }]}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProductsClientPage categories={filterCategories} />
        {/* Shop by Category Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse our wide selection of products by category to find
                exactly what you need
              </p>
            </div>

            {error ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">{error}</p>
              </div>
            ) : (
              <CategoryGrid categories={categories.filter(category => category.visible === true && category.parentId == null && category.name !== 'Tickets').map(category => ({
                ...category,
                children: [],
                items: [],
              }))} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
