import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCategories,
  getFeaturedProducts,
  searchProducts,
} from "@/lib/square/products";
import { SquareCategory } from "@/types/square";
import { Product } from "../types/product";

const features = [
  {
    name: "Expert Repair Guides",
    description:
      "Step-by-step instructions with photos and videos to help you repair your devices.",
    icon: "📱",
  },
  {
    name: "Quality Components",
    description:
      "Premium replacement parts and components from trusted manufacturers.",
    icon: "🔧",
  },
  {
    name: "Fast Shipping",
    description:
      "Free shipping on orders over $50. Express delivery available.",
    icon: "🚚",
  },
  {
    name: "Expert Support",
    description:
      "Get help from our certified repair technicians whenever you need it.",
    icon: "🎧",
  },
];

// Stats will come from Square data
async function getStats() {
  try {
    const searchResult = await searchProducts();
    const products = searchResult.products;

    // Calculate real stats
    const totalProducts = products.length;
    const totalCategories = searchResult.facets?.categories?.length || 0;
    const inStockProducts = products.filter((p) => p.inStock).length;

    return [
      { name: "Products Available", value: `${totalProducts}+` },
      { name: "Product Categories", value: `${totalCategories}+` },
      { name: "Items In Stock", value: `${inStockProducts}+` },
      { name: "Happy Customers", value: "15,000+" }, // This would need to come from orders/customer data
    ];
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Fallback stats
    return [
      { name: "Successful Repairs", value: "50,000+" },
      { name: "Happy Customers", value: "15,000+" },
      { name: "Repair Guides", value: "500+" },
      { name: "Expert Technicians", value: "25+" },
    ];
  }
}

// Get popular categories from Square
async function getPopularCategories() {
  try {
    console.log("🔍 Fetching categories for landing page...");
    const [categories, searchResult] = await Promise.all([
      getCategories(),
      searchProducts(),
    ]);

    console.log(`📂 Found ${categories.length} categories from Square`);
    console.log(
      "Categories:",
      categories.map((c) => ({ id: c.id, name: c.categoryData.name }))
    );

    const products = searchResult.products;
    console.log(`📦 Found ${products.length} products`);

    // Calculate category popularity and create popular categories
    const categoryStats = categories
      .map((category) => {
        const categoryProducts = products.filter(
          (p) => p.category?.id === category.id
        );
        console.log(
          `Category "${category.categoryData.name}" has ${categoryProducts.length} products`
        );
        return {
          ...category,
          productCount: categoryProducts.length,
        };
      })
      .filter((cat) => cat.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 4); // Get top 4 categories

    console.log(`✅ Found ${categoryStats.length} categories with products`);

    if (categoryStats.length === 0) {
      console.log(
        "⚠️ No categories with products found, using fallback categories"
      );
      // Fallback categories
      return [
        {
          name: "iPhone Repair Kits",
          description: "Complete repair solutions for all iPhone models",
          image: "/images/iphone-repair.jpg",
          href: "/products?category=iphone-repair",
          color: "bg-yellow-50 text-yellow-800",
        },
        {
          name: "Samsung Galaxy Kits",
          description: "Professional-grade tools for Samsung devices",
          image: "/images/samsung-repair.jpg",
          href: "/products?category=samsung-repair",
          color: "bg-yellow-100 text-yellow-900",
        },
        {
          name: "Google Pixel Parts",
          description: "Original and compatible parts for Pixel phones",
          image: "/images/google-repair.jpg",
          href: "/products?category=google-repair",
          color: "bg-amber-50 text-amber-800",
        },
        {
          name: "Universal Tools",
          description: "Essential tools for all your repair projects",
          image: "/images/tools.jpg",
          href: "/products?category=tools",
          color: "bg-yellow-50 text-yellow-700",
        },
      ];
    }

    return categoryStats.map((category, index) => ({
      name: category.categoryData.name,
      description: `Professional solutions for ${category.categoryData.name.toLowerCase()}`,
      image: "/images/category-placeholder.jpg",
      href: `/products?category=${category.id}`,
      color: [
        "bg-yellow-50 text-yellow-800",
        "bg-yellow-100 text-yellow-900",
        "bg-amber-50 text-amber-800",
        "bg-yellow-50 text-yellow-700",
      ][index % 4],
    }));
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    // Fallback categories
    return [
      {
        name: "iPhone Repair Kits",
        description: "Complete repair solutions for all iPhone models",
        image: "/images/iphone-repair.jpg",
        href: "/products?category=iphone-repair",
        color: "bg-yellow-50 text-yellow-800",
      },
      {
        name: "Samsung Galaxy Kits",
        description: "Professional-grade tools for Samsung devices",
        image: "/images/samsung-repair.jpg",
        href: "/products?category=samsung-repair",
        color: "bg-yellow-100 text-yellow-900",
      },
      {
        name: "Google Pixel Parts",
        description: "Original and compatible parts for Pixel phones",
        image: "/images/google-repair.jpg",
        href: "/products?category=google-repair",
        color: "bg-amber-50 text-amber-800",
      },
      {
        name: "Universal Tools",
        description: "Essential tools for all your repair projects",
        image: "/images/tools.jpg",
        href: "/products?category=tools",
        color: "bg-yellow-50 text-yellow-700",
      },
    ];
  }
}

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "DIY Enthusiast",
    content:
      "The repair kit saved me $300! Clear instructions and quality parts made the iPhone screen replacement easy.",
    avatar: "SJ",
  },
  {
    name: "Mike Chen",
    role: "Tech Repair Shop Owner",
    content:
      "LML Electronics is my go-to supplier. Fast shipping, excellent quality, and competitive prices.",
    avatar: "MC",
  },
  {
    name: "Amanda Rodriguez",
    role: "College Student",
    content:
      "Fixed my Samsung Galaxy with their kit. Great value and the support team was incredibly helpful!",
    avatar: "AR",
  },
];

export default async function Home() {
  const [stats, popularCategories] = await Promise.all([
    getStats(),
    getPopularCategories(),
  ]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(253, 242, 0, 0.1) 0%, rgba(214, 205, 0, 0.1) 100%)",
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Find Your Fix.
                <span
                  className="block text-yellow-400"
                  style={{ color: "#FDF200" }}
                >
                  Repair Made Simple.
                </span>
              </h1>
              <p className="text-xl text-gray-100 mb-8 max-w-lg">
                Explore our complete range of simple, affordable DIY electronic
                repair kits. Everything you need to get your devices working
                like new, right here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="text-black font-semibold shadow-xl hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#FDF200" }}
                  >
                    Shop Repair Kits
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/images/lml_box.webp"
                alt="Logo"
                width={500}
                height={500}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.name} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find exactly what you need with our organized product categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCategories.slice(0, 6).map((category, index) => {
              const icons = ["📱", "🔧", "⚡", "🛠️", "💻", "🔌"];
              const icon = icons[index % icons.length];

              return (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group text-center p-6 rounded-xl border border-gray-200 hover:border-yellow-400 transition-all duration-200 hover:shadow-lg bg-white"
                >
                  <div className="mb-4">
                    <div
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: "#FDF20020" }}
                    >
                      {icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-yellow-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {category.description}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link href="/products">
              <Button
                variant="outline"
                className="border-yellow-400 text-yellow-500 hover:bg-yellow-400 hover:text-black"
              >
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose LML Electronics?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're your trusted partner for DIY electronic repair solutions.
              Here's what makes us different.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Repair Categories
            </h2>
            <p className="text-xl text-gray-600">
              Find the perfect repair kit for your device
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCategories.map((category, index) => {
              const icons = ["📱", "🔧", "⚡", "🛠️", "💻", "🔌", "🔋", "⚙️"];
              const icon = icons[index % icons.length];

              return (
                <Link key={category.name} href={category.href}>
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                    <div className="aspect-video bg-gray-200 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                        <span className="text-white text-6xl">{icon}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${category.color}`}
                      >
                        {category.name}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied customers who've successfully repaired
              their devices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 text-black rounded-full flex items-center justify-center font-semibold shadow-lg"
                    style={{ backgroundColor: "#FDF200" }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-24"
        style={{
          background: "linear-gradient(135deg, #FDF200 0%, #D6CD00 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to Start Your Repair Journey?
          </h2>
          <p className="text-xl text-black opacity-80 mb-8 max-w-2xl mx-auto">
            Browse our complete catalog of repair kits, components, and tools.
            Get your devices working like new today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-gray-800 shadow-xl"
              >
                Shop All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-black text-black hover:bg-black hover:text-white bg-white/90"
              >
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
