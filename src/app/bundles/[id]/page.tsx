import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BundleDetails from '@/components/bundles/BundleDetails';
import { buildApiUrl, handleApiResponse } from '@/lib/config/api';
import { BundleDetailsProps } from '@/components/bundles/BundleDetails';
import PageHero from '@/components/PageHero';
import { getBundleById } from '@/components/dashboard/inventory/bundles/services/bundles';

interface BundlePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getBundleData (id: string) {
  try {
    const result = await getBundleById(id);
    const data = result;

    if (!data) {
      return null;
    }

    return data.bundle;
  } catch (error) {
    console.error('Error fetching bundle:', error);

    return null;
  }
}

export async function generateMetadata ({
  params,
}: BundlePageProps): Promise<Metadata> {
  const { id } = await params;
  const bundle = await getBundleData(id);

  if (!bundle) {
    return {
      title: 'Bundle Not Found',
      description: 'The requested bundle could not be found.',
    };
  }

  const mainVariation = bundle.variations?.[0];
  const price = mainVariation?.sellingPrice || 0;

  return {
    title: `${bundle.name} - Complete Repair Bundle | LML Repair`,
    description:
      bundle.description
      || `Complete repair bundle featuring ${
        bundle.bundleComponents?.length || 0
      } components. Professional quality parts and tools for ${
        bundle.name
      } repairs.`,
    keywords: `${bundle.name}, repair bundle, repair kit, ${mainVariation?.sku}, device repair, repair tools, complete kit`,
    // openGraph: {
    //   title: bundle.name,
    //   description:
    //     bundle.description ||
    //     `Complete repair bundle with ${
    //       bundle.bundleComponents?.length || 0
    //     } components`,
    //   images: bundle.image ? [{ url: bundle.image, alt: bundle.name }] : [],
    //   type: 'product',
    // },
  };
}

export default async function BundlePage ({ params }: BundlePageProps) {
  const { id } = await params;
  const bundle = await getBundleData(id);

  if (!bundle) {
    notFound();
  }

  return (
    <>
      <PageHero
        title={bundle.name}
        subtitle={bundle.description || 'Shop our expertly curated repair bundles and kits to get everything you need in one convenient package.'}
        backgroundImage={bundle.image || '/images/lml_box.webp'}
        breadcrumbs={[
          { name: 'Repair Bundles', href: '/bundles' },
          { name: bundle.name, href: `/bundles/${bundle.id}` },
        ]}
      />
      <div className='max-w-7xl mx-auto'>
        {/* Hero Section - Client Component */}
        {/* <BundlesHero /> */}
        {/* <PageHero
          description={bundle.description || ''}
          image={bundle.image || '/iphone-broken.png'}
        /> */}
        <BundleDetails bundle={bundle} />
      </div>
    </>
  );
}
