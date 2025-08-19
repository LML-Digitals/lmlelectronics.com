
import BadgeComponent from "@/components/blog/blog-components/BadgeComponent";
import { getBlogBySlug } from "@/lib/services/blog";
import { Clock, User, Tag } from "lucide-react";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import SocialShareButtons from "@/components/blog/blog-components/SocialShareButtons";
import Script from "next/script";

type ParamsProps = {
  params: Promise<{
    slug: string;
  }>;
};

function capitalizeFirstLetter(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export async function generateMetadata({
  params,
}: ParamsProps): Promise<Metadata | undefined> {
  const { slug } = await params;

  try {
    const post: any = await getBlogBySlug(slug);

    if (!post) {
      return;
    }

    const { title, tags, content, image, metaTitle, metaDesc, author, category } = post;

    const tagNames = tags
      ?.map((tag: { name: string }) => capitalizeFirstLetter(tag.name))
      .join(", ");

    const authorName = author?.name || "LML Repair Team";
    const categoryName = category?.name || "";

    const pageTitle = metaTitle || `${title} | Blog`;
    const pageDescription =
      metaDesc ||
      `${title} - ${tagNames} blog post by ${authorName}. ${content.substring(
        0,
        150
      )}...`;
    const keywords = `${title}, ${tagNames}, ${authorName}, ${categoryName}, blog, repair, electronics, device repair, tech tips`;

    return {
      title: pageTitle,
      description: pageDescription,
      keywords: keywords,
    };
  } catch (err) {
    console.error("Error fetching post metadata:", err);
    return;
  }
}

async function fetchPostBySlug(blogTitle: string) {
  try {
    const post: any = await getBlogBySlug(blogTitle);
    return { post, error: null };
  } catch (err) {
    console.error("Error fetching post:", err);
    return {
      post: null,
      error: "Failed to load post. Please try again later.",
    };
  }
}

export default async function OneBlog({ params }: ParamsProps) {
  const { slug } = await params;
  const { post, error } = await fetchPostBySlug(slug);

  const convertToEmbedUrl = (url: string | null | undefined) => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      let videoId = urlObj.searchParams.get("v");
      if (!videoId && urlObj.hostname === "youtu.be") {
        videoId = urlObj.pathname.substring(1);
      }
      videoId = videoId?.split("?")[0] ?? null;
      if (!videoId) return "";
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }
      console.error("Error parsing youtube URL:", e);
      return "";
    }
  };

  const youtubeShareLink = post?.link;
  const embedUrl = convertToEmbedUrl(youtubeShareLink);
  const postUrl = `https://lmlrepair.com/blogs/${slug}`;

  return (
    <>
      <main className="flex-grow container mx-auto px-4 py-8 mt-14">
        {error ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md p-6">
            <p className="text-red-600 text-xl text-center">{error}</p>
          </div>
        ) : post ? (
          <article className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md space-y-8">
            <header className="border-b border-gray-200 pb-6">
              <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <time dateTime={post.createdAt}>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>

                {post.author && (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="font-medium">Staff</span>
                  </div>
                )}

                {post.category && (
                  <BadgeComponent categoryName={post.category.name} />
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <Tag size={16} className="text-gray-500 flex-shrink-0" />
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: { id: string; name: string }) => (
                        <span
                          key={tag.id}
                          className="inline-block bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors duration-150"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </header>

            {post.image && (
              <figure className="w-full my-6">
                <img
                  src={post.image}
                  alt={`Image for ${post.title}`}
                  className="rounded-lg w-full max-h-[500px] object-cover shadow-sm border border-gray-200"
                />
              </figure>
            )}

            <div className="prose prose-lg max-w-none text-gray-800 prose-a:text-indigo-600 hover:prose-a:text-indigo-800 prose-img:rounded-md prose-img:shadow-sm prose-headings:text-gray-900">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {embedUrl && (
              <div className="w-full max-w-4xl mx-auto my-12">
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border-2 border-secondary">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={embedUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            <SocialShareButtons title={post.title} url={postUrl} />
          </article>
        ) : (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="text-gray-500 text-xl ml-4">Loading post...</p>
          </div>
        )}
      </main>

      {post && (
        <Script
          id="blog-post-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "image": post.image,
              "datePublished": post.createdAt,
              "dateModified": post.updatedAt || post.createdAt,
              "author": {
                "@type": "Person",
                "name": "LML Repair Staff"
              },
              "publisher": {
                "@type": "Organization",
                "name": "LML Repair",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://lmlrepair.com/logo.png"
                }
              },
              "description": post.metaDesc || post.content.substring(0, 150),
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": postUrl
              },
              "keywords": post.tags?.map((tag: { name: string }) => tag.name).join(", "),
              "articleSection": post.category?.name
            })
          }}
        />
      )}
    </>
  );
}
