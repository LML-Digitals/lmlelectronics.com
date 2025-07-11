import { Clock, DollarSign, Package, Shield } from "lucide-react";

export default function BundleBenefits() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Save Up to 25%",
      description: "Bundle multiple repairs for maximum savings",
    },
    {
      icon: Clock,
      title: "Time Efficient",
      description: "Get all repairs done in one service appointment",
    },
    {
      icon: Shield,
      title: "Extended Warranty",
      description: "Additional warranty coverage on bundled services",
    },
    {
      icon: Package,
      title: "Customizable",
      description: "Create your own bundle based on your needs",
    },
  ];

  return (
    <div className="py-6 md:py-8">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 text-black">
        Why Choose Our Bundles?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-4 md:p-6 bg-white rounded-3xl shadow-sm border border-secondary"
          >
            <benefit.icon className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 text-secondary" />
            <h3 className="font-semibold mb-2 text-black">
              {benefit.title}
            </h3>
            <p className="text-sm md:text-base text-black/70">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
