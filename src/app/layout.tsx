import React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';
import AuthProvider from '@/components/common/auth/AuthProvider';
import { ConditionalHeader } from '@/components/ConditionalHeader';
import { ConditionalFooter } from '@/components/ConditionalFooter';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'LML Electronics - Premium Device Repair Kits & Components | DIY Electronics Repair',
    template: '%s | LML Electronics',
  },
  description:
    "Transform your device repairs with LML Electronics' premium repair kits and components. High-quality parts for phones, tablets, and laptops. Expert support, fast shipping, and 30-day warranty. Shop now for professional-grade repair solutions.",
  keywords:
    'device repair kits, phone repair parts, tablet repair components, laptop repair tools, DIY electronics repair, Apple repair parts, Samsung repair kits, Google device repair, high-quality repair components, professional repair tools, electronics repair kits, mobile device repair, tablet screen replacement, phone battery replacement, repair tool sets',
  authors: [{ name: 'LML Electronics' }],
  creator: 'LML Electronics',
  publisher: 'LML Electronics',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://lmlelectronics.com'),
  alternates: {
    canonical: 'https://lmlelectronics.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lmlelectronics.com',
    title: 'LML Electronics - Premium Device Repair Kits & Components',
    description: "Transform your device repairs with LML Electronics' premium repair kits and components. High-quality parts for phones, tablets, and laptops with expert support.",
    siteName: 'LML Electronics',
    images: [
      {
        url: 'https://lmlelectronics.com/images/lml_box.webp',
        width: 1200,
        height: 630,
        alt: 'LML Electronics Premium Repair Kits and Components',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LML Electronics - Premium Device Repair Kits & Components',
    description: "Transform your device repairs with LML Electronics' premium repair kits and components. High-quality parts for phones, tablets, and laptops.",
    images: ['https://lmlelectronics.com/images/lml_box.webp'],
    creator: '@lmlelectronics',
    site: '@lmlelectronics',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout ({
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
