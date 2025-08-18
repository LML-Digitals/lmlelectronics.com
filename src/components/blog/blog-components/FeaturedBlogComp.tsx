'use client';

import React from 'react';
import BadgeComponent from './BadgeComponent';
import Image from 'next/image';
import Link from 'next/link';
import { BlogWithDetailsType } from '@/components/blog/types/blogTypes';
import { Badge } from '@/components/ui/badge';

function FeaturedBlogComp ({
  featuredPosts,
}: {
  featuredPosts: BlogWithDetailsType[];
}) {
  if (!featuredPosts || featuredPosts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Featured Posts
        </h2>
        <div
          className="bg-yellow-100 border border-secondary text-secondary px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Info:</strong>
          <span className="block sm:inline"> No featured posts found.</span>
        </div>
      </div>
    );
  }

  const postsToShow = featuredPosts.slice(0, 3);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 py-8">
      {/* <div className="flex flex-col items-center mb-8">
      </div> */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {postsToShow.map((post) => {
          const encodedSlug = encodeURIComponent(post.slug || '');

          return (
            <Link
              href={`/blogs/${encodedSlug}`}
              key={post.id}
              className=" group bg-white rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative w-full h-48">
                <Image
                  src={post.image || '/logo.png'}
                  alt={post.title}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <BadgeComponent categoryName={post.category.name} />
                  <Badge className="bg-secondary text-white">Featured</Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-secondary transition-colors duration-200 line-clamp-2">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="text-gray-600 mb-3 text-sm line-clamp-3 flex-grow">
                    {post.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-auto">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default FeaturedBlogComp;
