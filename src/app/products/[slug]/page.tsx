import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  CheckCircle,
  Info,
  Users,
  Package,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { getProductBySlug, getRelatedProducts } from "@/lib/square/products";
import { formatPrice, ProductImage } from "@/types/product";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { RelatedProducts } from "@/components/RelatedProducts";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const product = await getProductBySlug(resolvedParams.slug);

    if (!product) {
      return {
        title: "Product Not Found - LML Electronics",
        description: "The requested product could not be found.",
      };
    }

    return {
      title: `${product.name} - LML Electronics`,
      description:
        product.description ||
        `Shop ${product.name} at LML Electronics. High-quality electronics and components.`,
      openGraph: {
        title: product.name,
        description: product.description || "",
        images:
          product.images?.map((img: ProductImage) => ({
            url: img.url,
            width: 800,
            height: 600,
            alt: product.name,
          })) || [],
        type: "website",
      },
    };
  } catch {
    return {
      title: "Product - LML Electronics",
      description: "Shop electronics and components at LML Electronics.",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const resolvedParams = await params;
    const product = await getProductBySlug(resolvedParams.slug);

    if (!product) {
      notFound();
    }

    // Get related products using the product ID
    const relatedProducts = await getRelatedProducts(product.id, 4);

    const primaryVariation = product.variations?.[0];
    const price = primaryVariation?.price;
    const compareAtPrice = primaryVariation?.compareAtPrice;
    const isOnSale = compareAtPrice && price && compareAtPrice > price;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8 bg-white rounded-lg p-4 shadow-sm">
            <Link
              href="/"
              className="hover:text-yellow-600 transition-colors font-medium"
            >
              Home
            </Link>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <Link
              href="/products"
              className="hover:text-yellow-600 transition-colors font-medium"
            >
              Products
            </Link>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div className="space-y-6">
              <ProductGallery
                images={product.images || []}
                productName={product.name}
              />

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-xl border-2 hover:shadow-md transition-shadow">
                  <Shield className="w-8 h-8 mx-auto text-green-600 mb-3" />
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Authentic Parts
                  </p>
                  <p className="text-xs text-gray-600">Guaranteed genuine</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl border-2 hover:shadow-md transition-shadow">
                  <Truck className="w-8 h-8 mx-auto text-blue-600 mb-3" />
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Fast Shipping
                  </p>
                  <p className="text-xs text-gray-600">Free over $50</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl border-2 hover:shadow-md transition-shadow">
                  <RotateCcw className="w-8 h-8 mx-auto text-purple-600 mb-3" />
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Easy Returns
                  </p>
                  <p className="text-xs text-gray-600">30 day policy</p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                {product.category && (
                  <div className="mb-4">
                    <Link
                      href={`/products?category=${product.category.id}`}
                      className="text-sm text-yellow-600 hover:text-yellow-800 font-semibold bg-yellow-50 px-3 py-1 rounded-full"
                    >
                      {product.category.name}
                    </Link>
                  </div>
                )}

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  {product.name}
                </h1>

                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < 4
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      4.8 (124 reviews)
                    </span>
                  </div>

                  {product.inStock ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="px-3 py-1">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price */}
              <div
                className="bg-white p-6 rounded-xl shadow-sm border-2"
                style={{ borderColor: "#FDF200" }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  {price && (
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(price)}
                    </span>
                  )}
                  {isOnSale && compareAtPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(compareAtPrice)}
                    </span>
                  )}
                  {isOnSale && (
                    <Badge className="text-white bg-red-500 hover:bg-red-500 px-3 py-1">
                      Save{" "}
                      {Math.round(
                        ((compareAtPrice! - price!) / compareAtPrice!) * 100
                      )}
                      %
                    </Badge>
                  )}
                </div>

                {isOnSale && price && compareAtPrice && (
                  <p className="text-lg text-green-600 font-semibold mb-4">
                    You save {formatPrice(compareAtPrice - price)}!
                  </p>
                )}

                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: "#FDF200" }}
                >
                  <div className="flex items-center text-sm font-semibold text-black">
                    <Info className="w-5 h-5 mr-2" />
                    <span>
                      Free shipping on orders over $50 • 30-day money-back
                      guarantee
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              {product.description && (
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    What's Included
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-700 mb-6">
                    <p>{product.description}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-medium">
                        Professional-grade repair tools
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-medium">
                        Step-by-step repair guide included
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-medium">
                        Compatible with multiple device models
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <div className="space-y-4">
                <AddToCartButton product={product} />
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-4 text-lg">
                  Delivery Information
                </h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 mr-3 text-gray-600" />
                    <span>Usually ships within 1-2 business days</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 mr-3 text-gray-600" />
                    <span>Standard delivery: 3-5 business days</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-3 text-gray-600" />
                    <span>Express delivery: 1-2 business days (+$9.99)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-1 h-14">
                <TabsTrigger
                  value="description"
                  className="rounded-lg h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="specifications"
                  className="rounded-lg h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Specifications
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-lg h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Reviews (124)
                </TabsTrigger>
                <TabsTrigger
                  value="guides"
                  className="rounded-lg h-12 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Repair Guides
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="p-8">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Product Description
                    </h3>
                    <div className="prose max-w-none text-gray-700">
                      <p className="text-lg mb-6">
                        {product.description ||
                          "This high-quality repair kit contains everything you need to fix your device. Each component has been carefully selected and tested to ensure reliable performance and long-lasting results."}
                      </p>

                      <h4 className="text-xl font-bold mt-8 mb-4">
                        Features & Benefits
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                            <span>
                              Premium quality components with 1-year warranty
                            </span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                            <span>Compatible with multiple device models</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                            <span>Professional-grade tools included</span>
                          </li>
                        </ul>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                            <span>Detailed step-by-step instructions</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                            <span>Video tutorials available online</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                            <span>Expert technical support included</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-xl font-bold mb-6">Product Details</h4>
                    <dl className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <dt className="text-gray-600 font-semibold">SKU:</dt>
                        <dd className="text-gray-900 font-medium">
                          {product.id}
                        </dd>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <dt className="text-gray-600 font-semibold">
                          Category:
                        </dt>
                        <dd className="text-gray-900 font-medium">
                          {product.category?.name || "Electronics"}
                        </dd>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <dt className="text-gray-600 font-semibold">Brand:</dt>
                        <dd className="text-gray-900 font-medium">
                          LML Electronics
                        </dd>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <dt className="text-gray-600 font-semibold">
                          Warranty:
                        </dt>
                        <dd className="text-gray-900 font-medium">
                          1 Year Limited
                        </dd>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-200">
                        <dt className="text-gray-600 font-semibold">Weight:</dt>
                        <dd className="text-gray-900 font-medium">0.5 lbs</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold mb-6">Compatibility</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-semibold text-gray-900 mb-2">
                          Compatible Devices:
                        </p>
                        <p className="text-gray-700">
                          iPhone 12, iPhone 12 Pro, iPhone 12 Pro Max, iPhone 12
                          Mini
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-semibold text-gray-900 mb-2">
                          Tools Included:
                        </p>
                        <p className="text-gray-700">
                          Precision screwdrivers, spudger tools, suction cup,
                          prying tools
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-semibold text-gray-900 mb-2">
                          Difficulty Level:
                        </p>
                        <p className="text-gray-700">
                          Intermediate (45-60 minutes)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-8">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                      <div className="text-center p-8 bg-gray-50 rounded-2xl">
                        <div className="text-5xl font-bold text-gray-900 mb-3">
                          4.8
                        </div>
                        <div className="flex justify-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-6 h-6 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 font-medium">
                          Based on 124 reviews
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div
                          key={rating}
                          className="flex items-center space-x-4"
                        >
                          <span className="text-sm font-semibold w-8">
                            {rating}★
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className="h-3 rounded-full"
                              style={{
                                backgroundColor: "#FDF200",
                                width:
                                  rating === 5
                                    ? "75%"
                                    : rating === 4
                                    ? "20%"
                                    : "5%",
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 font-medium">
                            {rating === 5 ? "93" : rating === 4 ? "25" : "6"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-8">
                    <h4 className="text-xl font-bold">Customer Reviews</h4>

                    {[
                      {
                        name: "Sarah M.",
                        rating: 5,
                        date: "2 days ago",
                        review:
                          "Excellent quality repair kit! The instructions were clear and I was able to fix my iPhone screen in about an hour. Highly recommended!",
                        verified: true,
                      },
                      {
                        name: "Mike L.",
                        rating: 5,
                        date: "1 week ago",
                        review:
                          "Great value for money. All tools included and the replacement part works perfectly. Customer service was also very helpful.",
                        verified: true,
                      },
                      {
                        name: "Jessica R.",
                        rating: 4,
                        date: "2 weeks ago",
                        review:
                          "Good quality kit, though the repair took me a bit longer than expected. The video guide was very helpful.",
                        verified: true,
                      },
                    ].map((review, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-100 pb-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div
                              className="w-12 h-12 text-black rounded-full flex items-center justify-center font-bold text-lg shadow-sm"
                              style={{ backgroundColor: "#FDF200" }}
                            >
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.name}
                              </p>
                              <div className="flex items-center space-x-3">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.verified && (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                                    Verified Purchase
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">
                            {review.date}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {review.review}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="guides" className="p-8">
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Repair Guides & Resources
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border-2 rounded-xl hover:bg-gray-50 transition-colors hover:shadow-md">
                      <h4 className="font-bold text-gray-900 mb-3 text-lg">
                        📱 Screen Replacement Guide
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Step-by-step instructions for replacing your device
                        screen safely.
                      </p>
                      <Button
                        variant="outline"
                        className="hover:bg-yellow-50 hover:border-yellow-400"
                      >
                        View Guide
                      </Button>
                    </div>

                    <div className="p-6 border-2 rounded-xl hover:bg-gray-50 transition-colors hover:shadow-md">
                      <h4 className="font-bold text-gray-900 mb-3 text-lg">
                        🎥 Video Tutorial
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Watch our expert technician perform the complete repair.
                      </p>
                      <Button
                        variant="outline"
                        className="hover:bg-yellow-50 hover:border-yellow-400"
                      >
                        Watch Video
                      </Button>
                    </div>

                    <div className="p-6 border-2 rounded-xl hover:bg-gray-50 transition-colors hover:shadow-md">
                      <h4 className="font-bold text-gray-900 mb-3 text-lg">
                        🔧 Tool Guide
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Learn about each tool included in your repair kit.
                      </p>
                      <Button
                        variant="outline"
                        className="hover:bg-yellow-50 hover:border-yellow-400"
                      >
                        Learn More
                      </Button>
                    </div>

                    <div className="p-6 border-2 rounded-xl hover:bg-gray-50 transition-colors hover:shadow-md">
                      <h4 className="font-bold text-gray-900 mb-3 text-lg">
                        💬 Get Help
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Need assistance? Chat with our repair experts.
                      </p>
                      <Button
                        variant="outline"
                        className="hover:bg-yellow-50 hover:border-yellow-400"
                      >
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div> */}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <RelatedProducts products={relatedProducts} />
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading product:", error);
    notFound();
  }
}
