import type { Metadata } from 'next';
import Script from 'next/script';

import BundleListing from '@/components/bundles/BundleListing';
import PageHero from '@/components/PageHero';

export async function generateMetadata (): Promise<Metadata> {
  const baseUrl = 'https://lmlelectronics.com';

  return {
    title: 'Repair Bundles & Complete Kits | LML Electronics - Save on Device Repair Solutions',
    description: 'Shop LML Electronics\' expertly curated repair bundles and complete kits. Get everything you need for device repairs in one convenient package. Save money with our comprehensive repair solutions for phones, tablets, and laptops.',
    keywords: 'repair bundles, complete repair kits, device repair packages, phone repair bundles, tablet repair kits, laptop repair sets, repair tool bundles, bundle deals, complete repair solutions, repair kit packages, DIY repair bundles, professional repair kits, device maintenance bundles, repair accessories bundles',
    authors: [{ name: 'LML Electronics' }],
    creator: 'LML Electronics',
    publisher: 'LML Electronics',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/bundles`,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${baseUrl}/bundles`,
      title: 'Repair Bundles & Complete Kits | LML Electronics',
      description: 'Shop LML Electronics\' expertly curated repair bundles and complete kits. Get everything you need for device repairs in one convenient package.',
      siteName: 'LML Electronics',
      images: [
        {
          url: `${baseUrl}/images/lml_box.webp`,
          width: 1200,
          height: 630,
          alt: 'LML Electronics Repair Bundles and Complete Kits',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Repair Bundles & Complete Kits | LML Electronics',
      description: 'Shop LML Electronics\' expertly curated repair bundles and complete kits. Get everything you need for device repairs in one convenient package.',
      images: [`${baseUrl}/images/lml_box.webp`],
      creator: '@lmlelectronics',
      site: '@lmlelectronics',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BundlesPage () {
  return (
    <>
      <PageHero
        title='Repair Bundles'
        subtitle='Shop our expertly curated repair bundles and kits to get everything you need in one convenient package.'
        backgroundImage='/images/lml_box.webp'
        breadcrumbs={[{ name: 'Repair Bundles', href: '/bundles' }]}
      />
      <div className='max-w-7xl m-auto'>
        <Script
          id='bundles-structured-data'
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: 'LML Electronics Repair Bundles',
              description: 'Shop LML Electronics\' expertly curated bundles and repair kits for complete device repair solutions',
              url: 'https://lmlelectronics.com/bundles',
              publisher: {
                '@type': 'Organization',
                name: 'LML Electronics',
                url: 'https://lmlelectronics.com',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://lmlelectronics.com/logo.png',
                },
              },
              mainEntity: {
                '@type': 'ItemList',
                name: 'Repair Bundles & Kits',
                description: 'Complete repair solutions bundled for convenience and savings',
                numberOfItems: 'Multiple repair bundles available',
              },
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://lmlelectronics.com',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Repair Bundles',
                    item: 'https://lmlelectronics.com/bundles',
                  },
                ],
              },
            }),
          }}
        />

        {/* Bundle Listing with Pagination - Client Component */}
        <BundleListing />

        {/* Call to Action */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Our Bundles?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Our expertly curated bundles ensure you have everything you need
                for successful repairs, while saving money compared to buying
                items individually.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-8 w-8 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Save Money</h3>
                  <p className="text-gray-600 text-sm">
                    Get better value by purchasing complete sets instead of
                    individual items.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-8 w-8 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Everything Included</h3>
                  <p className="text-gray-600 text-sm">
                    No need to search for individual components - we've got you
                    covered.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-8 w-8 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Expert Curated</h3>
                  <p className="text-gray-600 text-sm">
                    Each bundle is carefully assembled by our repair experts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
