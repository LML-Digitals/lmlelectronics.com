import { Metadata } from "next";
import { BlogCategory } from "@prisma/client";
import { getBlogsByCategory } from "@/components/blog/services/blogCrud";
import { BlogWithDetailsType } from "@/components/blog/types/blogTypes";
import { getBlogCategories } from "@/components/blog/services/blogCategoryCrud"; // Updated import path
import BlogCard from "@/components/blog/blog-components/BlogCard";
import { getBlogCategoryByName } from "@/components/blog/services/blogCategoryCrud";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  return {
    title: `${decodedSlug} - Blog Categories`, // Updated title
    description: `Explore all blog posts in the ${decodedSlug} category on LML Repair's blog platform.`, // Updated description
  };
}

export async function generateStaticParams() {
  const categories = await getBlogCategories(); // Updated function call
  return categories.map((category) => ({
    // Updated variable name
    slug: encodeURIComponent(category.name.toLowerCase().replace(/ /g, "-")),
  }));
}

export default async function CategoryPage({
  // Updated component name (optional but good practice)
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).replace(/-/g, " ");

  let blogs: BlogWithDetailsType[] = [];
  let category: BlogCategory | null = null; // Updated variable name and type

  try {
    // Updated function call
    const result = await getBlogsByCategory(decodedSlug);
    blogs = result;
    // Updated function call and variable name
    category = await getBlogCategoryByName(decodedSlug);
  } catch (error) {
    console.error("Error fetching category data:", error); // Updated error message
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-3 px-3 md:px-0">
        <h1 className="text-5xl font-bold mt-10 text-secondary capitalize animate-pulse">
          {decodedSlug}
        </h1>
        <p className="text-center max-w-xl">
          Blogs in the {decodedSlug} category
        </p>{" "}
        {category?.description && ( // Updated variable name
          <p className="text-center max-w-xl mt-5">{category.description}</p> // Updated variable name
        )}
      </div>

      <div className="flex flex-col lg:items-center justify-center mt-20 flex-wrap px-3 max-w-7xl mx-auto w-full md:px-10 mb-36">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </div>
  );
}
