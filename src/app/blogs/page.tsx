import { Metadata } from 'next';

import FeaturedBlogComp from '@/components/blog/blog-components/FeaturedBlogComp';
import { getFeaturedBlog } from '@/components/blog/services/blogCrud';
import BlogWithTags from '@/components/blog/blog-components/BlogWithTags';
import { BlogWithDetailsType } from '@/components/blog/types/blogTypes';
import Script from 'next/script';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Grid3X3 } from 'lucide-react';

export async function generateMetadata (): Promise<Metadata> {
  const baseUrl = 'https://lmlelectronics.com';

  return {
    title: 'Blog | Device Repair Tips, Tech Insights & DIY Guides | LML Electronics',
    description: 'Stay informed with LML Electronics\' expert blog. Discover device repair tips, tech insights, maintenance guides, and DIY tutorials. Learn about iPhone repairs, Samsung fixes, and more from our certified technicians.',
    keywords: 'device repair blog, tech repair tips, iPhone repair guide, Samsung repair tips, device maintenance, repair tutorials, tech insights, repair advice, device care, repair knowledge base, DIY repair guides, electronics repair blog, mobile device repair tips, tablet repair tutorials, laptop repair guides, repair how-to articles',
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
      canonical: `${baseUrl}/blogs`,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${baseUrl}/blogs`,
      title: 'Blog | Device Repair Tips & Tech Insights | LML Electronics',
      description: 'Stay informed with LML Electronics\' expert blog. Discover device repair tips, tech insights, and maintenance guides.',
      siteName: 'LML Electronics',
      images: [
        {
          url: `${baseUrl}/images/lml_box.webp`,
          width: 1200,
          height: 630,
          alt: 'LML Electronics Blog - Device Repair Tips and Tech Insights',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog | Device Repair Tips & Tech Insights | LML Electronics',
      description: 'Stay informed with LML Electronics\' expert blog. Discover device repair tips, tech insights, and maintenance guides.',
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

export default async function BlogPage () {
  let featuredPost: BlogWithDetailsType[] = [];
  let featuredError: string | null = null;

  try {
    featuredPost = await getFeaturedBlog() || [];
  } catch (err) {
    console.error('Fetch featured error:', err);
    featuredError = 'Failed to load featured posts';
  }

  return (
    <>
      <main className='min-h-screen bg-white'>
        <section className='flex flex-col items-center justify-center gap-3 px-3 md:px-0'>
          <h1 className='text-5xl font-bold mt-10 text-secondary'>Blogs</h1>
          <p className='text-center max-w-xl'>
            Discover in-depth analyses and innovative insights about device repairs and technology
          </p>
        </section>

        <section className='flex flex-col items-center justify-center my-10 lg:mt-20 px-3 md:px-10 w-full max-w-7xl mx-auto'>
          {featuredError ? (
            <div className='text-center py-10 text-red-500'>{featuredError}</div>
          ) : featuredPost.length > 0 ? (
            <div className='w-full mb-10 lg:mb-16'>
              <FeaturedBlogComp featuredPosts={featuredPost} />
            </div>
          ) : null}

          {/* Categories Section */}
          <div className='w-full mb-10 lg:mb-16'>
            <div className='bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl p-8 text-center'>
              <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                Explore by Category
              </h3>
              <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                Browse our blog content organized by topics like repair guides, tech tips, and device maintenance
              </p>
              <Link href='/blogs/categories'>
                <Button size='lg' className='bg-secondary hover:bg-secondary/90 text-white'>
                  <Grid3X3 className='mr-2 h-5 w-5' />
                  View All Categories
                </Button>
              </Link>
            </div>
          </div>

          <BlogWithTags />
        </section>
      </main>

      <Script
        id='blog-structured-data'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            'name': 'LML Electronics Blog',
            'description': 'Expert device repair tips, tech insights, and maintenance guides from certified technicians.',
            'url': 'https://lmlelectronics.com/blogs',
            'publisher': {
              '@type': 'Organization',
              'name': 'LML Electronics',
              'url': 'https://lmlelectronics.com',
              'logo': {
                '@type': 'ImageObject',
                'url': 'https://lmlelectronics.com/logo.png'
              }
            },
            'mainEntityOfPage': {
              '@type': 'WebPage',
              '@id': 'https://lmlelectronics.com/blogs'
            },
            'breadcrumb': {
              '@type': 'BreadcrumbList',
              'itemListElement': [
                {
                  '@type': 'ListItem',
                  'position': 1,
                  'name': 'Home',
                  'item': 'https://lmlelectronics.com'
                },
                {
                  '@type': 'ListItem',
                  'position': 2,
                  'name': 'Blog',
                  'item': 'https://lmlelectronics.com/blogs'
                }
              ]
            }
          })
        }}
      />

      <Script
        id='blog-faq-structured-data'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              {
                '@type': 'Question',
                'name': 'What topics does the LML Repair blog cover?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Our blog covers a wide range of topics including device repair tips, maintenance guides, tech insights, troubleshooting advice, and the latest updates in device repair technology.'
                }
              },
              {
                '@type': 'Question',
                'name': 'How often is the LML Repair blog updated?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'We regularly update our blog with new content, including repair guides, tech tips, and industry insights. Check back frequently for the latest articles and updates.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Can I request specific topics for the blog?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Yes, we welcome topic suggestions from our readers. Feel free to contact us with your ideas, and our team of experts will consider them for future blog posts.'
                }
              }
            ]
          })
        }}
      />
    </>
  );
}
