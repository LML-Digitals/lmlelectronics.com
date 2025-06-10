"use client";

import Link from "next/link";
import Image from "next/image";
import { Product, formatPrice, createSlug } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const primaryVariation = product.variations?.[0];
          const price = primaryVariation?.price;
          const compareAtPrice = primaryVariation?.compareAtPrice;
          const isOnSale = compareAtPrice && price && compareAtPrice > price;
          const slug = createSlug(product.name);

          return (
            <Link key={product.id} href={`/products/${slug}`}>
              <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    <Image
                      src={
                        product.images?.[0]?.url || "/placeholder-product.svg"
                      }
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {isOnSale && (
                      <Badge
                        variant="destructive"
                        className="absolute top-2 left-2"
                      >
                        Sale
                      </Badge>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        {price && (
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">
                              {formatPrice(price)}
                            </span>
                            {isOnSale && compareAtPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(compareAtPrice)}
                              </span>
                            )}
                          </div>
                        )}
                        {isOnSale && price && compareAtPrice && (
                          <p className="text-xs text-green-600">
                            Save{" "}
                            {Math.round(
                              ((compareAtPrice - price) / compareAtPrice) * 100
                            )}
                            %
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
