import { Metadata } from "next";
import Script from "next/script";
import FAQsContent from "@/components/faqs/FAQsContent";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://lmlelectronics.com";
  
  return {
    title: "FAQ - Frequently Asked Questions | LML Electronics Device Repair Support",
    description: "Find answers to common questions about LML Electronics repair kits, shipping, returns, warranty, and technical support. Get expert guidance for your DIY device repair projects.",
    keywords: "FAQ, frequently asked questions, device repair FAQ, repair kit questions, shipping information, return policy, warranty information, technical support, DIY repair help, repair kit guidance, customer support, repair questions",
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
      canonical: `${baseUrl}/faqs`,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `${baseUrl}/faqs`,
      title: "FAQ - Frequently Asked Questions | LML Electronics",
      description: "Find answers to common questions about LML Electronics repair kits, shipping, returns, warranty, and technical support.",
      siteName: "LML Electronics",
      images: [
        {
          url: `${baseUrl}/images/lml_box.webp`,
          width: 1200,
          height: 630,
          alt: "LML Electronics FAQ - Frequently Asked Questions",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "FAQ - Frequently Asked Questions | LML Electronics",
      description: "Find answers to common questions about LML Electronics repair kits, shipping, returns, warranty, and technical support.",
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

export default function FAQsPage() {
  return (
    <>
      <Script
        id="faqs-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": "LML Electronics FAQ",
            "description": "Frequently asked questions about LML Electronics repair kits and services",
            "url": "https://lmlelectronics.com/faqs",
            "publisher": {
              "@type": "Organization",
              "name": "LML Electronics",
              "url": "https://lmlelectronics.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://lmlelectronics.com/logo.png"
              }
            },
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Are your repair parts genuine and high-quality?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, we only stock genuine, high-quality repair parts from reputable manufacturers. All our products come with warranty and are tested for quality assurance before being listed on our site."
                }
              },
              {
                "@type": "Question",
                "name": "How do I know which parts are compatible with my device?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can search for your specific device model on our website, and we'll show you all compatible parts. You can also contact our support team for assistance in finding the right parts for your device."
                }
              },
              {
                "@type": "Question",
                "name": "How long does shipping take?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Standard shipping typically takes 3-5 business days within the continental US. We also offer expedited shipping options for faster delivery. International shipping times vary by location."
                }
              },
              {
                "@type": "Question",
                "name": "Do you offer free shipping?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, we offer free standard shipping on orders over $50. For orders under $50, standard shipping is $5.99."
                }
              },
              {
                "@type": "Question",
                "name": "What is your return policy?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We offer a 30-day return policy for most items. Products must be unused and in original packaging. Some items may have different return policies due to their nature."
                }
              },
              {
                "@type": "Question",
                "name": "What warranty do you offer on your products?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most of our products come with a 1-year warranty. Some items may have extended warranty options available. Please check individual product pages for specific warranty information."
                }
              },
              {
                "@type": "Question",
                "name": "Do you provide technical support for repairs?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, our technical support team is available to help with repair questions and troubleshooting. You can contact us via email, phone, or live chat during business hours."
                }
              },
              {
                "@type": "Question",
                "name": "What payment methods do you accept?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. All payments are processed securely."
                }
              }
            ],
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
                  "name": "FAQ",
                  "item": "https://lmlelectronics.com/faqs"
                }
              ]
            }
          })
        }}
      />

      <FAQsContent />
    </>
  );
} 