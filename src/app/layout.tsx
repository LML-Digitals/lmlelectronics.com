import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import AuthProvider from "@/components/common/auth/AuthProvider";
import { ConditionalHeader } from "@/components/ConditionalHeader";
import { ConditionalFooter } from "@/components/ConditionalFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LML Electronics - Find Your Fix",
    template: "%s | LML Electronics",
  },
  description:
    "Your trusted partner for DIY electronic repair solutions. High-quality repair kits, components, and tools for Apple, Samsung, Google devices and more.",
  keywords:
    "electronics repair, DIY repair kits, phone repair, tablet repair, Apple repair, Samsung repair, Google repair, electronic components",
  authors: [{ name: "LML Electronics" }],
  creator: "LML Electronics",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lmlelectronics.com",
    title: "LML Electronics - Find Your Fix",
    description: "Your trusted partner for DIY electronic repair solutions.",
    siteName: "LML Electronics",
  },
  twitter: {
    card: "summary_large_image",
    title: "LML Electronics - Find Your Fix",
    description: "Your trusted partner for DIY electronic repair solutions.",
    creator: "@lmlelectronics",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ConditionalHeader />
          <main className="min-h-screen">{children}</main>
          <ConditionalFooter />
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
