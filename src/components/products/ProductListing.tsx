"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import ProductCarousel from "./ProductCarousel";
import type { InventoryItem } from "@/types/api";
import { buildApiUrl, handleApiResponse } from "@/lib/config/api";

export default function ProductListing() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Replace with your API endpoint
        const response = await fetch(buildApiUrl("/api/inventory/items"));
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const items = await handleApiResponse<InventoryItem[]>(response);
        console.log(items);

        // Filter out items that should not appear in Featured Products
        const filteredItems = items.filter((item) => {
          const itemsToHide = [
            "Protective Case",
            "Screen Protectors",
            "Chargers",
          ];

          const shouldHide = itemsToHide.some((name) =>
            item.name.toLowerCase().includes(name.toLowerCase())
          );

          return !shouldHide && item.variations.some((v) => v.visible);
        });

        setProducts(filteredItems);
        setFilteredProducts(filteredItems);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Search Filter */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-secondary" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No products found matching your search.
            </p>
          </div>
        ) : (
          <ProductCarousel
            products={filteredProducts.map((product) => ({
              id: product.id,
              name: product.name,
              description: product.description || undefined,
              image: product.image,
              variations: product.variations.filter((v) => v.visible),
            }))}
            title="Featured Products"
            autoplay={true}
            autoplaySpeed={3000}
          />
        )}
      </div>
    </section>
  );
}
