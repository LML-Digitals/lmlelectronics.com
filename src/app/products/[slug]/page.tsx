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
                  <p className="text-xs text-gray-600">Fast Delivery</p>
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

              </div>


              {/* Add to Cart */}
              <div className="space-y-4">
                <AddToCartButton product={product} />
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
