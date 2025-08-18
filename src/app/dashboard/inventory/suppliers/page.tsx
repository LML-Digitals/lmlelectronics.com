import SuppliersTable from '@/components/dashboard/inventory/supplier/VendorsTable';
import { fetchSuppliers } from '@/components/dashboard/inventory/supplier/utils/fetchSuppliers';

const Locations = async () => {
  const { suppliers, error } = await fetchSuppliers();

  return (
    <div>
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {error ? (
          <p className="text-red-500 text-center mt-10">{error}</p>
        ) : suppliers && Array.isArray(suppliers) ? (
          <SuppliersTable suppliers={suppliers} />
        ) : (
          <p className="text-center">No vendors found.</p>
        )}
      </div>
    </div>
  );
};

export default Locations;
