import React from 'react';
import { Metadata } from 'next';
import { getActiveTermsBySlug } from '@/components/terms/services/termsCrud';
import TermComponent from '@/components/terms/term-components/TermComponent';

interface TermDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata ({
  params,
}: TermDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const term = await getActiveTermsBySlug(slug);

    return {
      title: `${term?.title || 'Term Details'}`,
      description: `Details for the term: ${term?.title}`,
      keywords: `LML Repair, terms of service, ${term?.title || 'term details'}`,
    };
  } catch (error) {
    console.error('Error fetching term metadata:', error);

    return {
      title: 'LML Repair | Term Details',
      description: 'Error fetching term details',
    };
  }
}

export default async function TermDetailPage ({ params }: TermDetailPageProps) {
  try {
    const { slug } = await params;
    const term = await getActiveTermsBySlug(slug);

    if (!term || term.versions.length === 0) {
      return (
        <div>
          <div className="text-center mt-20">
            <h1 className="text-5xl font-bold text-secondary animate-pulse">
              Term Not Found
            </h1>
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Hero Section */}
        <div className="flex flex-col gap-8 text-center my-20">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary animate-pulse">
              {term.title}
            </h1>
            <p className="text-base text-gray-500">
              Learn about the term bellow
            </p>
          </div>
        </div>
        <TermComponent
          term={{
            id: term.id,
            title: term.title,
            content: term.versions[0].content,
            effectiveAt: term.versions[0].effectiveAt,
            lastUpdated: term.versions[0].lastUpdated,
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching term details:', error);

    return (
      <div>
        <div className="text-center mt-20">
          <h1 className="text-xl font-bold text-red-600">
            Something Went Wrong
          </h1>
          <p className="text-lg text-gray-700">We couldn't fetch the term details. Please try again later.</p>
        </div>
      </div>
    );
  }
}
