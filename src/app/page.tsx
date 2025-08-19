import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";
import ProductCarousel from "@/components/products/ProductCarousel";
import BundleGrid from "@/components/products/BundleGrid";
import ProductsHeroBanner, {
  ProductsPromoBanner,
} from "@/components/products/ProductsHeroBanner";
import { buildApiUrl, handleApiResponse } from "@/lib/config/api";
import { InventoryItem } from "@/types/api";
import { InventoryItemCategory } from "@/types/api";
import { Product } from "@/components/products/ProductCarousel";
import { Star, User } from "lucide-react";
import { getInventoryItems, getInventoryCategories } from "@/lib/services/inventory";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://lmlelectronics.com";
  
  return {
    title: "LML Electronics - Premium Device Repair Kits & Components | DIY Electronics Repair",
    description: "Transform your device repairs with LML Electronics' premium repair kits and components. High-quality parts for phones, tablets, and laptops. Expert support, fast shipping, and 30-day warranty. Shop now for professional-grade repair solutions.",
    keywords: "device repair kits, phone repair parts, tablet repair components, laptop repair tools, DIY electronics repair, Apple repair parts, Samsung repair kits, Google device repair, high-quality repair components, professional repair tools, electronics repair kits, mobile device repair, tablet screen replacement, phone battery replacement, repair tool sets",
    authors: [{ name: "LML Electronics" }],
    creator: "LML Electronics",
    publisher: "LML Electronics",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: baseUrl,
      title: "LML Electronics - Premium Device Repair Kits & Components",
      description: "Transform your device repairs with LML Electronics' premium repair kits and components. High-quality parts for phones, tablets, and laptops with expert support.",
      siteName: "LML Electronics",
      images: [
        {
          url: `${baseUrl}/images/lml_box.webp`,
          width: 1200,
          height: 630,
          alt: "LML Electronics Premium Repair Kits and Components",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "LML Electronics - Premium Device Repair Kits & Components",
      description: "Transform your device repairs with LML Electronics' premium repair kits and components. High-quality parts for phones, tablets, and laptops.",
      images: [`${baseUrl}/images/lml_box.webp`],
      creator: "@lmlelectronics",
      site: "@lmlelectronics",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
      yandex: "your-yandex-verification-code",
      yahoo: "your-yahoo-verification-code",
    },
  };
}

async function getHomePageData() {
  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      getInventoryItems(),
      getInventoryCategories(),
    ]);

    const visibleItems = productsResponse
      .map((item) => {
        const variations = item.variations.filter(
          (v) => v.visible && v.stockLevels.some((sl) => sl.stock > 0)
        );

        if (variations.length > 0 || item.isBundle) {
          // Always include bundles regardless of stock
          return { ...item, variations };
        }
        return null;
      })
      .filter((item) => item !== null);

    const products = visibleItems;
    const categories = categoriesResponse;

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
  const visibleProducts = products.filter(
    (p) =>
      p.isBundle === false &&
      Array.isArray(p.variations) &&
      p.variations.some((v) => v.visible === true) &&
      // Exclude products with a category named 'Tickets'
      !(
        Array.isArray(p.categories) &&
        p.categories.some((cat) => cat.name === "Tickets")
      )
  );

  return (
    <>
      <Script
        id="homepage-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "LML Electronics",
            "url": "https://lmlelectronics.com",
            "description": "Premium device repair kits and components for DIY electronics repair",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://lmlelectronics.com/shop?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "LML Electronics",
              "url": "https://lmlelectronics.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://lmlelectronics.com/logo.png"
              }
            }
          })
        }}
      />
      
      <Script
        id="homepage-organization-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "LML Electronics",
            "url": "https://lmlelectronics.com",
            "logo": "https://lmlelectronics.com/logo.png",
            "description": "Premium device repair kits and components for DIY electronics repair",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "support@lmlelectronics.com"
            },
            "sameAs": [
              "https://twitter.com/lmlelectronics",
              "https://facebook.com/lmlelectronics"
            ]
          })
        }}
      />

      <Script
        id="homepage-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What types of device repair kits does LML Electronics offer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "LML Electronics offers comprehensive repair kits for phones, tablets, and laptops including screen replacements, battery replacements, and complete repair tool sets for Apple, Samsung, Google, and other popular devices."
                }
              },
              {
                "@type": "Question",
                "name": "Are LML Electronics repair parts genuine and high-quality?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all our repair parts are genuine, high-quality components that meet or exceed OEM standards. We offer a 30-day warranty on all products and provide expert support for all repairs."
                }
              },
              {
                "@type": "Question",
                "name": "How long does shipping take for repair kits?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Standard shipping typically takes 3-5 business days within the continental US. We also offer expedited shipping options for faster delivery. International shipping times vary by location."
                }
              }
            ]
          })
        }}
      />

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
                  href="/shop"
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
          <ProductCarousel products={visibleProducts as Product[]} />
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
            {categories
              .filter(
                (category) =>
                  category.visible === true &&
                  category.parentId == null &&
                  category.name !== "Tickets"
              )
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/shop/category/${category.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="block"
                >
                  <div className="bg-white rounded-[20px] p-0 flex flex-col h-full hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-center bg-[#f5f6fa] rounded-[20px] h-[150px] w-full mt-0 mb-0 overflow-hidden">
                      <Image
                        src={
                          category.image || "/images/product-placeholder.jpg"
                        }
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

      {/* End of Season Sale Banner */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <ProductsHeroBanner
            label="Limited Time"
            headline="End of Season Sale"
            bigWord="SAVE"
            buttonText="Shop Deals"
            buttonHref="/shop"
            imageSrc="/images/lml_box.webp"
            imageAlt="Product"
            descriptionLabel="Special Offer"
            description="Up to 30% off select items."
            small
          />
        </div>
      </section>

      {/* Extra Savings Promo Banner */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {(() => {
            const today = new Date();
            const end = new Date();
            end.setDate(today.getDate() + 14);
            const format = (d: Date) =>
              d.toLocaleString("en-US", { month: "short", day: "numeric" });
            const dateRange = `${format(today)} to ${format(end)}`;
            return (
              <ProductsPromoBanner
                leftLabel="Limited Time Offer"
                leftBigText={`EXTRA\nSAVINGS`}
                leftSubLabel={dateRange}
                rightLabel="LML Electronics"
                rightHeadline="Shop & Save Today!"
                rightSubheadline="Discover deals on phones, parts, and accessories."
                buttonText="Shop Now"
                buttonHref="/shop"
                imageSrc="/images/lml_box.webp"
                imageAlt="Product"
              />
            );
          })()}
        </div>
      </section>
    </main>
    </>
  );
}
