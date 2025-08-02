"use client";

import Image from "next/image";
import Link from "next/link";
// import BadgeComponent from "./BadgeComponent"; // Removed
import { updateBlogSlugs } from "@/components/blog/services/blogCrud";
import { toast } from "../../ui/use-toast";
// Use a more specific type if available, like BlogWithAuthorAndTagsType or BlogWithDetailsType
// Assuming BlogWithDetailsType is passed which includes category
import { BlogWithDetailsType } from "@/components/blog/types/blogTypes";
import router from "next/router";
import { Badge } from "@/components/ui/badge";
import BadgeComponent from "./BadgeComponent";

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

type BlogCardProps = {
  blog: BlogWithDetailsType; // Updated type to include category
};

function BlogCard({ blog }: BlogCardProps) {
  const encodedSlug = encodeURIComponent(blog.slug || "");

  // NOTE: The handleGenerateSlug functionality might be better placed in an admin interface
  // rather than directly on the public-facing blog card.
  const handleGenerateSlug = async () => {
    try {
      // Add try-catch for better error handling
      const res = await updateBlogSlugs();
      if (res) {
        toast({
          title: "Slugs generated",
          description: "Slug has been generated for all blogs",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate slugs",
          variant: "destructive", // Use destructive variant for errors
        });
      }
    } catch (error) {
      console.error("Error generating slugs:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating slugs.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="group relative bg-white rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
      <Link href={`/blogs/${encodedSlug}`} className=" flex flex-col flex-grow">
        {/* Image Section - Removed aspect ratio, added fixed height */}
        <div className="relative h-48 overflow-hidden flex-shrink-0">
          {" "}
          {/* Set fixed height & ensure overflow is hidden */}
          <Image
            src={blog.image ? blog.image : "/logo.png"}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Category and Tags Section */}
          <div className="mb-3 flex-shrink-0">
            {/* Display Category */}
            {blog.category && (
                <BadgeComponent categoryName={blog.category.name} />
            )}
          </div>

          {/* Title and Description Section */}
          <div className="flex-grow min-h-[6rem]">
            <h1 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-secondary transition-colors duration-200 line-clamp-2">
              {blog.title}
            </h1>
            {blog.description && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                {blog.description}
              </p>
            )}
          </div>
          {/* Author and Date */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Staff</span>
            <span>•</span>
            <span>{new Date(blog.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}</span>
          </div>
          {/* Display Tags as comma-separated text */}
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <Link key={tag.id} href={`/blogs/tags/${encodeURIComponent(tag.name.toLowerCase().replace(/ /g, "-"))}`}>
                <Badge key={tag.id} variant="default">
                  {capitalizeFirstLetter(tag.name)}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </Link>

      {/* Slug Generation Button - Keep outside the link */}
      {!blog.slug && (
        <div className="absolute top-2 right-2 z-10">
          {" "}
          {/* Position button */}
          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent link navigation
              handleGenerateSlug();
            }}
            className="bg-secondary text-white py-1 px-2 rounded text-xs hover:bg-secondary/80 transition-colors duration-200 shadow-sm"
            title="Generate missing slug"
          >
            Generate Slug
          </button>
        </div>
      )}
    </div>
  );
}

export default BlogCard;
