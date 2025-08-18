'use client';

import { ShoppingBag, TruckIcon, CheckCircle2, Clock } from 'lucide-react';

export default function ProductsBenefits () {
  const benefits = [
    {
      icon: <ShoppingBag className="h-6 w-6 text-secondary" />,
      title: 'Premium Products',
      description: 'High-quality products built to last',
    },
    {
      icon: <TruckIcon className="h-6 w-6 text-secondary" />,
      title: 'Fast Shipping',
      description: 'Free shipping on orders over $50',
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-secondary" />,
      title: 'Warranty Included',
      description: 'All products come with warranty',
    },
    {
      icon: <Clock className="h-6 w-6 text-secondary" />,
      title: '24/7 Support',
      description: 'Expert support when you need it',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-lg shadow-sm"
            >
              <div className="mb-4 p-3 rounded-full bg-secondary bg-opacity-20">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
