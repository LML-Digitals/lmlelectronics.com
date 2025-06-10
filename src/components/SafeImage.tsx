"use client";

import { useState } from "react";
import Image from "next/image";

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  showPlaceholder?: boolean;
}

export function SafeImage({
  src,
  alt,
  className,
  fill = false,
  sizes,
  priority = false,
  width,
  height,
  fallbackSrc = "/placeholder-product.svg",
  showPlaceholder = true,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Show placeholder immediately if no src and placeholder is enabled
  if ((!src || src.trim() === "") && showPlaceholder) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="text-4xl mb-2">📱</div>
          <div className="text-sm font-medium">Product Image</div>
        </div>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 300}
      height={height || 300}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
    />
  );
}
