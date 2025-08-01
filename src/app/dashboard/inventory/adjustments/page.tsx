import { getInventoryAdjustments } from "@/components/dashboard/inventory/adjustments/services/inventory-adjustment";
import { AdjustmentTable } from "@/components/dashboard/inventory/adjustments/adjustment-table";
export default async function InventoryAdjustmentsPage() {
  const { adjustments, success } = await getInventoryAdjustments(1);

  if (!success) {
    return <div>Error loading adjustments</div>;
  }
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <AdjustmentTable
        adjustments={adjustments || []}
      />
    </div>
  );
}
