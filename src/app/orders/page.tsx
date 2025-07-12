import { Metadata } from "next";

import OrdersClient from "@/components/orders/OrdersClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "My Orders | Order History | LML Repair Seattle",
    description:
      "View your complete order history, track repairs, and manage your purchases. Easy access to all your LML Repair orders and services.",
    keywords:
      "order history, purchase history, repair orders, order tracking, LML Repair orders, repair service history",
  };
}

export default function OrdersPage() {
  const ordersStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "My Orders",
    description: "View and track all your orders with LML Repair",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.lmlrepair.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "My Orders",
          item: "https://www.lmlrepair.com/orders",
        },
      ],
    },
  };

  return (
    <>
    <PageHero
        title="My Orders"
        subtitle="View and track all your orders with LML Repair"
        backgroundImage="/images/lml_box.webp"
        breadcrumbs={[{ name: "My Orders", href: "/orders" }]}
      />
    <main className="max-w-7xl mx-auto mb-16">
      <OrdersClient />
    </main>
    </>
  );
}
