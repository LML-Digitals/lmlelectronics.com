"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function ProductsHeroBanner({
  label = "Beats solo air",
  headline = "Summer sale",
  bigWord = "FINE",
  buttonText = "Shop Now",
  buttonHref = "/shop",
  imageSrc = "/window.svg",
  imageAlt = "Product",
  descriptionLabel = "Description",
  description = "best headphones on the market",
  small = false,
}: {
  label?: string;
  headline?: string;
  bigWord?: string;
  buttonText?: string;
  buttonHref?: string;
  imageSrc?: string;
  imageAlt?: string;
  descriptionLabel?: string;
  description?: string;
  small?: boolean;
}) {
  return (
    <section
      className={`w-full bg-[#e5e5e5] rounded-2xl ${small ? "p-4 md:p-6" : "p-8 md:p-12"} flex flex-col md:flex-row items-center gap-8 mt-6 mb-10 max-w-5xl mx-auto px-4`}
    >
      {/* Left: Text and Button */}
      <div className="flex-1 flex flex-col justify-center items-start min-w-[200px] px-4">
        <span className={`text-sm text-black mb-1 ${small ? "" : "md:text-base mb-2"}`}>{label}</span>
        <h1 className={`${small ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"} font-extrabold text-black mb-1 leading-tight`}>{headline}</h1>
        <div className={`${small ? "text-3xl md:text-5xl" : "text-[64px] md:text-[96px]"} font-extrabold text-white leading-none mb-4`}>{bigWord}</div>
        <Link href={buttonHref}>
          <button className={`bg-black text-white px-5 py-2 rounded-xl font-semibold ${small ? "text-base" : "text-lg"} shadow hover:bg-gray-800 transition`}>
            {buttonText}
          </button>
        </Link>
      </div>
      {/* Right: Image and Description */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
        <div className="flex items-center justify-center w-full">
          <div className={`bg-[#f5f6fa] rounded-2xl flex items-center justify-center ${small ? "h-[120px] w-[120px] md:h-[160px] md:w-[160px]" : "h-[260px] w-[260px] md:h-[320px] md:w-[320px]"} shadow-lg`}>
            <Image
              src="/images/lml_box.webp"
              alt={imageAlt}
              width={small ? 80 : 220}
              height={small ? 80 : 220}
              className="object-contain drop-shadow-xl"
              priority
            />
          </div>
        </div>
        <div className="mt-4 text-center w-full">
          <div className="font-bold text-[#3b5b7c] text-base mb-1">{descriptionLabel}</div>
          <div className="text-gray-600 text-sm">{description}</div>
        </div>
      </div>
    </section>
  );
}

// New: ProductsPromoBanner
export function ProductsPromoBanner({
  leftLabel = "Limited Time Offer",
  leftBigText = "EXTRA\nSAVINGS",
  leftSubLabel = "",
  rightLabel = "LML Repair",
  rightHeadline = "Shop & Save Today!",
  rightSubheadline = "Discover deals on phones, parts, and accessories.",
  buttonText = "Shop Now",
  buttonHref = "/shop",
  imageSrc = "/window.svg",
  imageAlt = "Product",
}: {
  leftLabel?: string;
  leftBigText?: string;
  leftSubLabel?: string;
  rightLabel?: string;
  rightHeadline?: string;
  rightSubheadline?: string;
  buttonText?: string;
  buttonHref?: string;
  imageSrc?: string;
  imageAlt?: string;
}) {
  return (
    <section
      className="w-full rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 mt-10 mb-10 max-w-6xl mx-auto px-6 py-8 md:py-12"
      style={{ backgroundColor: "#FDF200" }}
    >
      {/* Left: Discount and Big Text */}
      <div className="flex-1 flex flex-col justify-center items-start min-w-[200px] px-2 md:px-6">
        <span className="text-black text-base mb-2 font-medium">
          {leftLabel}
        </span>
        <div className="whitespace-pre-line text-5xl md:text-6xl font-extrabold text-black mb-2 leading-tight">
          {leftBigText}
        </div>
        <span className="text-black text-base mt-2 font-medium">
          {leftSubLabel}
        </span>
      </div>
      {/* Center: Product Image */}
      <div className="flex-shrink-0 flex items-center justify-center relative z-10">
        <div className="bg-transparent flex items-center justify-center h-[180px] w-[180px] md:h-[260px] md:w-[260px]">
          <Image
            src="/images/lml_box.webp"
            alt={imageAlt}
            width={220}
            height={220}
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>
      {/* Right: Headline, Subheadline, Button */}
      <div className="flex-1 flex flex-col justify-center items-end min-w-[200px] px-2 md:px-6 text-right">
        <span className="text-black text-base mb-2 font-medium">
          {rightLabel}
        </span>
        <div className="text-4xl md:text-5xl font-extrabold text-black mb-2 leading-tight">
          {rightHeadline}
        </div>
        <div className="text-black text-lg mb-4">{rightSubheadline}</div>
        <Link href={buttonHref}>
          <button className="bg-black text-white px-6 py-2 rounded-xl font-semibold text-lg shadow transition hover:bg-gray-800">
            {buttonText}
          </button>
        </Link>
      </div>
    </section>
  );
} 