
import BlogsTable from '@/components/blog/blog-components/BlogsTable';
import { authOptions } from '@/lib/config/authOptions';
import { getBlogs } from '@/components/blog/services/blogCrud';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { BlogWithDetailsType } from '@/components/blog/types/blogTypes';

const Posts = async () => {
  const staffInSession = await getServerSession(authOptions);

  if (!staffInSession) {
    redirect('/');
  }

  let posts: BlogWithDetailsType[] = [];
  let error = null;

  try {
    posts = await getBlogs();
  } catch (err) {
    error = 'Check your internet connection.';
  }

  return (
      <div className="flex flex-col justify-center gap-4 sm:gap-6 lg:gap-8">
        {error ? (
          <p className="text-red-500 text-center text-sm sm:text-base">{error}</p>
        ) : (
          <BlogsTable posts={posts} />
        )}
      </div>
  );
};

export default Posts;
