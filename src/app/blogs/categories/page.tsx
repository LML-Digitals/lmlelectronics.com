import { Metadata } from "next";
import CategoryGrid from "@/components/blog/blog-components/CategoryGrid";
import Script from "next/script";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog Categories | Device Repair & Tech Insights",
    description: "Explore all blog categories on LML Repair. Find repair guides, tech tips, device maintenance, and expert insights organized by topic. Browse our comprehensive collection of device repair and technology content.",
    keywords: "blog categories, repair guides, tech tips, device maintenance, smartphone repair, computer repair, tablet repair, tech insights, repair tutorials, device care",
  };
}

export default function CategoriesPage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <section className="flex flex-col items-center justify-center gap-3 px-3 md:px-0">
          <h1 className="text-5xl font-bold mt-10 text-secondary">Blog Categories</h1>
          <p className="text-center max-w-xl">
            Explore our comprehensive collection of device repair and technology content organized by category
          </p>
        </section>

        <section className="flex flex-col items-center justify-center my-10 lg:mt-20 px-3 md:px-10 w-full max-w-7xl mx-auto">
          <CategoryGrid />
        </section>
      </main>

      <Script
        id="categories-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Blog Categories",
            "description": "Explore all blog categories on LML Repair. Find repair guides, tech tips, device maintenance, and expert insights organized by topic.",
            "url": "https://lmlrepair.com/blogs/categories",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://lmlrepair.com/blogs/categories"
            },
            "publisher": {
              "@type": "Organization",
              "name": "LML Repair",
              "logo": {
                "@type": "ImageObject",
                "url": "https://lmlrepair.com/logo.png"
              }
            }
          })
        }}
      />
    </>
  );
} 