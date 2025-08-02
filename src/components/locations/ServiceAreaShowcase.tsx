"use client";

import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

interface ServiceArea {
  slug: string;
  name: string;
  description: string;
  nearbyLandmarks: string[];
}

interface ServiceAreaShowcaseProps {
  serviceAreas: ServiceArea[];
  showAll?: boolean;
  maxItems?: number;
}

export default function ServiceAreaShowcase({ 
  serviceAreas, 
  showAll = false, 
  maxItems = 6 
}: ServiceAreaShowcaseProps) {
  const displayAreas = showAll ? serviceAreas : serviceAreas.slice(0, maxItems);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAreas.map((area) => (
          <Link
            key={area.slug}
            href={`/locations/service-areas/${area.slug}`}
            className="group block"
          >
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all duration-300 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {area.name}
                  </h3>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {area.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {area.nearbyLandmarks.slice(0, 2).map((landmark, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {landmark}
                  </span>
                ))}
                {area.nearbyLandmarks.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    +{area.nearbyLandmarks.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {!showAll && serviceAreas.length > maxItems && (
        <div className="text-center mt-8">
          <Link
            href="/locations/service-areas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            View All Service Areas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
} 