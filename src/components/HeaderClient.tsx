"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Search, Menu, X, ChevronDown, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/useCartStore";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildApiUrl, handleApiResponse } from "@/lib/config/api";
import { formatSlug } from "@/components/products/utils/formatSlug";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const totalItems = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(buildApiUrl("/api/inventory/categories"));
        const data: any[] = await handleApiResponse(response);
        const filtered = data
          .filter((cat: any) => cat.visible === true && cat.parentId == null && cat.name !== "Tickets")
          .map((cat: any) => ({ id: cat.id, name: cat.name }));
        setCategories(filtered);
      } catch (err) {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  // Enhanced navigation with categories
  const enhancedNavLinks = [
    {
      id: 1,
      title: "Shop",
      link: "/shop",
      hover: true,
      subLinks: [
        { title: "All Products", link: "/shop" },
        ...categories.map((cat) => ({
          title: cat.name,
          link: `/shop/category/${formatSlug(cat.name)}`,
        })),
      ],
    },
    {
      id: 2,
      title: "Bundles",
      link: "/bundles",
      hover: false,
    },
    // {
    //   id: 3,
    //   title: "Deals",
    //   link: "/deals",
    //   hover: false,
    // },
    {
      id: 4,
      title: "Help",
      link: "#",
      hover: true,
      subLinks: [
        { title: "Contact Us", link: "/contact" },
        { title: "FAQs", link: "/faqs" },
        // { title: "Shipping Info", link: "/shipping" },
        // { title: "Returns", link: "/returns" },
        // { title: "Repair Guides", link: "/repair-guides" },
        // { title: "Track Order", link: "/orders" },
      ],
    },
  ];

  const platformLinks = [
    { id: 1, platform: "Facebook", link: "https://facebook.com/lmlelectronics" },
    { id: 2, platform: "Twitter", link: "https://twitter.com/lmlelectronics" },
    { id: 3, platform: "LinkedIn", link: "https://linkedin.com/company/lmlelectronics" },
    { id: 4, platform: "Instagram", link: "https://instagram.com/lmlelectronics" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 lg:mx-20 mt-4">
          {/* Logo */}
          <Link href={"/"}>
            <Image
              src="/images/lml_logo.png"
              width={60}
              height={60}
              loading="lazy"
              className="hidden xl:block hover:scale-110 hover:delay-100 hover:duration-150 transition-all rounded-xl"
              alt="LML Electronics Logo"
            />
            <Image
              src="/images/lml_logo.png"
              width={50}
              height={50}
              loading="lazy"
              className="hidden lg:block xl:hidden hover:scale-110 hover:delay-100 hover:duration-150 transition-all rounded-xl"
              alt="LML Electronics Logo"
            />
            <Image
              src="/images/lml_logo.png"
              width={45}
              height={45}
              loading="lazy"
              className="lg:hidden hover:scale-110 hover:delay-100 hover:duration-150 transition-all rounded-xl"
              alt="LML Electronics Logo"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-col w-full max-w-3xl mx-8">
            <ul className="flex items-center justify-center gap-8 xl:gap-10 font-semibold mb-4">
              {enhancedNavLinks.map((nav) => (
                <li key={nav?.id}>
                  {nav?.hover ? (
                    <HoverCard>
                      <HoverCardTrigger className="flex items-center gap-3">
                        <span className="underline-animation hover:underline-offset-1 hover:border-b hover:border-secondary">
                          {nav?.title}
                        </span>
                        <ChevronDown size={16} />
                      </HoverCardTrigger>
                      <HoverCardContent
                        className="border-0 rounded-none shadow-lg p-0"
                        sideOffset={20}
                        side="bottom"
                        style={{
                          borderBottom: "1px solid #eaeaea",
                          width: "400px",
                        }}
                      >
                        {nav?.subLinks ? (
                          <div style={{ width: "100%", padding: "1.5rem" }}>
                            <div className="grid grid-cols-1 gap-y-2">
                              {nav.subLinks.map((subLink, index) => (
                                <Link
                                  key={index}
                                  href={subLink.link}
                                  className="block p-2 rounded hover:bg-secondary/10 transition-colors"
                                >
                                  <span className="font-medium text-sm">
                                    {subLink.title}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </HoverCardContent>
                    </HoverCard>
                  ) : (
                    <Link href={nav?.link}>
                      <span className="underline-animation hover:underline-offset-1 hover:border-b hover:border-secondary">
                        {nav?.title}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(!searchOpen)}
                className="h-9 w-9 p-0"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
              {searchOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                  <form onSubmit={handleSearch} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-3 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      placeholder="Search products..."
                      autoFocus
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Account/Orders */}
            <Link href="/orders" className="relative group">
              <Button variant="ghost" size="sm" className="p-2">
                <span className="text-sm font-medium text-gray-700 group-hover:text-secondary">Orders</span>
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative group">
              <Button variant="ghost" size="sm" className="p-2">
                <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-secondary" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-6 w-6 text-gray-700" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader className="pt-6 px-6">
                    <SheetTitle>
                      <Link href="/" className="flex items-center gap-4">
                        <Image
                          src="/images/lml_logo.png"
                          width={40}
                          height={40}
                          alt="LML Electronics Logo"
                          className="rounded-md"
                        />
                        <h1>LML Electronics</h1>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="flex-1 mt-4">
                    <div className="px-6 pb-6">
                      <ul className="flex flex-col gap-5">
                        {enhancedNavLinks.map((page) => (
                          <div key={page.id}>
                            <div className="flex items-center justify-between cursor-pointer">
                              <Link href={page?.link} className="flex-grow">
                                <li className="font-medium hover:text-gray-500 transition-all">
                                  {page?.title}
                                </li>
                              </Link>
                              {page?.hover && (
                                <ChevronDown size={20} className="transform transition-transform duration-300" />
                              )}
                            </div>
                            {page?.hover && page?.subLinks && (
                              <div className="mt-2 ml-4">
                                <div className="flex flex-col gap-2">
                                  {page.subLinks.map((subLink, index) => (
                                    <Link
                                      key={index}
                                      href={subLink.link}
                                      className="block p-1 rounded hover:bg-secondary/10 text-sm"
                                    >
                                      {subLink.title}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </ul>

                      <Separator className="my-6" />

                      {/* Mobile Search */}
                      <div className="mb-6">
                        <form onSubmit={handleSearch} className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-3 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                            placeholder="Search products..."
                          />
                        </form>
                      </div>

                      {/* Mobile Actions */}
                      <div className="flex flex-col gap-3">
                        <Link href={"/orders"}>
                          <Button className="h-11 w-full transition-all justify-center bg-black hover:bg-gray-800 text-white">
                            My Orders
                          </Button>
                        </Link>
                        <Link href={"/contact"}>
                          <Button className="h-11 w-full transition-all justify-center border border-gray-300 hover:bg-gray-50">
                            Contact Us
                          </Button>
                        </Link>
                      </div>

                      {/* Social Links */}
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-600 mb-3">
                          Follow Us
                        </h3>
                        <div className="flex items-center gap-4">
                          {platformLinks?.map((s) => (
                            <Link key={s.id} href={s?.link} target="_blank">
                              <li className="text-gray-600 hover:text-secondary transition-colors">
                                {s?.platform}
                              </li>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
