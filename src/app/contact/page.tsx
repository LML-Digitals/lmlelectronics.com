import { Metadata } from "next";
import Script from "next/script";
import ContactForm from "@/components/contact/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://lmlelectronics.com";
  
  return {
    title: "Contact Us | LML Electronics - Get Expert Support for Device Repairs",
    description: "Contact LML Electronics for expert support with device repairs, product questions, and technical assistance. Our repair specialists are here to help you with DIY electronics repair projects.",
    keywords: "contact LML Electronics, device repair support, technical assistance, repair help, customer service, electronics repair questions, DIY repair support, product support, repair guidance, customer care",
    authors: [{ name: "LML Electronics" }],
    creator: "LML Electronics",
    publisher: "LML Electronics",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/contact`,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `${baseUrl}/contact`,
      title: "Contact Us | LML Electronics - Get Expert Support",
      description: "Contact LML Electronics for expert support with device repairs, product questions, and technical assistance.",
      siteName: "LML Electronics",
      images: [
        {
          url: `${baseUrl}/images/lml_box.webp`,
          width: 1200,
          height: 630,
          alt: "Contact LML Electronics for Expert Device Repair Support",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Contact Us | LML Electronics - Get Expert Support",
      description: "Contact LML Electronics for expert support with device repairs, product questions, and technical assistance.",
      images: [`${baseUrl}/images/lml_box.webp`],
      creator: "@lmlelectronics",
      site: "@lmlelectronics",
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
}

export default function ContactPage() {
  return (
    <>
      <Script
        id="contact-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact LML Electronics",
            "description": "Contact LML Electronics for expert support with device repairs and technical assistance",
            "url": "https://lmlelectronics.com/contact",
            "publisher": {
              "@type": "Organization",
              "name": "LML Electronics",
              "url": "https://lmlelectronics.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://lmlelectronics.com/logo.png"
              }
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "support@lmlelectronics.com",
              "availableLanguage": "English"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://lmlelectronics.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Contact Us",
                  "item": "https://lmlelectronics.com/contact"
                }
              ]
            }
          })
        }}
      />

      <main className="min-h-screen bg-white flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Contact Us</h1>
          <p className="text-gray-600 mb-8 text-center">
            Have a question or need help? Fill out the form below and our team will get back to you as soon as possible.
          </p>
          
          <ContactForm />
        </div>
      </main>
    </>
  );
} 