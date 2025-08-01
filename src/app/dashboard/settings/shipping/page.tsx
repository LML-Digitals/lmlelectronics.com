import { Metadata } from "next";
import { ShippingManagement } from "@/components/dashboard/shipping/ShippingManagement";

export const metadata: Metadata = {
  title: "Shipping Management",
  description: "Manage shipping rates and zones",
};

export default function ShippingPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Shipping Management
        </h1>
        <p className="text-gray-600">
          Manage shipping rates for different states and territories
        </p>
      </div>

      <ShippingManagement />
    </div>
  );
}
