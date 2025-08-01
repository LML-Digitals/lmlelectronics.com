'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BlogWithOnlyTagsType } from '@/components/blog/types/blogTypes';
import { Wrench } from 'lucide-react';

type CommonIssueCardProps = {
  blog: BlogWithOnlyTagsType;
};

function CommonIssueCard({ blog }: CommonIssueCardProps) {
  const encodedSlug = encodeURIComponent(blog.slug || '');

  const maxDescriptionLength = 100;
  const truncatedDescription = blog.description
    ? blog.description.length > maxDescriptionLength
      ? blog.description.substring(0, maxDescriptionLength) + '...'
      : blog.description
    : '';

  return (
    <div className="border-l-4 border-secondary bg-white rounded-r-lg p-4 shadow-lg hover:shadow-xl transition-all min-w-[280px] max-w-[320px] mx-2 relative overflow-hidden">
      <div className="absolute top-2 right-2 text-secondary">
        <Wrench size={20} />
      </div>
      
      <Link href={`/blogs/${encodedSlug}`} className="group">
        <h2 className="text-lg font-bold mb-2 line-clamp-2 h-14">
          {blog.title}
        </h2>
        
        {blog.image && (
          <div className="relative h-32 w-full mb-3 rounded-lg overflow-hidden">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {truncatedDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3 h-[60px]">
            {truncatedDescription}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {new Date(blog.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="bg-secondary/20 text-secondary px-2 py-1 rounded-full">
            Common Issue
          </span>
        </div>
      </Link>
    </div>
  );
}

export default CommonIssueCard;