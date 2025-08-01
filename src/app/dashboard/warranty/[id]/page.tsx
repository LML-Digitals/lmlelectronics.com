
import WarrantyDetails from "@/components/dashboard/warranty/WarrantyDetails";


interface PageProps {
  params: Promise<{ id: string }>;
}
export default async function WarrantyDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="container mx-auto py-6">
      <WarrantyDetails warrantyId={id} isCustomer={false}/>
    </div>
  );
}
