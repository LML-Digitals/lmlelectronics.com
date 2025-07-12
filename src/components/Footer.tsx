"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import NewsletterComp from "@/components/NewsletterComp";
import { Facebook, Instagram, Linkedin, Youtube, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PaymentMethods from "@/components/PaymentMethods";

const FooterClient = () => {
  const QuickLinks = [
    { id: 1, link: "Products", href: "/products" },
    { id: 2, link: "Bundles", href: "/bundles" },
    { id: 3, link: "Cart", href: "/cart" },
    { id: 4, link: "Orders", href: "/orders" },
  ];

  const Categories = [
    { id: 1, link: "Phone Repair", href: "/products/category/phone-repair" },
    { id: 2, link: "Tablet Repair", href: "/products/category/tablet-repair" },
    { id: 3, link: "Laptop Repair", href: "/products/category/laptop-repair" },
    { id: 4, link: "Gaming Console", href: "/products/category/gaming-console" },
  ];

  const Support = [
    { id: 1, link: "Contact Us", href: "/contact" },
    { id: 2, link: "FAQs", href: "/faqs" },
    { id: 3, link: "Shipping Info", href: "/shipping" },
    { id: 4, link: "Returns", href: "/returns" },
    { id: 5, link: "Repair Guides", href: "/repair-guides" },
  ];

  const platforms = [
    {
      id: 1,
      platform: <Facebook size={24} />,
      href: "https://facebook.com/lmlelectronics",
    },
    {
      id: 2,
      platform: <Youtube size={24} />,
      href: "https://youtube.com/lmlelectronics",
    },
    {
      id: 3,
      platform: <Instagram size={24} />,
      href: "https://instagram.com/lmlelectronics",
    },
    {
      id: 4,
      platform: <Linkedin size={24} />,
      href: "https://linkedin.com/company/lmlelectronics",
    },
    {
      id: 5,
      platform: <Twitter size={24} />,
      href: "https://twitter.com/lmlelectronics",
    },
  ];

  const bottomLinks = [
    { id: 1, link: "Privacy Policy", href: "/privacy" },
    { id: 2, link: "Terms & Conditions", href: "/terms" },
    { id: 3, link: "Refund Policy", href: "/refunds" },
  ];

  return (
    <div className="bg-black px-10 lg:px-10 xl:px-40 lg:w-screen pt-20 pb-14">
      <div className="text-white flex flex-col items-center justify-center gap-10 md:items-center lg:items-start md:justify-center lg:flex-row lg:justify-between">
        <div className="flex flex-col items-center lg:items-start gap-4 w-full">
          <Link href={"/"}>
            <Image
              src="/images/lml_logo.png"
              width={70}
              height={70}
              alt="LML Electronics Logo"
              className="rounded-lg hover:scale-105 transition-all"
            />
          </Link>
          <NewsletterComp />
        </div>

        <div className="flex mt-10 justify-center md:items-start md:justify-center lg:mt-0 md:flex-row gap-10 md:gap-14 w-full">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col justify-center gap-3 h-3/4">
              <h1 className="font-bold">Quick Links</h1>
              <ul className="flex flex-col gap-3">
                {QuickLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="hover:text-secondary"
                  >
                    <li className="text-sm text-gray-400 hover:text-secondary">
                      {link.link}
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center gap-3 h-3/4">
              <h1 className="font-bold">Categories</h1>
              <ul className="flex flex-col gap-3">
                {Categories.map((category) => (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="hover:text-secondary"
                  >
                    <li className="text-sm text-gray-400 hover:text-secondary">
                      {category.link}
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 h-3/4">
            <h1 className="font-bold">Support</h1>
            <ul className="flex flex-col gap-3">
              {Support.map((support) => (
                <Link
                  key={support.id}
                  href={support.href}
                  className="hover:text-secondary"
                >
                  <li className="text-sm text-gray-400 hover:text-secondary">
                    {support.link}
                  </li>
                </Link>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center gap-3 h-3/4">
            <h1 className="font-bold">Contact</h1>
            <ul className="flex flex-col gap-3">
              <li className="text-sm text-gray-400">
                support@lmlelectronics.com
              </li>
              <li className="text-sm text-gray-400">
                1-800-LML-ELECTRONICS
              </li>
              <li className="text-sm text-gray-400">
                Mon-Fri: 9AM-6PM EST
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center mt-10 gap-3 md:mt-10 lg:mt-0 w-full">
          <h1 className="font-bold text-center">
            Follow Us
          </h1>
          <div className="flex flex-col items-center justify-center mt-6 md:mt-0 md:items-center lg:justify-start gap-6 md:w-96">
            <ul className="flex items-center gap-3 mt-2">
              {platforms.map((social) => (
                <Link 
                  key={social.id} 
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <li className="hover:text-secondary hover:scale-110 transition-all">
                    {social.platform}
                  </li>
                </Link>
              ))}
            </ul>
            <div className="text-center">
              <p className="text-xs text-gray-300 font-extralight">
                Your trusted partner for DIY electronic repair solutions. High-quality repair kits, components, and tools for Apple, Samsung, Google devices and more.
                <br />
                <br />
                All product and company names are trademarks of their respective holders. iPhone, iPad, iPod, iPod touch, Mac and iMac are registered trademarks and property of Apple, Inc. LML Electronics is a third-party repair company and is not affiliated with Apple.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 mt-6">
                <ul className="flex items-center justify-center gap-3">
                  {bottomLinks.map((link, index) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      className="flex items-center gap-3 hover:text-secondary"
                    >
                      <li className="text-xs text-white hover:underline hover:underline-offset-1 hover:text-secondary">
                        {link.link}
                      </li>
                      {index < bottomLinks.length - 1 && (
                        <Separator
                          orientation="vertical"
                          className="h-2 text-white"
                        />
                      )}
                    </Link>
                  ))}
                </ul>
                {/* Payment Methods Row */}
                <PaymentMethods />
                <p className="text-xs text-gray-400">
                  &copy; {new Date().getFullYear()} LML Electronics. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterClient;
