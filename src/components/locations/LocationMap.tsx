"use client";

import { StoreLocation } from "@prisma/client";

interface LocationMapProps {
  locations?: StoreLocation[];
  address?: string;
  className?: string;
}

export default function LocationMap({
  locations,
  address,
  className = "",
}: LocationMapProps) {
  // If address is provided directly, use it, otherwise use location's address
  const mapAddress = address || (locations && locations[0]?.address);

  if (!mapAddress) {
    return null;
  }

  const encodedAddress = encodeURIComponent(mapAddress);
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  

  return (
    <div
      className={`w-full h-[400px] rounded-lg shadow-lg overflow-hidden ${className}`}
      style={{ border: "2px solid rgba(227, 222, 30, 0.2)" }}
    >
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
