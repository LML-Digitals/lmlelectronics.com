import { buildApiUrl, handleApiResponse } from "@/lib/config/api";

// Function to get published blogs from LML repair API
export async function getPublishedBlogs(
  page: number = 1,
  limit: number = 10,
  searchQuery?: string,
  selectedTag?: string,
  selectedCategory?: string
): Promise<{ blogs: any[]; total: number }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (searchQuery) params.append('search', searchQuery);
    if (selectedTag) params.append('tag', selectedTag);
    if (selectedCategory) params.append('category', selectedCategory);

    const response = await fetch(buildApiUrl(`/api/blogs?${params}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<{ blogs: any[]; total: number }>(response);
  } catch (error) {
    console.error("Error fetching published blogs:", error);
    return { blogs: [], total: 0 };
  }
}

// Function to get blog tags from LML repair API
export async function getTags(options: { limit?: number } = {}): Promise<{ tags: any[] }> {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());

    const response = await fetch(buildApiUrl(`/api/blogs/tags?${params}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<{ tags: any[] }>(response);
  } catch (error) {
    console.error("Error fetching blog tags:", error);
    return { tags: [] };
  }
}

// Function to get blog categories from LML repair API
export async function getBlogCategories(): Promise<any[]> {
  try {
    const response = await fetch(buildApiUrl("/api/blogs/categories"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<any[]>(response);
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return [];
  }
}

// Function to get blog by slug from LML repair API
export async function getBlogBySlug(slug: string): Promise<any | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/blogs/${slug}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<any>(response);
  } catch (error) {
    console.error(`Error fetching blog ${slug}:`, error);
    return null;
  }
}

// Function to get featured blog from LML repair API
export async function getFeaturedBlog(): Promise<any[]> {
  try {
    const response = await fetch(buildApiUrl("/api/blogs/featured"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<any[]>(response);
  } catch (error) {
    console.error("Error fetching featured blog:", error);
    return [];
  }
}

// Function to get blogs by category from LML repair API
export async function getBlogsByCategory(categoryName: string): Promise<any[]> {
  try {
    const response = await fetch(buildApiUrl(`/api/blogs/categories/${categoryName}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<any[]>(response);
  } catch (error) {
    console.error(`Error fetching blogs by category ${categoryName}:`, error);
    return [];
  }
}

// Function to update blog slugs from LML repair API
export async function updateBlogSlugs(): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(buildApiUrl("/api/blogs/update-slugs"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<{ success: boolean; message?: string }>(response);
  } catch (error) {
    console.error("Error updating blog slugs:", error);
    return { success: false, message: "Failed to update blog slugs" };
  }
}

// Function to get blog category by name from LML repair API
export async function getBlogCategoryByName(name: string): Promise<any | null> {
  try {
    const response = await fetch(buildApiUrl(`/api/blogs/categories/name/${name}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleApiResponse<any>(response);
  } catch (error) {
    console.error(`Error fetching blog category ${name}:`, error);
    return null;
  }
}
