"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

export type Product = {
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  // Make price and sku optional to handle different product data structures
  price?: number;
  sellingPrice?: number;
  sku?: string;
  shipping?: number;
  tax?: number;
  discountPercentage?: number;
  // For inventory item variations
  variations?: any[];
  // For related products that might have different structure
  [key: string]: any;
};

type ProductCarouselProps = {
  products: Product[];
  title?: string;
  autoplay?: boolean;
  autoplaySpeed?: number;
};

export default function ProductCarousel({
  products,
  title = "You may also like",
  autoplay = true,
  autoplaySpeed = 3000,
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemsToShow, setItemsToShow] = useState(4);

  // Determine number of items to show based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(1);
      } else if (window.innerWidth < 768) {
        setItemsToShow(2);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(3);
      } else {
        setItemsToShow(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || isPaused || products.length <= itemsToShow) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === products.length - itemsToShow ? 0 : prevIndex + 1
      );
    }, autoplaySpeed);

    return () => clearInterval(interval);
  }, [autoplay, isPaused, products.length, itemsToShow, autoplaySpeed]);

  const handleNext = () => {
    if (currentIndex < products.length - itemsToShow) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to beginning
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(products.length - itemsToShow); // Loop to end
    }
  };

  if (!products.length) return null;

  const getProductUrl = (product: Product) => {
    // If it has variations, it's a main product
    if (product.variations && product.variations.length > 0) {
      return `/shop/${product.id}`;
    }
    // Otherwise it's likely a variation
    return `/shop/${product.id}`;
  };

  return (
    <div className="w-full py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            onClick={handlePrev}
            variant="outline"
            size="icon"
            className="rounded-full border-secondary hover:bg-secondary hover:text-white"
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            onClick={handleNext}
            variant="outline"
            size="icon"
            className="rounded-full border-secondary hover:bg-secondary hover:text-white"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      <div
        className="overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        ref={containerRef}
      >
        <motion.div
          className="flex"
          initial={{ x: 0 }}
          animate={{ x: -currentIndex * (100 / itemsToShow) + "%" }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="px-2"
              style={{ width: `${100 / itemsToShow}%`, flexShrink: 0 }}
            >
              <Link href={getProductUrl(product)} className="block">
                <div className="bg-white rounded-[20px] p-0 flex flex-col h-full">
                  <div className="flex items-center justify-center bg-[#f5f6fa] rounded-[20px] h-[150px] w-full mt-0 mb-0 overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={120}
                      height={120}
                      className="object-contain max-h-[120px] max-w-[90%]"
                    />
                  </div>
                  <div className="w-full">
                    <div className="px-4 pt-2">
                      <h3 className="text-[#3b5b7c] text-base font-normal text-left truncate hover:underline cursor-pointer capitalize">
                        {product.name}
                      </h3>
                    </div>
                    {(product.sellingPrice || product.price) && (
                      <div className="px-4 pb-3 pt-0">
                        <p className="text-[#e53935] font-bold text-lg text-left">
                          $
                          {Math.round(
                            product.sellingPrice || product.price || 0
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
