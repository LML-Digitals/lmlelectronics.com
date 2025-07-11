"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  name: string;
  href: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  breadcrumbs?: Breadcrumb[];
}

const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  backgroundImage,
  breadcrumbs,
}) => {
  const words = title.split(" ");

  return (
    <div className="bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Content */}
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-2 text-sm text-gray-700 mb-4"
              >
                <Link
                  href="/"
                  className="hover:text-gray-900 transition-colors duration-200"
                >
                  Home
                </Link>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                    <Link
                      href={crumb.href}
                      className="hover:text-gray-900 transition-colors duration-200"
                    >
                      {crumb.name}
                    </Link>
                  </React.Fragment>
                ))}
              </motion.div>
            )}

            {/* Title */}
            <div className="mb-4">
              {words.map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mr-4"
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-4 text-lg text-gray-700 leading-relaxed max-w-xl"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Right Column - Image */}
          <div className="relative h-full w-full min-h-[200px] md:min-h-[250px] lg:min-h-[300px]">
            {backgroundImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative h-full w-full"
              >
                <Image
                  src={backgroundImage}
                  alt="Hero image"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHero;
