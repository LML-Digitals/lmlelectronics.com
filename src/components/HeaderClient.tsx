"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";

interface NavigationItem {
  name: string;
  href: string;
}

interface HeaderClientProps {
  navigation: NavigationItem[];
}

export function HeaderClient({ navigation }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = useCartStore((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <span>📞 1-800-LML-REPAIR</span>
              <span>📧 support@lmlelectronics.com</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>Fast Delivery</span>
              <span>•</span>
              <span>Free Shipping</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/lml_logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="w-10 h-10"
              />
              <div className="ml-2">
                <div className="text-lg font-bold text-gray-900">
                  Electronics
                </div>
                <div className="text-xs text-gray-500 -mt-1">Find Your Fix</div>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="Search for products, repair kits, components..."
              />
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative group">
              <Button variant="ghost" size="sm" className="p-2">
                <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-yellow-600" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-sm"
                    style={{ backgroundColor: "#FDF200" }}
                  >
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-700" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 -mb-px">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-yellow-400 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  placeholder="Search products..."
                />
              </form>
            </div>

            {/* Mobile Navigation Links */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-900 hover:bg-yellow-50 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
