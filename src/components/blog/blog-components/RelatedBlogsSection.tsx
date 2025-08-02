'use client';

import RelatedBlogCard from './RelatedBlogCard';
import { BlogWithDetailsType, BlogWithFullTagsType } from '@/components/blog/types/blogTypes';

type RelatedBlogsSectionProps = {
  blogs: BlogWithDetailsType[];
};

function RelatedBlogsSection({ blogs }: RelatedBlogsSectionProps) {
  return (
    <div className="mt-12 md:mt-16 lg:mt-20 px-4 max-w-[1450px] mx-auto">
      <h1 className="text-center text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
        Related Blogs
      </h1>
      <div className="flex overflow-x-auto pb-6 -mx-4 pl-4 no-scrollbar">
        {blogs.map((blog) => (
          <div key={blog.id} className="flex-shrink-0 pr-4" style={{ minWidth: '300px' }}>
            <RelatedBlogCard blog={blog} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RelatedBlogsSection;
