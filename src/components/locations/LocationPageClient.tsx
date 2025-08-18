'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  Facebook,
  Instagram,
  Twitter,
  X,
  Linkedin,
  Youtube,
  Globe,
  ExternalLink,
} from 'lucide-react';
import LocationMap from '@/components/locations/LocationMap';
import { StoreLocation } from '@prisma/client';
import { isStoreOpen } from '@/components/locations/LocationsList';
import {
  DayHours,
  SocialMediaLink,
  Listing,
} from '@/components/locations/types/types';
import { getStoreLocationBySlug } from '@/components/locations/services/storeLocationCrud';
import PageHero from '@/components/common/page-hero/pageHero';

// Map of weekdays to their full names for display
const WEEKDAYS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

// Function to get video IDs for each location
const getLocationVideos = (slug: string) => {
  const videoMap: { [key: string]: { video1: string; video2: string } } = {
    'west-seattle': {
      video1: 'n4lrH8b96ro',
      video2: 'AfM5QtP4zwI',
    },
    'seattle': {
      video1: 'LyjQmhKEjZk',
      video2: 'VO9txVGPtGA',
    },
    'north-seattle': {
      video1: 'ZnzEfETMwPw',
      video2: 'kvtHp1q9LNQ',
    },
  };

  return videoMap[slug] || null;
};

// Function to get the icon for a social media platform
const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
  case 'facebook':
    return <Facebook className="w-5 h-5 text-secondary" />;
  case 'instagram':
    return <Instagram className="w-5 h-5 text-secondary" />;
  case 'twitter':
  case 'x':
    return <Twitter className="w-5 h-5 text-secondary" />;
  case 'linkedin':
    return <Linkedin className="w-5 h-5 text-secondary" />;
  case 'youtube':
    return <Youtube className="w-5 h-5 text-secondary" />;
  default:
    return <Globe className="w-5 h-5 text-secondary" />;
  }
};

interface LocationPageClientProps {
  initialLocation: StoreLocation | null;
}

export default function LocationPageClient ({
  initialLocation,
}: LocationPageClientProps) {
  const params = useParams();
  const [location, setLocation] = useState<StoreLocation | null>(initialLocation);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // If we don't have initial location, try to fetch it
        if (!initialLocation) {
          setIsLoading(true);
          if (!params?.slug) {
            setError('Invalid location URL');

            return;
          }

          const slug = Array.isArray(params.slug)
            ? params.slug.join('/')
            : params.slug;

          const data = await getStoreLocationBySlug(slug);

          if (!data.isActive) {
            setError('This location is currently not active.');
            setLocation(null);
          } else {
            setLocation(data);
          }
        } else if (!initialLocation.isActive) {
          setError('This location is currently not active.');
          setLocation(null);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load location. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params, initialLocation]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[600px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Location Not Found</h1>
        <p className="mb-8 text-gray-600">
          {error || "The location you're looking for doesn't exist."}
        </p>
        <Link
          href="/locations"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="w-4 h-4" />
            View All Locations
        </Link>
      </div>
    );
  }

  // Process location data
  const today = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();

  const hours = (() => {
    try {
      return typeof location.hours === 'string'
        ? JSON.parse(location.hours)
        : location.hours || {};
    } catch (e) {
      console.error('Error parsing hours:', e);

      return {};
    }
  })();

  const isOpen = isStoreOpen(hours);

  const socialMedia = (() => {
    try {
      const data
        = typeof location.socialMedia === 'string'
          ? JSON.parse(location.socialMedia)
          : location.socialMedia;

      return Array.isArray(data) ? (data as SocialMediaLink[]) : [];
    } catch (e) {
      console.error('Error parsing social media:', e);

      return [];
    }
  })();

  const images = (() => {
    try {
      if (Array.isArray(location.images)) {
        return location.images.map((img) => String(img));
      }

      if (typeof location.images === 'string') {
        const parsed = JSON.parse(location.images);

        return Array.isArray(parsed) ? parsed.map(String) : [];
      }

      return [];
    } catch (e) {
      console.error('Error parsing images:', e);

      return [];
    }
  })();

  const fullAddress = [
    location.streetAddress || location.address,
    location.city,
    location.state,
    location.zip,
    location.countryCode,
  ]
    .filter(Boolean)
    .join(', ');

  // Helper function to convert military time to 12-hour format
  const convertTo12Hour = (time: string): string => {
    if (!time) { return ''; }

    // Handle different time formats
    let timeStr = time.toString().toLowerCase();

    // Remove any existing AM/PM
    timeStr = timeStr.replace(/\s*(am|pm)/i, '');

    // Check if it's already in 12-hour format
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);

      if (hour >= 12) {
        const displayHour = hour === 12 ? 12 : hour - 12;

        return `${displayHour}:${minutes} PM`;
      } else {
        const displayHour = hour === 0 ? 12 : hour;

        return `${displayHour}:${minutes} AM`;
      }
    }

    return time; // Return as-is if we can't parse it
  };

  // Helper function to format hours
  const formatHours = (day: string) => {
    if (!hours[day]) { return 'Closed'; }
    if (hours[day].isClosed) { return 'Closed'; }
    const openTime = convertTo12Hour(hours[day].open);
    const closeTime = convertTo12Hour(hours[day].close);

    return `${openTime} - ${closeTime}`;
  };

  return (
    <main className="mt-2">
      {/* Hero Section */}
      <div className="flex flex-col gap-1 text-center mb-5 p-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-secondary animate-pulse">
          {location.name}
        </h1>
        <p className="text-center text-lg mb-12 max-w-2xl mx-auto">
          {/* {location.description} */}
          {fullAddress}
        </p>
      </div>
      <PageHero
        title={location.name}
        description={`Professional device repair services at ${fullAddress}. Open ${formatHours(today)}.`}
        image="/repair5.png"
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {location.description && (
              <section className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">
                      About This Location
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {location.description}
                </p>
              </section>
            )}

            {/* Photos */}
            {images.length > 0 && (
              <section className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`${location.name} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Map */}
            <section className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Map & Directions</h2>
              <div className="h-[300px] w-full mb-4 rounded-lg overflow-hidden">
                <LocationMap locations={[location]} />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium mb-1">{location.name}</p>
                  <p className="text-gray-600 text-sm">{fullAddress}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent hover:bg-accent/80 text-black py-2 px-4 rounded-md transition-colors duration-200 inline-flex items-center text-sm"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                      Get Directions
                </a>
              </div>
            </section>

            {/* YouTube Videos */}
            <section className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">How to Find Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  const videos = getLocationVideos(params.slug as string);

                  if (!videos) { return null; }

                  return (
                    <>
                      <div className="aspect-video">
                        <iframe
                          className="w-full h-full rounded-lg"
                          src={`https://www.youtube.com/embed/${videos.video1}`}
                          title="Directions to Location - Part 1"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <div className="aspect-video">
                        <iframe
                          className="w-full h-full rounded-lg"
                          src={`https://www.youtube.com/embed/${videos.video2}`}
                          title="Directions to Location - Part 2"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </section>
          </div>

          {/* Right column - Contact and hours */}
          <div className="space-y-6">
            {/* Contact info card */}
            <section className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">
                    Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a
                      href={`tel:${location.phone}`}
                      className="font-medium hover:text-secondary transition-colors"
                    >
                      {location.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a
                      href={`mailto:${location.email}`}
                      className="font-medium hover:text-secondary transition-colors"
                    >
                      {location.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-secondary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{fullAddress}</p>
                  </div>
                </div>
              </div>

              {/* Social media links */}
              {socialMedia.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">
                        Follow Us
                  </h3>
                  <div className="flex gap-3">
                    {socialMedia.map((social, index) => (
                      <a
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        aria-label={social.platform}
                      >
                        {/* {getSocialIcon(social.platform)} */}
                        <Image
                          src={social.icon}
                          alt={social.platform}
                          width={24}
                          height={24}
                          className="w-5 h-5"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Hours card */}
            <section className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Hours of Operation</h2>
                <span
                  className={`py-1 px-2 rounded-full text-xs font-medium inline-flex items-center 
                        ${
    isOpen
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
    }`}
                >
                  {isOpen ? 'Open Now' : 'Closed'}
                </span>
              </div>

              <div className="space-y-2">
                {Object.entries(WEEKDAYS).map(([day, label]) => (
                  <div
                    key={day}
                    className={`flex justify-between ${
                      day === today ? 'font-medium' : ''
                    }`}
                  >
                    <span className="text-gray-700">{label}</span>
                    <span className={day === today ? 'text-secondary' : ''}>
                      {formatHours(day)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Entrance Instructions */}
            <section className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">
                    Entrance Instructions
              </h2>

              {/* Entrance steps */}
              {location.entranceSteps && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold mb-3">
                        How to Find Us
                  </h3>
                  <div className="space-y-3">
                    {location.entranceSteps
                      .split(/[.,;]/)
                      .map((step) => step.trim())
                      .filter(step => step.length > 5) // Filter out very short fragments
                      .map((cleanStep, index) => (
                        <div key={index} className="flex items-start">
                          <span
                            className="flex-shrink-0 w-5 h-5 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5"
                          >
                            {index + 1}
                          </span>
                          <span className="text-gray-700 flex-1 leading-relaxed text-sm">
                            {cleanStep.charAt(0).toUpperCase() + cleanStep.slice(1)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Listings */}
              {location.listings && (() => {
                try {
                  const listingsData = typeof location.listings === 'string'
                    ? JSON.parse(location.listings)
                    : location.listings;

                  if (Array.isArray(listingsData) && listingsData.length > 0) {
                    return (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-md font-semibold mb-3">
                              Find Us On
                        </h3>
                        <div className="space-y-3">
                          {listingsData.map((listing: Listing, index: number) => (
                            <a
                              key={index}
                              href={listing.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Image
                                src={listing.icon}
                                alt={listing.name}
                                width={24}
                                height={24}
                                className="w-6 h-6"
                              />
                              <span className="text-gray-700 font-medium text-sm">
                                {listing.name}
                              </span>
                              <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  }
                } catch (e) {
                  console.error('Error parsing listings:', e);
                }

                return null;
              })()}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
