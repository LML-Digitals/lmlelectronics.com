import { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";
import PageHero from "@/components/PageHero";


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shopping Cart | Phone & Electronics Repair Parts | LML Repair Seattle",
    description: "Review your selected phone and electronics repair parts, accessories, and services. Secure checkout with multiple payment options. Free shipping on orders over $50. Expert repair services in Seattle.",
    keywords: "phone repair parts Seattle, electronics repair parts, repair accessories, secure checkout, free shipping, repair services Seattle, device parts, phone accessories, repair tools, payment options, iPhone repair parts, Samsung repair parts, phone screen replacement, battery replacement parts",
  };
};

export default function CartPage() {
  const cartStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Shopping Cart",
    description: "Review your selected phone and electronics repair parts, accessories, and services",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.lmlrepair.com"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shopping Cart",
          item: "https://www.lmlrepair.com/cart"
        }
      ]
    }
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LML Repair",
    url: "https://www.lmlrepair.com",
    logo: "https://www.lmlrepair.com/images/logo.png",
    sameAs: [
      "https://www.facebook.com/lmlrepair",
      "https://www.instagram.com/lmlrepair",
      "https://twitter.com/lmlrepair"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-206-555-0123",
      contactType: "customer service",
      areaServed: "Seattle",
      availableLanguage: "English"
    }
  };

  const shoppingCartStructuredData = {
    "@context": "https://schema.org",
    "@type": "ShoppingCart",
    name: "LML Repair Shopping Cart",
    description: "Shopping cart for phone and electronics repair parts and services",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "LML Repair"
      }
    }
  };

  return (
    <>
    <PageHero
        title="Your Shopping Cart"
        subtitle="Review your selected items. Secure checkout with multiple payment options available."
        backgroundImage="/images/lml_box.webp"
        breadcrumbs={[{ name: "Your Shopping Cart", href: "/cart" }]}
      />
    <div className="max-w-7xl mx-auto">
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-300px)]">
        <div className="text-center space-y-20">
          <CartPageClient />
        </div>
      </div>
    </div>
    </>
  );
}
