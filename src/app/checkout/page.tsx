import { Metadata } from 'next';
import CheckoutClient from '@/components/checkout/CheckoutClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

export async function generateMetadata (): Promise<Metadata> {
  return {
    title: 'Secure Checkout | Phone & Electronics Repair Services',
    description: 'Complete your repair service purchase securely. Multiple payment options available. Fast, safe checkout process with instant confirmation. Trusted by thousands of customers in Seattle.',
    keywords: 'repair service checkout, secure payment, phone repair payment, electronics repair payment, same-day repair payment, repair service purchase, secure checkout, repair service booking payment',
  };
}

export default function CheckoutPage () {
  const checkoutStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CheckoutPage',
    name: 'Repair Service Checkout',
    description: 'Secure checkout process for phone and electronics repair services',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.lmlrepair.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Checkout',
          item: 'https://www.lmlrepair.com/checkout',
        },
      ],
    },
  };

  return (
    <>
      <PageHero
        title="Checkout"
        subtitle="Secure checkout process for phone and electronics repair services"
        backgroundImage="/images/lml_box.webp"
        breadcrumbs={[{ name: 'Checkout', href: '/checkout' }]}
      />
      <div className="max-w-7xl mx-auto">
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-300px)]">
          <div className="text-center space-y-20">
            <CheckoutClient />
          </div>
        </div>
      </div>
    </>
  );
}
