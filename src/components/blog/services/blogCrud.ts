"use server";

import { fetchSession } from "../../../lib/session";
import { DataToBlog, DataToUpdate } from "@/components/blog/types/blogTypes";
import { Blog, PrismaClient, BlogCategory } from "@prisma/client";
import prisma from "@/lib/prisma";
import { BlogWithDetailsType } from "@/components/blog/types/blogTypes";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Define a type including category for full blog details
// Note: BlogWithAuthorAndTagsType already includes the base Blog, which has categoryId

export const getFeaturedBlog = async (): Promise<
  BlogWithDetailsType[] | []
> => {
  try {
    return await prisma.blog.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tags: true,
        category: true,
      },
    });
  } catch (error) {
    console.error("Error fetching featured blog:", error);
    // During build time, return empty array instead of throwing
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV) {
      console.warn("Database not available during build, returning empty featured blogs array");
      return [];
    }
    throw new Error("Failed to fetch featured blog");
  }
};

export const getLatestBlog = async (): Promise<BlogWithDetailsType | null> => {
  try {
    return await prisma.blog.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tags: true,
        category: true,
      },
    });
  } catch (error) {
    console.error("Error fetching Blog:", error);
    throw new Error("Failed to fetch Blog");
  }
};

export const getBlogs = async (): Promise<BlogWithDetailsType[]> => {
  try {
    return await prisma.blog.findMany({
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tags: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching Blogs:", error);
    throw new Error("Failed to fetch Blogs");
  }
};

export const getPublishedBlogs = async (
  page: number = 1,
  limit: number = 10,
  searchQuery?: string,
  selectedTag?: string,
  selectedCategory?: string
): Promise<{ blogs: BlogWithDetailsType[]; total: number }> => {
  try {
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      isPublished: true,
    };

    // Add search query filter if provided
    if (searchQuery) {
      whereClause.OR = [
        { title: { contains: searchQuery } },
        { description: { contains: searchQuery } },
      ];
    }

    // Add tag filter if provided
    if (selectedTag) {
      whereClause.tags = {
        some: {
          name: selectedTag,
        },
      };
    }

    // Add category filter if provided
    if (selectedCategory) {
      // Correctly filter by category name
      whereClause.category = {
        name: selectedCategory,
      };
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          tags: true,
          category: true,
        },
      }),
      prisma.blog.count({
        where: whereClause,
      }),
    ]);

    return {
      blogs,
      total,
    };
  } catch (error) {
    console.error("Error fetching published blogs:", error);
    throw new Error("Failed to fetch published blogs");
  }
};

export const getBlogById = async (
  blogId: number
): Promise<BlogWithDetailsType | null> => {
  try {
    return await prisma.blog.findUnique({
      where: {
        id: blogId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tags: true,
        category: true,
      },
    });
  } catch (error) {
    console.error("Error fetching Blog:", error);
    throw new Error("Failed to fetch Blog");
  }
};

export const getBlogByName = async (
  encodedName: string
): Promise<BlogWithDetailsType | null> => {
  try {
    const decodedName = decodeURIComponent(encodedName);

    return await prisma.blog.findFirst({
      where: {
        title: decodedName,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tags: true,
        category: true,
      },
    });
  } catch (error) {
    console.error("Error fetching Blog:", error);
    throw new Error("Failed to fetch Blog");
  }
};

export const getBlogBySlug = async (
  encodedName: string
): Promise<BlogWithDetailsType | null> => {
  try {
    const decodedName = decodeURIComponent(encodedName);

    return await prisma.blog.findFirst({
      where: {
        slug: {
          equals: decodedName,
          mode: "insensitive",
        },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tags: true,
        category: true,
      },
    });
  } catch (error) {
    console.error("Error fetching Blog:", error);
    throw new Error("Failed to fetch Blog");
  }
};

export async function getBlogsByTagName(tagName: string) {
  return await prisma.blog.findMany({
    where: {
      tags: {
        some: {
          name: {
            equals: tagName,
            mode: "insensitive",
          },
        },
      },
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      tags: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBlogsByCategory(categoryName: string) {
  try {
    return await prisma.blog.findMany({
      where: {
        category: {
          name: {
            equals: categoryName,
            mode: "insensitive",
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tags: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching blogs by category:", error);
    // During build time, return empty array instead of throwing
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV) {
      console.warn("Database not available during build, returning empty blogs array for category:", categoryName);
      return [];
    }
    throw new Error("Failed to fetch blogs by category");
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const createBlog = async (blogData: DataToBlog) => {
  try {
    const session = await fetchSession();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Verify staff exists
    const author = await prisma.staff.findUnique({
      where: { id: String(session.user.id) },
    });

    if (!author) {
      throw new Error("Invalid author ID");
    }

    const slug = generateSlug(blogData.title);

    // Make sure the generated slug is unique
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      throw new Error("Blog with this title already exists");
    }

    const authorId: string = String(session.user.id);
    const { tagIds, ...rest } = blogData;

    // Create the blog with associated tags
    const createdBlog = await prisma.blog.create({
      data: {
        ...rest,
        slug,
        authorId,
        // Connect to tags directly using tag IDs
        tags:
          tagIds && tagIds.length > 0
            ? { connect: tagIds.map((id: string) => ({ id })) }
            : undefined,
      },
      include: {
        tags: true,
        category: true,
      },
    });

    return createdBlog;
  } catch (error) {
    console.error("Error creating blog:", error);
    throw new Error("Failed to create blog");
  }
};

export const updateBlog = async (blogId: number, updatedData: DataToUpdate) => {
  const { tagIds, title, categoryId, content, ...blogData } = updatedData;

  try {
    // console.log("Server: Updating blog with ID:", blogId);
    // console.log("Server: Update data received:", {
    //   ...updatedData,
    //   contentLength: updatedData.content?.length || 0,
    //   contentPreview: updatedData.content?.substring(0, 50) + "...",
    // });

    // Generate and ensure a unique slug if the title is updated
    let slug: string | undefined;

    if (title) {
      slug = generateSlug(title);
      const isSlugUnique = await prisma.blog.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (isSlugUnique && isSlugUnique.id !== blogId) {
        slug = `${slug}-${blogId}`;
      }
    }

    // Create a properly typed update object
    const dataToUpdate: Prisma.BlogUpdateInput = {
      ...blogData,
      ...(title && { title }),
      ...(slug && { slug }),
      ...(categoryId && { categoryId }),
      ...(content !== undefined && { content }),
    };

    // console.log("Server: Prepared update data:", {
    //   ...dataToUpdate,
    //   contentIncluded: content !== undefined,
    // });

    // Handle tags if provided
    if (tagIds !== undefined) {
      // Update the blog with both data and tags in a single operation
      const result = await prisma.blog.update({
        where: { id: blogId },
        data: {
          ...dataToUpdate,
          tags: {
            set: [], // Clear existing tags
            connect: tagIds.map((id: string) => ({ id })), // Connect to provided tag IDs
          },
        },
        include: {
          tags: true,
          category: true,
        },
      });
      // console.log("Server: Update successful with tags");
      return result;
    }

    // If no tags provided, just update the blog data
    const result = await prisma.blog.update({
      where: { id: blogId },
      data: dataToUpdate,
      include: {
        tags: true,
        category: true,
      },
    });
    // console.log("Server: Update successful without tags");
    return result;
  } catch (error) {
    console.error("Server: Error updating blog:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update blog"
    );
  }
};

export async function updateBlogSlugs() {
  try {
    // Fetch all blogs
    const blogs = await prisma.blog.findMany();

    for (const blog of blogs) {
      // Skip blogs that already have a slug
      if (blog.slug) continue;

      // Generate a slug from the blog title
      let slug = generateSlug(blog.title);

      // Make sure the generated slug is unique
      const existingBlog = await prisma.blog.findUnique({
        where: {
          slug,
        },
      });

      if (existingBlog) {
        // Append the blog ID to the slug to make it unique
        slug = `${slug}-${blog.id}`;
      }

      // Update the blog with the new slug
      await prisma.blog.update({
        where: { id: blog.id },
        data: { slug },
      });

      console.log(`Slug generated for blog ID ${blog.id}: ${slug}`);
    }

    console.log("All blogs have been updated with slugs.");
    return true;
  } catch (error) {
    console.error("Error updating blog slugs:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

export const deleteBlog = async (blogId: number) => {
  try {
    await prisma.blog.delete({
      where: {
        id: blogId,
      },
    });
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};

export const getBlogArchive = async () => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });

    const archive = blogs.reduce<Record<string, typeof blogs>>((acc, blog) => {
      const key = format(blog.createdAt, "MMMM yyyy"); // e.g. 'April 2025'
      acc[key] = acc[key] || [];
      acc[key].push(blog);
      return acc;
    }, {});
    return archive;
  } catch (error) {
    console.error("Error fetching blog archive:", error);
    throw new Error("Failed to fetch blog archive");
  }
};

export const publishBlog = async (blogId: number) => {
  try {
    await prisma.blog.update({
      where: { id: blogId },
      data: { isPublished: true },
    });
  } catch (error) {
    console.error("Error publishing blog:", error);
    throw new Error("Failed to publish blog");
  }
};

export const unpublishBlog = async (blogId: number) => {
  try {
    await prisma.blog.update({
      where: { id: blogId },
      data: { isPublished: false },
    });
  } catch (error) {
    console.error("Error unpublishing blog:", error);
    throw new Error("Failed to unpublish blog");
  }
};
