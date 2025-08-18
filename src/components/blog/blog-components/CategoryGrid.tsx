'use client';
import { useState, useEffect, JSX } from 'react';
import Link from 'next/link';
import { BlogCategory } from '@prisma/client';
import { getBlogCategories } from '@/components/blog/services/blogCategoryCrud';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wrench,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Headphones,
  Camera,
  Gamepad2,
  Settings,
  Shield,
  Zap,
  BookOpen,
  Lightbulb,
  Cog,
} from 'lucide-react';

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter (word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Icon mapping for different categories
const categoryIcons: Record<string, JSX.Element> = {
  repair: <Wrench className="h-6 w-6" />,
  smartphone: <Smartphone className="h-6 w-6" />,
  computer: <Monitor className="h-6 w-6" />,
  tablet: <Tablet className="h-6 w-6" />,
  laptop: <Laptop className="h-6 w-6" />,
  audio: <Headphones className="h-6 w-6" />,
  camera: <Camera className="h-6 w-6" />,
  gaming: <Gamepad2 className="h-6 w-6" />,
  service: <Settings className="h-6 w-6" />,
  security: <Shield className="h-6 w-6" />,
  tips: <Lightbulb className="h-6 w-6" />,
  guide: <BookOpen className="h-6 w-6" />,
  tutorial: <Wrench className="h-6 w-6" />,
  tech: <Zap className="h-6 w-6" />,
  maintenance: <Cog className="h-6 w-6" />,
};

// Color mapping for different categories
const categoryColors: Record<string, string> = {
  repair: 'bg-blue-500 hover:bg-blue-600',
  smartphone: 'bg-green-500 hover:bg-green-600',
  computer: 'bg-purple-500 hover:bg-purple-600',
  tablet: 'bg-orange-500 hover:bg-orange-600',
  laptop: 'bg-indigo-500 hover:bg-indigo-600',
  audio: 'bg-pink-500 hover:bg-pink-600',
  camera: 'bg-red-500 hover:bg-red-600',
  gaming: 'bg-yellow-500 hover:bg-yellow-600',
  service: 'bg-teal-500 hover:bg-teal-600',
  security: 'bg-gray-500 hover:bg-gray-600',
  tips: 'bg-emerald-500 hover:bg-emerald-600',
  guide: 'bg-cyan-500 hover:bg-cyan-600',
  tutorial: 'bg-amber-500 hover:bg-amber-600',
  tech: 'bg-violet-500 hover:bg-violet-600',
  maintenance: 'bg-slate-500 hover:bg-slate-600',
};

const CategoryGrid = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getBlogCategories();

        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryIcon = (categoryName: string) => {
    const lowerName = categoryName.toLowerCase();

    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }

    return <BookOpen className="h-6 w-6" />; // Default icon
  };

  const getCategoryColor = (categoryName: string) => {
    const lowerName = categoryName.toLowerCase();

    for (const [key, color] of Object.entries(categoryColors)) {
      if (lowerName.includes(key)) {
        return color;
      }
    }

    return 'bg-gray-500 hover:bg-gray-600'; // Default color
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Error loading categories: {error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No categories available</p>
      </div>
    );
  }

  return (
    <section className="w-full">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/blogs/categories/${encodeURIComponent(category.name.toLowerCase().replace(/ /g, '-'))}`}
            className="group"
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary bg-white rounded-3xl h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-secondary/10 rounded-xl">
                    {getCategoryIcon(category.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-secondary transition-colors">
                      {capitalizeFirstLetter(category.name)}
                    </h3>
                  </div>
                </div>

                <div className="flex-1 mb-4">
                  {category.description && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-secondary font-medium">
                    Explore category
                  </span>
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                    <svg
                      className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
