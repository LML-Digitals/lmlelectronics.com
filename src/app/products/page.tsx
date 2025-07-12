import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { InventoryItemCategory } from "@/types/api";

import CategoryGrid from "@/components/products/CategoryGrid";
import ProductListing from "@/components/products/ProductListing";
import { buildApiUrl, handleApiResponse } from "@/lib/config/api";
import PageHero from "@/components/PageHero";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Products - High-Quality Parts, Devices & Accessories",
    description:
      "Shop our extensive collection of high-quality device parts, accessories, and replacement components. Find genuine parts for phones, tablets, and laptops with warranty and expert support.",
    keywords:
      "device parts, phone accessories, tablet parts, laptop components, replacement parts, tech accessories, genuine parts, device repair parts, high-quality components, repair accessories",
  };
}

async function fetchProductCategories() {
  try {
    const response = await fetch(buildApiUrl("/api/inventory/categories"));
    const categories: InventoryItemCategory[] = await handleApiResponse(
      response
    );
    return { categories, error: null };
  } catch (error) {
    console.error("Failed to fetch product categories:", error);
    return { categories: [], error: "Could not load categories." };
  }
}

export default async function ProductsPage() {
  const { categories, error } = await fetchProductCategories();

  return (
    <div>
      <PageHero
        title="All Products"
        subtitle="Find the perfect components and repair kits for your needs. High-quality parts for every fix."
        backgroundImage="/images/lml_box.webp"
        breadcrumbs={[{ name: "Products", href: "/products" }]}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProductListing />
        {/* Shop by Category Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse our wide selection of products by category to find
                exactly what you need
              </p>
            </div>

            {error ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">{error}</p>
              </div>
            ) : (
              <CategoryGrid categories={categories.filter(category => category.visible === true && category.parentId == null && category.name !== "Tickets")} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
