import { getInventoryAudits } from '@/components/dashboard/inventory/audits/services/inventory-audit';
import { AuditTable } from '@/components/dashboard/inventory/audits/audit-table';

export default async function InventoryAdjustmentsPage () {
  const { audits, success } = await getInventoryAudits();

  if (!success) {
    return <div>Error loading adjustments</div>;
  }

  return (
    <div>
      <AuditTable
        audits={audits || []}
      />
    </div>
  );
}
