import { Metadata } from 'next';
import { BlogCategory } from '@prisma/client';
import Link from 'next/link';

import { getBlogsByCategory } from '@/components/blog/services/blogCrud';
import { BlogWithDetailsType } from '@/components/blog/types/blogTypes';
import { getBlogCategories } from '@/components/blog/services/blogCategoryCrud'; // Updated import path
import BlogCard from '@/components/blog/blog-components/BlogCard';
import { getBlogCategoryByName } from '@/components/blog/services/blogCategoryCrud';

export async function generateMetadata ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const baseUrl = 'https://lmlelectronics.com';

  return {
    title: `${decodedSlug} - Blog Category | LML Electronics`,
    description: `Explore all blog posts in the ${decodedSlug} category on LML Electronics' blog platform. Discover expert tips, guides, and insights.`,
    keywords: `${decodedSlug}, blog category, device repair blog, tech tips, ${decodedSlug} articles, LML Electronics blog`,
    authors: [{ name: 'LML Electronics' }],
    creator: 'LML Electronics',
    publisher: 'LML Electronics',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/blogs/categories/${slug}`,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${baseUrl}/blogs/categories/${slug}`,
      title: `${decodedSlug} - Blog Category | LML Electronics`,
      description: `Explore all blog posts in the ${decodedSlug} category on LML Electronics' blog platform.`,
      siteName: 'LML Electronics',
      images: [
        {
          url: `${baseUrl}/images/lml_box.webp`,
          width: 1200,
          height: 630,
          alt: `${decodedSlug} Blog Category - LML Electronics`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${decodedSlug} - Blog Category | LML Electronics`,
      description: `Explore all blog posts in the ${decodedSlug} category on LML Electronics' blog platform.`,
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

export async function generateStaticParams () {
  try {
    const categories = await getBlogCategories();

    return categories.map((category) => ({
      slug: encodeURIComponent(category.name.toLowerCase().replace(/ /g, '-')),
    }));
  } catch (error) {
    console.warn('Failed to fetch blog categories during build, using fallback:', error);

    // Return empty array to prevent build failure
    // The page will be generated dynamically at runtime
    return [];
  }
}

// Add fallback configuration
export const dynamicParams = true; // Allow dynamic generation for new categories
export const revalidate = 3600; // Revalidate every hour

export default async function CategoryPage ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).replace(/-/g, ' ');

  let blogs: BlogWithDetailsType[] = [];
  let category: BlogCategory | null = null;

  try {
    const result = await getBlogsByCategory(decodedSlug);

    blogs = result;
    category = await getBlogCategoryByName(decodedSlug);
  } catch (error) {
    console.error('Error fetching category data:', error);
    // Don't throw error, just show empty state
  }

  return (
    <div>
      <div className='flex flex-col items-center justify-center gap-3 px-3 md:px-0'>
        <h1 className='text-5xl font-bold mt-10 text-secondary capitalize animate-pulse'>
          {decodedSlug}
        </h1>
        <p className='text-center max-w-xl'>
          Blogs in the {decodedSlug} category
        </p>
        {category?.description && (
          <p className='text-center max-w-xl mt-5'>{category.description}</p>
        )}
      </div>

      <div className='flex flex-col lg:items-center justify-center mt-20 flex-wrap px-3 max-w-7xl mx-auto w-full md:px-10 mb-36'>
        {blogs.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <h3 className='text-xl font-semibold mb-4'>No blogs found</h3>
            <p className='text-gray-600 mb-6'>
              No blog posts found in the {decodedSlug} category at the moment.
            </p>
            <Link
              href='/blogs'
              className='bg-secondary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors'
            >
              View All Blogs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
