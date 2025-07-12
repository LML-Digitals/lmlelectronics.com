import Image from "next/image";
import Link from "next/link";
import ProductCarousel from "@/components/products/ProductCarousel";
import BundleGrid from "@/components/products/BundleGrid";
import { buildApiUrl, handleApiResponse } from "@/lib/config/api";
import { InventoryItem } from "@/types/api";
import { InventoryItemCategory } from "@/types/api";
import { Product } from "@/components/products/ProductCarousel";
import { Star, User } from "lucide-react";

async function getHomePageData() {
  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(buildApiUrl("/api/inventory/items")),
      fetch(buildApiUrl("/api/inventory/categories")),
    ]);

    const products = await handleApiResponse<Product[]>(productsResponse);
    const categories = await handleApiResponse<InventoryItemCategory[]>(
      categoriesResponse
    );

    return { products, categories };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return { products: [], categories: [] };
  }
}

const testimonials = [
  {
    quote:
      "The repair kit had everything I needed, and the instructions were super clear. My phone screen looks brand new!",
    name: "Alex Johnson",
    role: "Verified Customer",
  },
  {
    quote:
      "I was about to buy a new tablet, but LML's battery replacement kit saved me hundreds of dollars. The quality is top-notch.",
    name: "Samantha Lee",
    role: "DIY Enthusiast",
  },
  {
    quote:
      "Fast shipping and fantastic customer support. They helped me choose the right components for my custom project.",
    name: "Michael Chen",
    role: "Electronics Hobbyist",
  },
];

export default async function Home() {
  const { products, categories } = await getHomePageData();

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column (Text) */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
                <span className="block">Your Device,</span>
                <span className="block text-secondary">Fixed Right.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-lg mx-auto md:mx-0">
                From cracked screens to failing batteries, find high-quality,
                reliable repair kits and components to bring your electronics
                back to life.
              </p>
              <div className="mt-8 flex gap-4 justify-center md:justify-start">
                <Link
                  href="/products"
                  className="inline-block bg-secondary text-black px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors shadow-lg hover:shadow-xl"
                >
                  Shop Now
                </Link>
                <Link
                  href="/bundles"
                  className="inline-block bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  View Bundles
                </Link>
              </div>
            </div>

            {/* Right Column (Image) */}
            <div className="relative">
              <Image
                src="/images/lml_box.webp"
                alt="LML Electronics repair kit box"
                width={600}
                height={600}
                className=""
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Featured Products</h2>
            <p className="text-gray-600">
              Discover our most popular repair kits and components
            </p>
          </div>
          <ProductCarousel products={products} />
        </div>
      </section>

      {/* Bundles Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Popular Bundles</h2>
            <p className="text-gray-600">
              Save more with our carefully curated repair bundles
            </p>
          </div>
          <BundleGrid />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Browse Categories</h2>
            <p className="text-gray-600">
              Find the perfect repair solution for your device
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products/category/${category.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className="block"
              >
                <div className="bg-white rounded-[20px] p-0 flex flex-col h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center bg-[#f5f6fa] rounded-[20px] h-[150px] w-full mt-0 mb-0 overflow-hidden">
                    <Image
                      src={category.image || "/images/product-placeholder.jpg"}
                      alt={category.name}
                      width={120}
                      height={120}
                      className="object-contain max-h-[120px] max-w-[90%]"
                    />
                  </div>
                  <div className="w-full">
                    <div className="px-4 py-3">
                      <h3 className="text-[#3b5b7c] text-base font-normal text-center hover:underline cursor-pointer capitalize">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Choose Us</h2>
            <p className="text-gray-600">
              Experience the best in electronic repair solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <Image
                  src="/window.svg"
                  alt="Quality"
                  width={32}
                  height={32}
                  className="text-black"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                All our products meet the highest quality standards
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <Image
                  src="/globe.svg"
                  alt="Shipping"
                  width={32}
                  height={32}
                  className="text-black"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
              <p className="text-gray-600">
                Quick delivery to your doorstep worldwide
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
                <Image
                  src="/file.svg"
                  alt="Support"
                  width={32}
                  height={32}
                  className="text-black"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Professional guidance when you need it
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What Our Customers Say</h2>
            <p className="text-gray-600">
              Real stories from people who've trusted us with their repairs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <div className="flex">
                  <Star className="text-yellow-400" />
                  <Star className="text-yellow-400" />
                  <Star className="text-yellow-400" />
                  <Star className="text-yellow-400" />
                  <Star className="text-yellow-400" />
                </div>
                <p className="text-gray-700 italic my-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </main>
  );
}
