import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  CreditCard,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import OrderDetailsClient from '@/components/orders/OrderDetailsClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHero from '@/components/PageHero';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata ({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Order #${id
      .slice(-8)
      .toUpperCase()} | Order Details | LML Repair Seattle`,
    description:
      'View your order details, payment information, and track your repair service or product purchase. Complete order history and status updates.',
    keywords:
      'order details, order tracking, repair service order, order status, order history, LML Repair order, purchase details',
  };
}

export default async function OrderDetailPage ({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <PageHero
        title="My Orders"
        subtitle="View and track all your orders with LML Repair"
        backgroundImage="/images/lml_box.webp"
        breadcrumbs={[{ name: 'My Orders', href: '/orders' }]}
      />
      <div className="max-w-7xl mx-auto">
        <OrderDetailsClient orderId={id} />
      </div>
    </>
  );
}
