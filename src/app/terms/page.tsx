import React from 'react';
import { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { getActiveTerms } from '@/components/terms/services/termsCrud';
import TermCard from '@/components/terms/term-components/TermCard';
import SearchableTerms from '@/components/terms/term-components/SearchableTerms';
import Script from 'next/script';

export async function generateMetadata (): Promise<Metadata> {
  return {
    title: 'Terms of Service | LML Repair',
    description: 'Review our comprehensive Terms of Service for device repair services. Clear policies and guidelines for all customers.',
    keywords: 'terms of service, LML Repair policies, repair guidelines, device repair terms, warranty information, service policies, repair service agreement, customer responsibilities, repair terms and conditions',
  };
}

export default async function TermsPage () {
  let activeTerms;

  try {
    activeTerms = await getActiveTerms();
  } catch (error) {
    console.error('Error fetching active terms:', error);

    return (
      <div>
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#e3de1e] animate-pulse">
              Terms of Service
            </h1>
            <p className="text-base text-gray-500">
              Explore our comprehensive terms and conditions
            </p>
          </div>
          <div className="px-2 md:px-0">
            <p className="text-red-500 text-center mt-10">
              Failed to load terms. Please try again later.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Script
        id="terms-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': 'Terms of Service | LML Repair',
            'description': "Review LML Repair's comprehensive Terms of Service for device repair services.",
            'publisher': {
              '@type': 'Organization',
              'name': 'LML Repair',
              'url': 'https://lmlrepair.com',
            },
          }),
        }}
      />
      <div>
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary">
              Terms of Service
            </h1>
            <p className="text-base text-gray-500">
              Review our comprehensive terms and conditions for device repair services
            </p>
          </div>
          <div className="mt-8">
            <SearchableTerms initialTerms={activeTerms} />
          </div>
        </main>
      </div>
    </>
  );
}
