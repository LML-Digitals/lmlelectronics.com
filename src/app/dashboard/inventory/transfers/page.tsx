import InternalTransfersTable from '@/components/dashboard/inventory/transfers/InternalTransfersTable';
import { fetchInternalTransfers } from '@/components/dashboard/inventory/transfers/utils/fetchTransfers';

async function TransfersPage () {
  const { transfers, error } = await fetchInternalTransfers();

  return (
    <div>
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {error ? (
          <p className="text-red-500 text-center mt-10">{error}</p>
        ) : (
          <InternalTransfersTable transfers={transfers} />
        )}
      </div>
    </div>
  );
}

export default TransfersPage;
