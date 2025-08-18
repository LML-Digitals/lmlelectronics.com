'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  BlogWithDetailsType,
  BlogWithTagsType,
} from '@/components/blog/types/blogTypes';
import BadgeComponent from './BadgeComponent';

type RelatedBlogCardProps = {
  blog: BlogWithDetailsType;
};

function RelatedBlogCard ({ blog }: RelatedBlogCardProps) {
  const encodedSlug = encodeURIComponent(blog.slug || '');

  const maxTagsToShow = 3;
  const displayedTags = blog.tags.slice(0, maxTagsToShow);
  const remainingTagsCount = blog.tags.length - maxTagsToShow;

  // Define max description length before truncating
  const maxDescriptionLength = 150;
  const truncatedDescription = blog.description
    ? blog.description.length > maxDescriptionLength
      ? `${blog.description.substring(0, maxDescriptionLength)}...`
      : blog.description
    : '';

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px] mx-auto">
      <Link href={`/blogs/${encodedSlug}`} className="group">
        <Image
          src={blog.image || '/placeholder.png'}
          alt={blog.title}
          width={150}
          height={150}
          className="rounded-lg w-full h-40 object-cover"
        />
        <div className="mt-2">
          <BadgeComponent categoryName={blog.category.name} />
        </div>
        <h2 className="mt-4 text-lg font-bold group-hover:text-[#e3de1e] transition-all h-16 overflow-hidden">
          {blog.title}
        </h2>
        <p className="text-sm text-gray-600">
          {new Date(blog.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>

        {/* Show description if available */}
        {truncatedDescription && (
          <p className="my-2 text-sm text-gray-700 h-24 overflow-hidden">
            {truncatedDescription}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-1">
          {displayedTags.map((tag) => (
            <Link
              href={`/blogs/tags/${encodeURIComponent(tag.name.toLowerCase().replace(/ /g, '-'))}`}
            >
              <span
                key={tag.name}
                className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded-full max-w-[100px] truncate"
              >
                {tag.name}
              </span>
            </Link>
          ))}
          {remainingTagsCount > 0 && (
            <span className="bg-gray-300 text-gray-800 px-2 py-1 text-xs rounded-full">
              +{remainingTagsCount} more
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

export default RelatedBlogCard;
