"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import BlogCard from "./BlogCard";
// import { Blog, BlogTag, BlogCategory } from "@prisma/client"; // Already imported via BlogWithDetailsType
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  X,
  Filter,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getPublishedBlogs } from "@/components/blog/services/blogCrud";
import { getTags } from "@/components/dashboard/Tags/services/tagCrud";
import { getBlogCategories } from "@/components/blog/services/blogCategoryCrud"; // Assuming services are exported from an index file
import { BlogWithDetailsType } from "@/components/blog/types/blogTypes";
import { BlogCategory, Tag } from "@prisma/client";

interface BlogWithTagsProps {
  // Removed initial props as data is fetched internally
  // blogs: Blog[];
  // tags: BlogTag[];
  // categories: BlogCategory[];
  selectedTagFromUrl?: string | null;
  selectedCategoryFromUrl?: string | null;
}

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

const BlogWithTags = ({
  selectedTagFromUrl,
  selectedCategoryFromUrl,
}: BlogWithTagsProps) => {
  const [blogs, setBlogs] = useState<BlogWithDetailsType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(
    selectedTagFromUrl || null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    selectedCategoryFromUrl || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const observer = useRef<IntersectionObserver>(null);
  const lastBlogElementRef = useRef<HTMLDivElement>(null);
  const limit = 6; // Number of blogs to load per page

  // Filter states for better UX
  const [categorySearch, setCategorySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  // Filtered lists for better performance
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Show limited items initially
  const displayedCategories = showAllCategories ? filteredCategories : filteredCategories.slice(0, 5);
  const displayedTags = showAllTags ? filteredTags : filteredTags.slice(0, 8);

  // Fetch blogs with pagination
  const fetchBlogs = useCallback(async (pageNum: number, append: boolean = false) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    
    try {
      // Fetch blogs and other data concurrently
      const [blogsData, tagsData, categoriesData] = await Promise.all([
        getPublishedBlogs(
          pageNum,
          limit,
          searchQuery || undefined,
          selectedTag || undefined,
          selectedCategory || undefined
        ),
        pageNum === 1 ? getTags({ limit: 1000 }) : Promise.resolve({ tags }),
        pageNum === 1 ? getBlogCategories() : Promise.resolve(categories),
      ]);

      if (append) {
        setBlogs(prev => [...prev, ...blogsData.blogs]);
      } else {
        setBlogs(blogsData.blogs);
      }
      
      setTotalBlogs(blogsData.total);
      setHasMore(blogsData.blogs.length === limit);
      
      // Only update tags and categories on first load
      if (pageNum === 1) {
        setTags(tagsData.tags);
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load blog data. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, selectedTag, selectedCategory, tags, categories]);

  // Fetch initial data and refetch on filter change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchBlogs(1, false);
  }, [searchQuery, selectedTag, selectedCategory]);

  // Intersection Observer for infinite scroll
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchBlogs(nextPage, true);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, isLoadingMore, page, fetchBlogs]);

  // Handler to reset filters and search
  const handleClearFilters = () => {
    setSelectedTag(null);
    setSelectedCategory(null);
    setSearchQuery("");
    setPage(1);
    setHasMore(true);
    setIsSidebarOpen(false);
    setCategorySearch("");
    setTagSearch("");
    setShowAllCategories(false);
    setShowAllTags(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      {" "}
      {/* Added w-full */}
      {/* Sidebar */}
      <div
        className={`fixed lg:sticky top-0 left-0 h-full w-80 bg-white shadow-lg lg:shadow-none transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } z-50 lg:z-10 border-r border-gray-200 flex flex-col`}
      >
        <div className="p-4 flex-shrink-0 border-b border-gray-200">
          {/* Close button for mobile */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              className="lg:hidden p-2 rounded-full hover:bg-gray-100"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Search bar for Blogs */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Scrollable Filter Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-md font-semibold mb-3 flex items-center justify-between">
              Categories
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredCategories.length}
              </span>
            </h3>
            
            {/* Category Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>

            {/* All Categories Button */}
            <Link href="/blogs">
              <button
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors ${
                  !selectedCategory
                    ? "bg-secondary text-black shadow-sm"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  setIsSidebarOpen(false);
                }}
              >
                All Categories
              </button>
            </Link>

            {/* Category List */}
            <div className="space-y-1 mt-2">
              {displayedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blogs/categories/${encodeURIComponent(cat.name.toLowerCase().replace(/ /g, '-'))}`}
                >
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors ${
                      selectedCategory === cat.name
                        ? "bg-secondary text-black shadow-sm"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      setIsSidebarOpen(false);
                    }}
                  >
                    {capitalizeFirstLetter(cat.name)}
                  </button>
                </Link>
              ))}
              
              {/* Show More/Less for Categories */}
              {filteredCategories.length > 5 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  {showAllCategories ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show {filteredCategories.length - 5} More
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-md font-semibold mb-3 flex items-center justify-between">
              Tags
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredTags.length}
              </span>
            </h3>
            
            {/* Tag Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>

            {/* All Tags Button */}
            <button
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors ${
                !selectedTag ? "bg-secondary text-black shadow-sm" : "text-gray-700"
              }`}
              onClick={() => {
                setSelectedTag(null);
                setIsSidebarOpen(false);
              }}
            >
              All Tags
            </button>

            {/* Tag List */}
            <div className="space-y-1 mt-2">
              {displayedTags.map((tag) => (
                <button
                  key={tag.id}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors ${
                    selectedTag === tag.name
                      ? "bg-secondary text-black shadow-sm"
                      : "text-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedTag(tag.name);
                    setIsSidebarOpen(false);
                  }}
                >
                  {capitalizeFirstLetter(tag.name)}
                </button>
              ))}
              
              {/* Show More/Less for Tags */}
              {filteredTags.length > 8 && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  {showAllTags ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show {filteredTags.length - 8} More
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClearFilters}
          >
            Clear All Filters
          </Button>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {" "}
        {/* Added min-w-0 to prevent overflow issues */}
        {/* Toggle button for mobile */}
        <Button
          variant="outline"
          className="lg:hidden fixed bottom-4 left-4 z-40 shadow-lg bg-white p-3 rounded-full" // Changed from right-4 to left-4
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Filter className="h-5 w-5" />
        </Button>
        {/* Blog list & Loading/Error/No results states */}
        <div className="mt-8 lg:mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 px-6 border rounded-lg bg-red-50 text-red-700">
              <p className="text-xl font-semibold mb-2">Error Loading Blogs</p>
              <p>{error}</p>
            </div>
          ) : blogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.map((blog, index) => (
                  <div
                    key={blog.id}
                    ref={index === blogs.length - 1 ? lastElementRef : undefined}
                  >
                    <BlogCard blog={blog} />
                  </div>
                ))}
              </div>
              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex justify-center items-center mt-8">
                  <Loader2 className="h-6 w-6 animate-spin text-secondary" />
                  <span className="ml-2 text-gray-600">Loading more blogs...</span>
                </div>
              )}
              {/* End of results indicator */}
              {!hasMore && blogs.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>You've reached the end of all blogs</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 px-6 border rounded-lg bg-gray-50">
              <p className="text-xl font-semibold text-gray-700 mb-2">
                No blogs found
              </p>
              <p className="text-gray-600">
                Try adjusting your search or filters.
              </p>
              <Button
                variant="link"
                onClick={handleClearFilters}
                className="mt-2"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogWithTags;
