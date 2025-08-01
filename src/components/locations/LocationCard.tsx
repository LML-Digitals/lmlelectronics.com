'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StoreLocation } from '@prisma/client';

interface LocationCardProps {
  location: StoreLocation;
}

export default function LocationCard({ location }: LocationCardProps) {
  const images = location.images as string[];
  const mainImage = images && images.length > 0 ? images[0] : '/logo.png';

  return (
    <Link
      href={`/locations/${location.slug}`}
      className="group relative p-6 flex flex-col overflow-hidden rounded-lg border bg-[#f2f2f2] hover:bg-[#e5e5e5] transition-colors"
    >

      <div className="relative h-48 w-full mb-4 overflow-hidden rounded-lg">
        <Image
          src={mainImage}
          alt={`${location.name} Store`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>

      <h2 className="text-2xl font-bold text-center">{location.name}</h2>
    </Link>
  );
}
